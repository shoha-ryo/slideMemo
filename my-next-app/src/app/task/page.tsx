// src/app/task/page.tsx
import { prisma } from "@/lib/prisma";
import AppContent from "./AppContent";
import { AppState } from "@/types/TasksType";

export default async function TaskPage() {
  // DBからデータを取得（サーバー側で実行される）
  const dbConfig = await prisma.appConfig.findUnique({ where: { id: 1 } });
  const dbBoards = await prisma.board.findMany({ include: { cards: true } });

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

  const initialData = {
    boardOrder: dbConfig?.boardOrder || dbBoards.map((b) => b.id),
    boards: boardsObj,
    cards: cardsObj,
  };

  return <AppContent initialData={initialData} />;
}
