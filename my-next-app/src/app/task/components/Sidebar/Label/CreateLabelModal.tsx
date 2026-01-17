import React, { useState, useEffect } from "react";
import { useTaskStore } from "@/app/task/store/taskStore/taskStore";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Palette } from "lucide-react";
import { DraggableLabel } from "./Label";
import { LabelType } from "@/app/task/store/taskStore/types/TasksType";
import { Pipette } from "lucide-react";

const presetColors = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#71717a",
];

interface CreateLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateLabelModal = ({
  isOpen,
  onClose,
}: CreateLabelModalProps) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setColor("#3b82f6");
    }
  }, [isOpen]);

  const { createLabel } = useTaskStore.getState();
  // プレビュー用のダミーデータを作成
  const previewLabel: LabelType = {
    id: "preview-id",
    name: name || "ラベル名称なし",
    color: color,
    projectId: "preview-project",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // 外側クリック用のハンドラー
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-[400px] overflow-hidden rounded-xl border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Palette size={18} />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">
            新規ラベル追加
          </h2>
          <button
            onClick={onClose}
            className="ml-auto rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* プレビューエリア */}
        <div className="mb-8 flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 py-8">
          <span className="mb-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Preview
          </span>
          <div className="pointer-events-none max-w-full px-12 scale-125 transition-transform">
            <DraggableLabel label={previewLabel} cardId="preview" />
          </div>
        </div>

        <div className="space-y-6">
          {/* ラベル名入力 */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
              ラベル名称
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-accent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 重要, アイデア..."
            />
          </div>

          {/* カラー選択 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                ラベルカラー
              </label>
              <span className="font-mono text-[10px] text-muted-foreground uppercase">
                {color}
              </span>
            </div>

            <div className="grid grid-cols-6 gap-3">
              {presetColors.map((c) => (
                <button
                  key={c}
                  className={`group relative flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 ${
                    color === c
                      ? "ring-2 ring-ring ring-offset-2 ring-offset-card"
                      : "hover:ring-2 hover:ring-muted"
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                >
                  {color === c && (
                    <div className="h-2 w-2 rounded-full bg-white shadow-sm" />
                  )}
                </button>
              ))}
              {/* カスタムカラーピッカー */}
              <div
                className={`relative h-10 w-10 flex items-center justify-center rounded-full border transition-all hover:scale-110 cursor-pointer shadow-sm active:scale-95
									${
                    !presetColors.includes(color)
                      ? "ring-2 ring-ring ring-offset-2 ring-offset-card" // カスタム色選択中
                      : "border-input bg-muted/30 hover:bg-muted text-muted-foreground" // 未選択時
                  }
								`}
                style={{
                  backgroundColor: !presetColors.includes(color)
                    ? color
                    : undefined,
                }}
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 h-[200%] w-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer opacity-0"
                />

                {/* カスタム色選択時は白ドット、そうでなければスポイトアイコン */}
                {!presetColors.includes(color) ? (
                  <div className="h-2 w-2 rounded-full bg-white shadow-sm" />
                ) : (
                  <Pipette size={16} strokeWidth={2.5} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="mt-8 flex gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 hover:bg-muted"
          >
            キャンセル
          </Button>
          <Button
            onClick={() => createLabel(name, color)}
            disabled={!name}
            className="flex-1 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-30"
          >
            保存する
          </Button>
        </div>
      </div>
    </div>
  );
};
