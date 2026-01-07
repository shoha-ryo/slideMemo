// src/app/actions/getTasks.ts
"use server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Board, Label } from "@prisma/client";
import { emptyTasks } from "./emptyTasks";

type CardWithLabels = Prisma.CardGetPayload<{
  include: { labels: true };
}>;

interface DiffTasks {
  diffTasks: typeof emptyTasks;
}

interface GetInitialData extends DiffTasks {
  newLastSyncAt: number;
  projectTitle: string;
}

export async function getInitialData(
  userId: string,
  projectId: string,
  lastSyncAt: number,
): Promise<GetInitialData> {
  // 1. 基本的なプロジェクト情報の取得
  // lastSyncAtが0の場合は、ログではなく実データを全部持ってくる
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: userId },
    include: {
      // 0 の場合は実データを一括取得、そうでなければ空（後でログから取る）
      boards: lastSyncAt === 0,
      cards:
        lastSyncAt === 0
          ? {
              include: { labels: true },
            }
          : false,
      labels: true, //lastSyncAt === 0, ラベルの変更も後でログに保存しよう
      activityLog: {
        where: { createdAt: { gt: new Date(lastSyncAt) } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!project) throw new Error("Project not found");

  // フォーマッター関数
  const formatCard = (c: CardWithLabels) => {
    return {
      id: c.id,
      title: c.title,
      details: c.details,
      boardId: c.boardId,
      parentId: c.parentId,
      childrenIds: c.childrenIds,
      projectId: c.projectId,
      status: c.status,
      progress: c.progress,
      simpleView: c.simpleView,
      labelIds: c.labels.map((label) => label.id),
      // --- Date型を number(ミリ秒)に変換 ---
      startAt: c.startAt ? c.startAt.getTime() : null,
      dueAt: c.dueAt ? c.dueAt.getTime() : null,
      createdAt: c.createdAt.getTime(),
      updatedAt: c.updatedAt.getTime(),
    };
  };

  const formatBoard = (b: Board) => ({
    ...b,
    createdAt: b.createdAt.getTime(),
    updatedAt: b.updatedAt.getTime(),
  });

  const formatLabel = (l: Label) => ({
    ...l,
    createdAt: l.createdAt.getTime(),
    updatedAt: l.updatedAt.getTime(),
  });

  // --- A. 全件取得モード (lastSyncAt === 0) ---
  if (lastSyncAt === 0) {
    return {
      diffTasks: {
        createTasks: {
          boardOrder: project.boardOrder,
          boards: project.boards.map(formatBoard),
          cards: (project.cards as CardWithLabels[]).map(formatCard),
          labels: project.labels.map(formatLabel),
        },
        updateTasks: { boardOrder: [], boards: [], cards: [], labels: [] },
        deleteTasks: {
          boardOrder: [],
          boardIds: [],
          cardIds: [],
          labelIds: [],
        },
      },
      newLastSyncAt: project.updatedAt.getTime(),
      projectTitle: project.title,
    };
  }

  // --- B. 差分取得モード (既存のロジック) ---
  const ids = {
    card: {
      create: new Set<string>(),
      update: new Set<string>(),
      delete: new Set<string>(),
    },
    board: {
      create: new Set<string>(),
      update: new Set<string>(),
      delete: new Set<string>(),
    },
    label: {
      create: new Set<string>(),
      update: new Set<string>(),
      delete: new Set<string>(),
    },
  }; // [new Set<string>]はダブりを自動排除してくれる

  project.activityLog.forEach((log) => {
    const type =
      log.entityType === "CARD"
        ? "card"
        : log.entityType === "BOARD"
          ? "board"
          : log.entityType === "LABEL"
            ? "label"
            : null;

    if (!type) return;

    const action = log.action as "CREATE" | "UPDATE" | "DELETE";

    if (action === "DELETE") {
      ids[type].delete.add(log.entityId);
      ids[type].create.delete(log.entityId);
      ids[type].update.delete(log.entityId);
    } else if (action === "CREATE") {
      ids[type].create.add(log.entityId);
    } else if (action === "UPDATE") {
      if (!ids[type].create.has(log.entityId)) {
        ids[type].update.add(log.entityId);
      }
    }
  });

  const [
    createBoards,
    updateBoards,
    createCards,
    updateCards,
    createLabels,
    updateLabels,
  ] = await Promise.all([
    prisma.board.findMany({
      where: { id: { in: Array.from(ids.board.create) } },
    }),
    prisma.board.findMany({
      where: { id: { in: Array.from(ids.board.update) } },
    }),
    prisma.card.findMany({
      where: { id: { in: Array.from(ids.card.create) } },
      include: { labels: true },
    }),
    prisma.card.findMany({
      where: { id: { in: Array.from(ids.card.update) } },
      include: { labels: true },
    }),
    prisma.label.findMany({
      where: { id: { in: Array.from(ids.label.create) } },
    }),
    prisma.label.findMany({
      where: { id: { in: Array.from(ids.label.update) } },
    }),
  ]);

  return {
    diffTasks: {
      createTasks: {
        boardOrder: project.boardOrder,
        boards: createBoards.map(formatBoard),
        cards: createCards.map(formatCard),
        labels: createLabels.map(formatLabel),
      },
      updateTasks: {
        boardOrder: [],
        boards: updateBoards.map(formatBoard),
        cards: updateCards.map(formatCard),
        labels: updateLabels.map(formatLabel),
      },
      deleteTasks: {
        boardOrder: [],
        boardIds: Array.from(ids.board.delete),
        cardIds: Array.from(ids.card.delete),
        labelIds: Array.from(ids.label.delete),
      },
    },
    newLastSyncAt: project.updatedAt.getTime(),
    projectTitle: project.title,
  };
}
