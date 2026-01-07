import { db } from "../../../../dexie/dexie";
import { emptyTasks } from "./emptyTasks";

export const toLocalDataBase = async (
  diff: typeof emptyTasks,
  projectId: string,
  projectTitle: string,
  userId: string,
  newLastSyncAt: number,
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
          // まず、そのプロジェクトがDexieに存在するか確認
          const existingProject = await db.projects.get(projectId);
          if (existingProject) {
            // 【2回目以降】データがあるので、並び順だけ「更新」
            await db.projects.update(projectId, {
              title: projectTitle,
              boardOrder: latestOrder,
              updatedAt: Date.now(),
            });
          } else {
            // 【初回】データがないので、新しくレコードを「作成」
            // ※ project全体の情報を入れる必要があります
            console.log("タイトル：", projectTitle);
            await db.projects.put({
              id: projectId,
              title: projectTitle,
              userId: userId, // 引数などで渡す
              boardOrder: latestOrder,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
          }
        }
        await db.syncMeta.put({
          id: projectId,
          lastSyncAt: newLastSyncAt,
        });
      },
    );
  } catch (error) {
    console.error("Failed to sync Dexie:", error);
  }
};
