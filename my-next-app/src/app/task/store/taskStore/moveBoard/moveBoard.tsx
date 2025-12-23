// @/store/taskStore/moveBoard/moveBoardLogic.ts
import { Payload, AppState } from "@/types/task";

export const moveBoardLogic = (payload: Payload, state: AppState): AppState => {
  const { activeId, overId } = payload;
  const { boardOrder, cards } = state;

  // 移動元と移動先が同じ、またはどちらかが欠けている場合は何もしない
  if (!activeId || !overId || activeId === overId) return state;

	let newOverId = overId

	if (overId.includes("card-")) {
		newOverId = cards[overId].boardId
	}

  // 現在のインデックスを取得
  const oldIndex = boardOrder.indexOf(activeId);
  const newIndex = boardOrder.indexOf(newOverId);

  // どちらかのIDが配列内に存在しない場合はエラー回避のため中断
  if (oldIndex === -1 || newIndex === -1) return state;

  // 新しい配列を作成して並び替え
  const newBoardOrder = [...boardOrder];
  const [removed] = newBoardOrder.splice(oldIndex, 1);
  newBoardOrder.splice(newIndex, 0, removed);

  return {
    ...state,
    boardOrder: newBoardOrder,
  };
};