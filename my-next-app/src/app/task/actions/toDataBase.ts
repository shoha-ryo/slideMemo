"use server";

import { pusherServer } from "@/lib/pusher-server";
import { emptyTasks } from "./emptyTasks";
import { prisma } from "@/lib/prisma";
import { ActivityLog } from "@prisma/client"; // 必要に応じて型をインポート

type ToDataBase = typeof emptyTasks;

export async function toDataBase(diffTasks: ToDataBase, projectId: string) {
  const { createTasks, updateTasks, deleteTasks } = diffTasks;
  let lastSyncAt: number = 0;

  try {
    // タイムアウトを20秒に設定（大量データ対策）
    await prisma.$transaction(async (tx) => {
      // ログを一括で保存するための配列
      const activityLogsToCreate: any[] = [];
      
      // 更新系のPromiseをまとめて実行するための配列
      const updatePromises: Promise<any>[] = [];

      // =================================================================
      // 1. Create (新規作成) - createMany は高速なのでそのまま維持
      // =================================================================

      // 1-A. カード
      if (createTasks.cards.length > 0) {
        await tx.card.createMany({
          data: createTasks.cards.map((card) => ({
            id: card.id,
            title: card.title,
            details: card.details,
            status: card.status,
            progress: card.progress,
            projectId: projectId,
            parentId: card.parentId,
            boardId: card.boardId,
            simpleView: card.simpleView,
            childrenIds: card.childrenIds,
            startAt: card.startAt ? new Date(card.startAt) : null,
            dueAt: card.dueAt ? new Date(card.dueAt) : null,
          })),
          skipDuplicates: true,
        });
        
        // ログ用配列に追加（DB保存は後で）
        createTasks.cards.forEach(c => activityLogsToCreate.push({
          projectId, entityId: c.id, entityType: "CARD", action: "CREATE"
        }));
      }

      // 1-B. ボード
      if (createTasks.boards.length > 0) {
        await tx.board.createMany({
          data: createTasks.boards.map((board) => ({
            id: board.id,
            title: board.title,
            projectId: board.projectId,
            cardIds: board.cardIds,
          })),
          skipDuplicates: true,
        });

        createTasks.boards.forEach(b => activityLogsToCreate.push({
          projectId, entityId: b.id, entityType: "BOARD", action: "CREATE"
        }));
      }

      // 1-C. ラベル
      if (createTasks.labels.length > 0) {
        await tx.label.createMany({
          data: createTasks.labels.map((label) => ({
            id: label.id,
            name: label.name,
            color: label.color,
            projectId,
          })),
          skipDuplicates: true,
        });

        createTasks.labels.forEach(l => activityLogsToCreate.push({
          projectId, entityId: l.id, entityType: "LABEL", action: "CREATE"
        }));
      }

      // =================================================================
      // 2. Update (既存データの更新) - Promise.all で並列化
      // =================================================================

      const {
        boards: updateBoards,
        cards: updateCards,
        labels: updateLabels,
        boardOrder,
      } = updateTasks;

      // 2-A. カードの更新
      if (updateCards.length > 0) {
        updateCards.forEach((card) => {
          if (!card.id) return;
          
          // Promise配列に追加
          updatePromises.push(
            tx.card.update({
              where: { id: card.id },
              data: {
                title: card.title,
                details: card.details,
                status: card.status,
                progress: card.progress,
                parentId: card.parentId,
                boardId: card.boardId,
                simpleView: card.simpleView,
                startAt: card.startAt !== undefined ? (card.startAt ? new Date(card.startAt) : null) : undefined,
                dueAt: card.dueAt !== undefined ? (card.dueAt ? new Date(card.dueAt) : null) : undefined,
                childrenIds: card.childrenIds ? { set: card.childrenIds } : undefined,
                labels: card.labelIds ? { set: card.labelIds.map((id) => ({ id })) } : undefined,
              },
            })
          );
          
          activityLogsToCreate.push({
            projectId, entityId: card.id, entityType: "CARD", action: "UPDATE"
          });
        });
      }

      // 2-B. ボードの更新
      if (updateBoards.length > 0) {
        updateBoards.forEach((board) => {
          if (!board.id) return;

          updatePromises.push(
            tx.board.update({
              where: { id: board.id },
              data: {
                title: board.title,
                cardIds: board.cardIds ? { set: board.cardIds } : undefined,
              },
            })
          );

          activityLogsToCreate.push({
            projectId, entityId: board.id, entityType: "BOARD", action: "UPDATE"
          });
        });
      }

      // 2-C. ラベルの更新
      if (updateLabels.length > 0) {
        updateLabels.forEach((label) => {
          if (!label.id) return;

          updatePromises.push(
            tx.label.update({
              where: { id: label.id },
              data: {
                name: label.name,
                color: label.color,
              },
            })
          );

          activityLogsToCreate.push({
            projectId, entityId: label.id, entityType: "LABEL", action: "UPDATE"
          });
        });
      }

      // 2-X. ボード順序の更新
      if (boardOrder && boardOrder.length > 0) {
        updatePromises.push(
          tx.project.update({
            where: { id: projectId },
            data: { boardOrder: { set: boardOrder } },
          })
        );
      }

      // ★ ここですべての Update 処理を並列実行
      await Promise.all(updatePromises);


      // =================================================================
      // 3. Delete (削除)
      // =================================================================

      // 3-A. カードの削除
      if (deleteTasks.cardIds.length > 0) {
        await tx.card.deleteMany({
          where: { id: { in: deleteTasks.cardIds } },
        });
        deleteTasks.cardIds.forEach(id => activityLogsToCreate.push({
          projectId, entityId: id, entityType: "CARD", action: "DELETE"
        }));
      }

      // 3-B. ボードの削除
      if (deleteTasks.boardIds.length > 0) {
        await tx.board.deleteMany({
          where: { id: { in: deleteTasks.boardIds } },
        });
        deleteTasks.boardIds.forEach(id => activityLogsToCreate.push({
          projectId, entityId: id, entityType: "BOARD", action: "DELETE"
        }));
      }

      // 3-C. ラベルの削除
      if (deleteTasks.labelIds.length > 0) {
        await tx.label.deleteMany({
          where: { id: { in: deleteTasks.labelIds } },
        });
        deleteTasks.labelIds.forEach(id => activityLogsToCreate.push({
          projectId, entityId: id, entityType: "LABEL", action: "DELETE"
        }));
      }

      // =================================================================
      // 4. Finalize (ログ保存 & タイムスタンプ取得)
      // =================================================================

      // ★ アクティビティログを1回のクエリでまとめて保存
      if (activityLogsToCreate.length > 0) {
        await tx.activityLog.createMany({
          data: activityLogsToCreate,
        });
      }

      // プロジェクトの最新更新日時を取得
      const latestProject = await tx.project.findUnique({
        where: { id: projectId },
        select: { updatedAt: true },
      });

      lastSyncAt = latestProject?.updatedAt.getTime() || Date.now();

    }, {
      maxWait: 5000,
      timeout: 20000 // タイムアウトを20秒に延長
    });

    // Pusherへの通知
    await pusherServer.trigger(`project-${projectId}`, "task-updated", {
      diffTasks: diffTasks,
      lastSyncAt: lastSyncAt,
    });

    return { success: true };
  } catch (error) {
    console.error("Database sync failed:", error);
    throw error;
  }
}