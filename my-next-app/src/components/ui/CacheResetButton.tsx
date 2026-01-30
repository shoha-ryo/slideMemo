"use client";

import { db } from "../../../dexie/dexie";
import { Trash2, RefreshCcw } from "lucide-react";
import { useState } from "react";

export const CacheResetButton = () => {
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    const confirmed = window.confirm(
      "ローカルキャッシュを完全に削除しますか？\n(サーバー上のデータは削除されません)"
    );

    if (!confirmed) return;

    setIsResetting(true);
    try {
      // 提示された一括クリア処理
      await Promise.all([
        db.projects.clear(),
        db.projectMembers.clear(),
        db.boards.clear(),
        db.cards.clear(),
        db.labels.clear(),
        db.syncMeta.clear(),
      ]);

      console.log("全データを削除しました");
      
      // データの不整合を防ぐため、リロードして再同期を促す
      window.location.reload();
    } catch (error) {
      console.error("キャッシュクリアに失敗しました:", error);
      alert("エラーが発生しました。");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <button
      onClick={handleReset}
      disabled={isResetting}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
    >
      {isResetting ? (
        <RefreshCcw className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
      {isResetting ? "クリア中..." : "キャッシュをクリア"}
    </button>
  );
};