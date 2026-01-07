// @/store/taskStore/moveBoard/moveBoardLogic.ts
import {
  Payload,
  AppState,
  ReturnTasks,
} from "@/app/task/store/taskStore/types/TasksType";
import { emptyTasks } from "@/app/task/actions/emptyTasks";

export const moveBoardLogic = (
  payload: Payload,
  state: AppState,
): ReturnTasks => {
  const { activeId, overId } = payload;
  const { boardOrder, cards } = state;

  // 移動元と移動先が同じ、またはどちらかが欠けている場合は何もしない
  if (!activeId || !overId || activeId === overId)
    return {
      newState: state,
      diffTasks: emptyTasks,
    };

  let newOverId = overId;

  if (overId.includes("card-")) {
    newOverId = cards[overId].boardId;
  }

  // 現在のインデックスを取得
  const oldIndex = boardOrder.indexOf(activeId);
  const newIndex = boardOrder.indexOf(newOverId);

  // どちらかのIDが配列内に存在しない場合はエラー回避のため中断
  if (oldIndex === -1 || newIndex === -1)
    return {
      newState: state,
      diffTasks: emptyTasks,
    };

  // 新しい配列を作成して並び替え
  const newBoardOrder = [...boardOrder];
  const [removed] = newBoardOrder.splice(oldIndex, 1);
  newBoardOrder.splice(newIndex, 0, removed);

  return {
    newState: {
      ...state,
      boardOrder: newBoardOrder,
    },
    diffTasks: {
      ...emptyTasks,
      updateTasks: {
        ...emptyTasks.updateTasks,
        boardOrder: newBoardOrder,
      },
    },
  };
};
