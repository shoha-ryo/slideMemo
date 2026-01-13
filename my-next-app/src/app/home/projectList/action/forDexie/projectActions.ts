import { useEffect, useState } from "react";
import { db, ProjectEntity } from "../../../../../../dexie/dexie";

export function getLocalProjects(userId: string) {
  const [projects, setProjects] = useState<ProjectEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadAndSyncProjects = async () => {
      // 1. まずローカルのIndexedDBから全プロジェクトを取得（即座に表示！）
      const localProjects = await db.projects
        .where("userId")
        .equals(userId)
        .toArray();

      // ソート順がある場合は適用（boardOrderなどのロジックに準拠）
      setProjects(localProjects);
      setLoading(false);

      try {
        // 2. 最後に同期した時刻を取得
        const syncMeta = await db.syncMeta.get("all_projects_list"); 
        const lastSyncAt = syncMeta?.lastSyncAt || 0;

        // 3. サーバーから「前回同期以降の差分」を取得
        // GET /api/projects?since=123456789 のようなイメージ
        const response = await fetch(`/api/projects?since=${lastSyncAt}`);
        const { updated, deleted } = await response.json();

        // 4. ローカルDBを更新（差分書き込み）
        await db.transaction("rw", db.projects, db.syncMeta, async () => {
          if (updated.length > 0) {
            await db.projects.bulkPut(updated);
          }
          if (deleted.length > 0) {
            await db.projects.bulkDelete(deleted);
          }
          // 最終同期時刻を更新
          await db.syncMeta.put({ 
            id: "all_projects_list", 
            lastSyncAt: Date.now() 
          });
        });

        // 5. 最新の状態を画面に反映
        const latestProjects = await db.projects
          .where("userId")
          .equals(userId)
          .toArray();
        setProjects(latestProjects);

      } catch (error) {
        console.error("Sync failed:", error);
        // 同期に失敗してもローカルデータがあるのでユーザーは操作を続けられる
      }
    };

    loadAndSyncProjects();
  }, [userId]);

  return { projects, loading };
}