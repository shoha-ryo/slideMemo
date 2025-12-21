import React from "react";
import { useDroppable } from "@dnd-kit/core";

export const TRASH_ID = "trash-drop-area";

type Props = {
  isVisible: boolean; // ドラッグ中かどうか
};

export default function TrashDropArea({ isVisible }: Props) {
  // ドロップ可能エリアとして登録
  const { setNodeRef, isOver } = useDroppable({
    id: TRASH_ID,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "80px", // エリアの高さ
        backgroundColor: isOver ? "rgba(255, 0, 0, 1)" : "rgba(200, 0, 0, 1)", // ホバー時に濃くする
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "3.5rem",
        fontWeight: "bold",
        zIndex: 100, // DragOverlayよりは下、ボードよりは上にする
        transition: "transform 0.3s ease-in-out", // スライドアニメーション
        transform: isVisible ? "translateY(0)" : "translateY(100%)", // 表示・非表示の切り替え
        pointerEvents: isVisible ? "auto" : "none", // 非表示時はクリック等を無効化
      }}
    >
      ×
    </div>
  );
}