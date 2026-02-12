// useCacheReset.ts
import { useState } from "react";
import { db } from "../../../dexie/dexie";

export const useCacheReset = () => {
  const [isResetting, setIsResetting] = useState(false);

  const resetCache = async () => {
    const confirmed = window.confirm(
      "PC内の一時保存データを削除し、サーバーから最新データを取得しますか？\n(サーバー上のデータは削除されません)",
    );
    if (!confirmed) return;

    setIsResetting(true);
    try {
      await Promise.all([
        db.projects.clear(),
        db.projectMembers.clear(),
        db.boards.clear(),
        db.cards.clear(),
        db.labels.clear(),
        db.syncMeta.clear(),
      ]);
      window.location.reload();
    } catch (error) {
      alert("エラーが発生しました。");
      setIsResetting(false);
    }
  };

  return { resetCache, isResetting };
};
