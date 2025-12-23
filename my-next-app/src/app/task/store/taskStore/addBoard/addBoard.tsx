import { v4 as uuidv4 } from "uuid"
import { CardType, BoardType, Source, AppState } from "@/types/task";

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

export function addBoardLogic(title: string, state: AppState): AppState {
	if (!title.trim()) return state;

	const { boardOrder, boards, cards } = state

	const newBoard = createNewBoard(title);

	return {
		boardOrder: [
			...boardOrder,
			newBoard.id
		],
		boards: {
			...boards,
			[newBoard.id]: newBoard
		},
		cards
	}

}