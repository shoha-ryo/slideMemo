import React from "react";

export const SkeletonCard = () => (
  <div
    className={`h-50 w-100 rounded-xl border border-muted bg-card p-4 shadow-sm`}
  >
    <div className="animate-pulse space-y-4">
      {/* タイトル部分の横棒 */}
      <div className="h-4 w-3/4 rounded-full bg-muted-foreground/20" />
      {/* 詳細部分の横棒 */}
      <div className="space-y-2">
        <div className="h-3 w-full rounded-full bg-muted/60" />
        <div className="h-3 w-5/6 rounded-full bg-muted/60" />
      </div>
      {/* 下部のメタデータ用（オプション） */}
      <div className="flex justify-between pt-2">
        <div className="h-2 w-16 rounded-full bg-muted/40" />
        <div className="h-2 w-12 rounded-full bg-muted/40" />
      </div>
    </div>
  </div>
);
