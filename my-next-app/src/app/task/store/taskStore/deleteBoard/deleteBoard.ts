// deleteBoard/deleteBoard.ts
import { AppState } from "@/types/task";
import { emptyTasks } from "@/app/task/actions/emptyTasks";
import { ReturnTasks } from "@/types/task";

export const deleteBoardLogic = (boardId: string, state: AppState): ReturnTasks => {
  // 1. 削除対象のボード情報を取得
  const boardToDelete = state.boards[boardId];
  if (!boardToDelete)
		return {
			newState: state,
			diffTasks: emptyTasks
		}

  // 2. そのボードに含まれるカードIDのリストを取得
  const cardIdsToRemove = boardToDelete.cardIds;

  // 3. boards オブジェクトから対象を削除
  const { [boardId]: _, ...remainingBoards } = state.boards;

  // 4. cards オブジェクトから関連カードを削除
  const remainingCards = { ...state.cards };
  cardIdsToRemove.forEach((id) => {
    delete remainingCards[id];
  });

  // 5. boardOrder から対象IDを除外
  const newBoardOrder = state.boardOrder.filter((id) => id !== boardId);

	return {
		newState: {
			...state,
			boardOrder: newBoardOrder,
			boards: remainingBoards,
			cards: remainingCards,
		},
		diffTasks: {
			...emptyTasks,
			updateTasks: {
				...emptyTasks.updateTasks,
				boardOrder: newBoardOrder
			},
			deleteTasks: {
				...emptyTasks.deleteTasks,
				boardIds: [boardId]
				// カードはボード側でカスケードされているので自動削除
			}
		}
	}
};