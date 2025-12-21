type DndRect = {
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
};

// 型定義は必要に応じて更新してください
export type DropPosition = "top" | "bottom" | "center";

export function getDropPosition(
  pointer: { x: number; y: number },
  dropRect: DndRect,
): DropPosition {
  const threshold = 20;

  // 1. 上部 20px 以内
  if (pointer.y < dropRect.top + threshold) {
    return "top";
  }

  // 2. 下部 20px 以内
  if (pointer.y > dropRect.bottom - threshold) {
    return "bottom";
  }

  // 3. それ以外（中央部）
  return "center";
}