// src/app/actions/getTasks.ts
"use server";
import { prisma } from "@/lib/prisma";
import { BoardType, CardType } from "@/types/TasksType";

// 戻り値の型定義
export interface DiffTasks {
  createTasks: {
    boardOrder: string[];
    boards: BoardType[]; // BoardType
    cards: CardType[];  // CardType
  };
  updateTasks: {
    boardOrder: string[];
    boards: BoardType[]; // Partial<BoardType>
    cards: CardType[];  // Partial<CardType>
  };
  deleteTasks: {
    boardOrder: string[];
    boardIds: string[];
    cardIds: string[];
  };
}

export async function getInitialData(userId: string, projectId: string, lastSyncAt: number) {
  // 1. 基本的なプロジェクト情報の取得
  // lastSyncAtが0の場合は、ログではなく実データを全部持ってくる
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: userId },
    include: {
      // 0 の場合は実データを一括取得、そうでなければ空（後でログから取る）
      boards: lastSyncAt === 0,
      cards: lastSyncAt === 0,
      activityLog: {
        where: { createdAt: { gt: new Date(lastSyncAt) } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

	console.log("project", project?.boardOrder);

  if (!project) throw new Error("Project not found");

  // フォーマッター関数
  const formatCard = (c: any) => ({
    ...c,
    startAt: c.startAt ? c.startAt.getTime() : null,
    dueAt: c.dueAt ? c.dueAt.getTime() : null,
    createdAt: c.createdAt.getTime(),
    updatedAt: c.updatedAt.getTime(),
  });

  const formatBoard = (b: any) => ({
    ...b,
    createdAt: b.createdAt.getTime(),
    updatedAt: b.updatedAt.getTime(),
  });

  // --- A. 全件取得モード (lastSyncAt === 0) ---
  if (lastSyncAt === 0) {
    return {
      diffTasks: {
        createTasks: {
          boardOrder: project.boardOrder,
          boards: (project as any).boards.map(formatBoard),
          cards: (project as any).cards.map(formatCard),
        },
        updateTasks: { boardOrder: [], boards: [], cards: [] },
        deleteTasks: { boardOrder: [], boardIds: [], cardIds: [] },
      },
      newLastSyncAt: project.updatedAt.getTime(),
    };
  }

  // --- B. 差分取得モード (既存のロジック) ---
  const ids = {
    card: { create: new Set<string>(), update: new Set<string>(), delete: new Set<string>() },
    board: { create: new Set<string>(), update: new Set<string>(), delete: new Set<string>() },
  };

  project.activityLog.forEach((log) => {
    const type = log.entityType === "CARD" ? "card" : "board";
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

  const [createBoards, updateBoards, createCards, updateCards] = await Promise.all([
    prisma.board.findMany({ where: { id: { in: Array.from(ids.board.create) } } }),
    prisma.board.findMany({ where: { id: { in: Array.from(ids.board.update) } } }),
    prisma.card.findMany({ where: { id: { in: Array.from(ids.card.create) } } }),
    prisma.card.findMany({ where: { id: { in: Array.from(ids.card.update) } } }),
  ]);

  return {
    diffTasks: {
      createTasks: {
        boardOrder: project.boardOrder,
        boards: createBoards.map(formatBoard),
        cards: createCards.map(formatCard),
      },
      updateTasks: {
        boardOrder: [],
        boards: updateBoards.map(formatBoard),
        cards: updateCards.map(formatCard),
      },
      deleteTasks: {
        boardOrder: [],
        boardIds: Array.from(ids.board.delete),
        cardIds: Array.from(ids.card.delete),
      },
    },
    newLastSyncAt: project.updatedAt.getTime(),
  };
}