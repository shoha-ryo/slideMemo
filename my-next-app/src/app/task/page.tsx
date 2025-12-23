// src/app/task/page.tsx
import { prisma } from "@/lib/prisma";
import AppContent from "./AppContent";

export default async function TaskPage() {
  // DBからデータを取得（サーバー側で実行される）
  const dbConfig = await prisma.appConfig.findUnique({ where: { id: 1 } });
  const dbBoards = await prisma.board.findMany({ include: { cards: true } });

	// console.log("取得状況：", dbConfig, dbBoards)

  // ストアが期待する形式（Object形式）に変換
  const boardsObj: any = {};
  const cardsObj: any = {};

  dbBoards.forEach((board) => {
    boardsObj[board.id] = {
      id: board.id,
      title: board.title,
      projectId: board.projectId,
      cardIds: board.cards.map(c => c.id) // 以前のインターフェースに合わせる
    };
	board.cards.forEach((card) => {
		cardsObj[card.id] = {
			...card,
			childrenIds: [],
			// Dateオブジェクトを文字列に変換してシリアライズエラーを防ぐ
			startAt: card.startAt?.toISOString() || null,
			dueAt: card.dueAt?.toISOString() || null,
			createdAt: card.createdAt.toISOString(),
			updatedAt: card.updatedAt.toISOString(),
		};
		});
  });

  const initialData = {
    boardOrder: dbConfig?.boardOrder || dbBoards.map(b => b.id),
    boards: boardsObj,
    cards: cardsObj,
  };


  return <AppContent initialData={initialData} />;
}