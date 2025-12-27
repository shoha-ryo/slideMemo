import { v4 as uuidv4 } from "uuid"
import { CardType, BoardType, Source, AppState } from "@/types/task";
import { emptyTasks } from "@/app/task/actions/emptyTasks";

// 新しいカードの情報を作成
function createNewBoard(title: string) {
  const newBoard: BoardType = {
    id: `board-${uuidv4()}`,  // 一意のIDを生成
		projectId: "",
    title: title.trim(),
		cardIds: [],
  };
	return newBoard
}

export function addBoardLogic(title: string, state: AppState) {
	if (!title.trim())
		return {
			newState: state,
			diffTasks: emptyTasks
		};

	const { boardOrder, boards, cards } = state

	const newBoard = createNewBoard(title);
	const newBoardOrder = [
		...boardOrder,
		newBoard.id
	]

	return {
		newState: {
			...state,
			boardOrder: newBoardOrder,
			boards: {
				...boards,
				[newBoard.id]: newBoard
			},
		},
		diffTasks: {
			...emptyTasks,
			createTasks: {
				...emptyTasks.createTasks,
				boards: [newBoard],
			},
			updateTasks: {
				...emptyTasks.updateTasks,
				boardOrder: newBoardOrder,
			}
		}
	};
}