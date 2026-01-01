"use server";

import { pusherServer } from "@/lib/pusher-server";
import { PrismaClient } from "@prisma/client";
import { emptyTasks } from "./emptyTasks";

const prisma = new PrismaClient();

type ToDataBase = typeof emptyTasks;

export async function toDataBase(diffTasks: ToDataBase, projectId: string) {
  const createTasks = diffTasks.createTasks;
  const updateTasks = diffTasks.updateTasks;
  const deleteTasks = diffTasks.deleteTasks;

  try {
    await prisma.$transaction(async (tx) => {
      // =================================================================
      // 1. Create (新規作成)
      // =================================================================

      // 1-A. ボードの作成
      if (createTasks.boards.length > 0) {
        // createMany は高速ですが、個別のバリデーションが必要な場合はループに変更してください
        await tx.board.createMany({
          data: createTasks.boards.map((board) => ({
            id: board.id,
            title: board.title,
            projectId: board.projectId,
            cardIds: board.cardIds, // 初期状態のIDリスト
          })),
          skipDuplicates: true, // 念のための安全策
        });
      }

      // 1-B. カードの作成
      if (createTasks.cards.length > 0) {
        await tx.card.createMany({
          data: createTasks.cards.map((card) => ({
            id: card.id,
            title: card.title,
            details: card.details,
            status: card.status,
            progress: card.progress,
            parentId: card.parentId,
            boardId: card.boardId,
            simpleView: card.simpleView,
            childrenIds: card.childrenIds,
            // 型変換: number (timestamp) -> Date オブジェクト
            startAt: card.startAt ? new Date(card.startAt) : null,
            dueAt: card.dueAt ? new Date(card.dueAt) : null,
          })),
          skipDuplicates: true,
        });
      }

      // =================================================================
      // 2. Update (既存データの更新)
      // =================================================================

      const {
        boards: updateBoards,
        cards: updateCards,
        boardOrder,
      } = updateTasks;

      // 2-A. カードの更新
      if (updateCards.length > 0) {
        for (const card of updateCards) {
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
              startAt:
                card.startAt !== undefined
                  ? card.startAt
                    ? new Date(card.startAt)
                    : null
                  : undefined,
              dueAt:
                card.dueAt !== undefined
                  ? card.dueAt
                    ? new Date(card.dueAt)
                    : null
                  : undefined,
              // 配列は set で上書き
              childrenIds: card.childrenIds
                ? { set: card.childrenIds }
                : undefined,
            },
          });
        }
      }

      // 2-B. ボードの更新
      if (updateBoards.length > 0) {
        for (const board of updateBoards) {
          if (!board.id) continue;

          await tx.board.update({
            where: { id: board.id },
            data: {
              title: board.title,
              // 配列は set で上書き（重要：ここに新規作成したカードIDが含まれる可能性がある）
              cardIds: board.cardIds ? { set: board.cardIds } : undefined,
            },
          });
        }
      }

      // 2-C. ボード順序の更新
      if (boardOrder && boardOrder.length > 0) {
        await tx.project.update({
          where: { id: projectId },
          data: {
            boardOrder: { set: boardOrder },
          },
        });
      }

      // =================================================================
      // 3. Delete (削除)
      // =================================================================

      // 3-A. カードの削除
      if (deleteTasks.cardIds.length > 0) {
        await tx.card.deleteMany({
          where: {
            id: { in: deleteTasks.cardIds },
          },
        });
      }

      // 3-B. ボードの削除
      if (deleteTasks.boardIds.length > 0) {
        await tx.board.deleteMany({
          where: {
            id: { in: deleteTasks.boardIds },
          },
        });
      }
    }); // --- トランザクション終了 ---

    // Pusherへの通知
    await pusherServer.trigger(`project-${projectId}`, "task-updated", {
      diff: diffTasks,
    });

    return { success: true };
  } catch (error) {
    console.error("Database sync failed:", error);
    throw error;
  }
}
