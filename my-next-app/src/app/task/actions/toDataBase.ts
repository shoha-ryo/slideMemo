"use server"

import { pusherServer } from "@/lib/pusher-server"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
import { BoardType, CardType } from "@/types/task"

type ToDataBase = {
  diffTasks: {
    diffBoardOrder: string[]
    diffBoard: Partial<BoardType>[]
    diffCard: Partial<CardType>[]
  },
}

export async function toDataBase({ diffTasks }: ToDataBase) {
	
  const { diffBoard, diffCard, diffBoardOrder } = diffTasks

  try {
    await prisma.$transaction(async (tx) => {
      // 1. カードの更新
      for (const card of diffCard) {
        if (!card.id) continue;

        await tx.card.update({
          where: { id: card.id },
          data: {
            title: card.title,
            details: card.details,
            status: card.status,
            progress: card.progress,
            parentId: card.parentId,
            boardId: card.boardId,
            simpleView: card.simpleView,
            // number | null を Date | null に変換
            startAt: card.startAt !== undefined ? (card.startAt ? new Date(card.startAt) : null) : undefined,
            dueAt: card.dueAt !== undefined ? (card.dueAt ? new Date(card.dueAt) : null) : undefined,
            // スカラー配列の更新
            childrenIds: card.childrenIds ? { set: card.childrenIds } : undefined,
          },
        });
      }

      // 2. ボードの更新
      for (const board of diffBoard) {
        if (!board.id) continue;

        await tx.board.update({
          where: { id: board.id },
          data: {
            title: board.title,
            cardIds: board.cardIds ? { set: board.cardIds } : undefined,
          },
        });
      }

      // 3. ボード順序 (diffBoardOrder) の更新
      // 全体の順序が変わっている場合（配列が空でない場合）に実行
      if (diffBoardOrder && diffBoardOrder.length > 0) {
        // ※ProjectモデルやUserモデルなど、boardOrderを保持している親レコードを更新します。
        // ここでは例として ID "main-project" のレコードを更新するコードにしています。
        await tx.appConfig.update({
          where: { id: 1 }, // 実際の環境に合わせたID指定が必要
          data: {
            boardOrder: { set: diffBoardOrder }
          }
        });
      }
    });

		await pusherServer.trigger("task-board-channel", "task-updated", {
      timestamp: Date.now(),
    });

    return { success: true };
  } catch (error) {
    console.error("Database sync failed:", error);
    // サーバー側でエラーをスローして呼び出し元でキャッチできるようにする
    throw error;
  }
}