// src/app/task/store/taskStore/updateBoard/updateBoardLogic.ts
import { AppState, BoardType } from "@/types/TasksType";
import { emptyTasks } from "@/app/task/actions/emptyTasks";
import { getObjectDiff } from "@/app/task/actions/getDiff";

/**
 * ボードの情報を更新し、newStateとdiffTasksを返す
 * @param boardId 更新対象のボードID
 * @param updates 更新内容 (Partial<BoardType>形式)
 * @param state 現在のAppState
 * @returns 更新されたnewStateとAPI送信用のdiffTasks
 */
export const updateBoardLogic = (
  boardId: string,
  updates: Partial<BoardType>, // 変更があった差分だけ受け取る
  state: AppState,
) => {
  const targetBoard = state.boards[boardId];

  // 1. 存在チェック
  if (!targetBoard) {
    console.warn(`Board with ID ${boardId} not found for update.`);
    return { newState: state, diffTasks: emptyTasks };
  }

  // 2. 新しいボードオブジェクトを作成 (イミュータブル)
  const updatedBoard: BoardType = {
    ...targetBoard,
    ...updates,
  };

  // 3. 全体のboardsを更新
  const newBoards = {
    ...state.boards,
    [boardId]: updatedBoard,
  };

  // 4. getObjectDiff を使ってAPI送信用の差分を計算
  const diff = getObjectDiff(targetBoard, updatedBoard);

  // 5. 差分がない場合は何もしない
  if (Object.keys(diff).length === 0) {
    return { newState: state, diffTasks: emptyTasks };
  }

  return {
    newState: {
      ...state,
      boards: newBoards,
    },
    diffTasks: {
      ...emptyTasks,
      updateTasks: {
        ...emptyTasks.updateTasks,
        boards: [{ id: boardId, ...diff }],
      },
    },
  };
};
