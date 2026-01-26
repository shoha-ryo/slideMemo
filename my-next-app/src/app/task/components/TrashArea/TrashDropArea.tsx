import { useDndContext } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { Trash2 } from "lucide-react";

export const TRASH_ID = "trash-drop-area";

export default function TrashDropArea() {
  // ドロップ可能エリアとして登録
  const { setNodeRef, isOver } = useDroppable({
    id: TRASH_ID,
  });
	const {active} = useDndContext()

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
        transform:  active ? "translateY(0)" : "translateY(100%)", // 表示・非表示の切り替え
        pointerEvents: active ? "auto" : "none", // 非表示時はクリック等を無効化
      }}
    >
      <Trash2 size={35}></Trash2>
    </div>
  );
}
