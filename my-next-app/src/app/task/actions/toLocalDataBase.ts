import { db } from "../../../../dexie/dexie";
import { emptyTasks } from "./emptyTasks";

export const toLocalDataBase = async (
  diff: typeof emptyTasks, // 更新データ
  projectId: string, // プロジェクトの存在確認のため...もしかして不要かも？
) => {
  try {
    // トランザクションで一括処理（途中でエラーが出たらロールバックされるので安全）
    await db.transaction(
      "rw",
      [db.cards, db.boards, db.labels, db.projects, db.syncMeta],
      async () => {
        // =========================================================
        //  以下はカード・ボード・ラベルごとにCUD処理をまとめて記載しています。
        // =========================================================

        // カードの処理
        if (diff.createTasks.cards.length > 0) {
          await db.cards.bulkPut(diff.createTasks.cards);
        }
        if (diff.updateTasks.cards.length > 0) {
          await Promise.all(
            diff.updateTasks.cards.map((patch) => {
              const { id, ...updates } = patch;
              return db.cards.update(id, updates);
            }),
          );
        }
        if (diff.deleteTasks.cardIds.length > 0) {
          await db.cards.bulkDelete(diff.deleteTasks.cardIds);
        }

        // ボードの処理
        if (diff.createTasks.boards.length > 0) {
          await db.boards.bulkPut(diff.createTasks.boards);
        }
        if (diff.updateTasks.boards.length > 0) {
          await Promise.all(
            diff.updateTasks.boards.map((patch) => {
              const { id, ...updates } = patch;
              return db.boards.update(id, updates);
            }),
          );
        }
        if (diff.deleteTasks.boardIds.length > 0) {
          await db.boards.bulkDelete(diff.deleteTasks.boardIds);
        }

        // ラベルの処理
        if (diff.createTasks.labels.length > 0) {
          await db.labels.bulkPut(diff.createTasks.labels);
        }
        if (diff.updateTasks.labels.length > 0) {
          await Promise.all(
            diff.updateTasks.labels.map((patch) => {
              const { id, ...updates } = patch;
              return db.labels.update(id, updates);
            }),
          );
        }
        if (diff.deleteTasks.labelIds.length > 0) {
          await db.labels.bulkDelete(diff.deleteTasks.labelIds);
        }

        // 並び順 (projectMetaなど)
        const latestOrder =
          diff.createTasks.boardOrder.length > 0
            ? diff.createTasks.boardOrder
            : diff.updateTasks.boardOrder;
        if (latestOrder.length > 0) {
          await db.projects.update(projectId, {
            boardOrder: latestOrder,
            updatedAt: Date.now(),
          });
        }
      },
    );
  } catch (error) {
    console.error("Failed to sync Dexie (DiffTasks):", error);
  }
};

export const updateLocalSyncMeta = async (
  newLastSyncAt: number,
  projectId: string,
) => {
  try {
    // トランザクションで一括処理（途中でエラーが出たらロールバックされるので安全）
    await db.transaction("rw", [db.syncMeta], async () => {
      await db.syncMeta.put({
        id: projectId,
        lastSyncAt: newLastSyncAt,
      });
    });
  } catch (error) {
    console.error("Failed to sync Dexie (SyncMeta):", error);
  }
};
