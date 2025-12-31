// src/app/actions/getTasks.ts
"use server";
import { prisma } from "@/lib/prisma";
import { AppState } from "@/types/TasksType";

export async function getInitialData(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: userId,
    },
  });
  if (!project) {
    throw new Error("プロジェクトが見つからないか、権限がありません。");
  }

  const dbBoards = await prisma.board.findMany({
    where: { projectId: projectId },
    include: { cards: true },
  });

  // ストアが期待する形式（Object形式）に変換
  const boardsObj: Pick<AppState, "boards">["boards"] = {};
  const cardsObj: Pick<AppState, "cards">["cards"] = {};

  dbBoards.forEach((board) => {
    const { cards: _, ...boardData } = board;
    boardsObj[boardData.id] = {
      ...boardData,
    };
    board.cards.forEach((card) => {
      cardsObj[card.id] = {
        ...card,
        // Dateオブジェクトを文字列に変換してシリアライズエラーを防ぐ
        startAt: card.startAt ? Number(card.startAt) : null,
        dueAt: card.dueAt ? Number(card.dueAt) : null,
        createdAt: Number(card.createdAt),
        updatedAt: Number(card.updatedAt),
      };
    });
  });

  return {
    title: project.title,
    boardOrder:
      project.boardOrder.length > 0
        ? project.boardOrder
        : dbBoards.map((b) => b.id),
    boards: boardsObj,
    cards: cardsObj,
  };
}
