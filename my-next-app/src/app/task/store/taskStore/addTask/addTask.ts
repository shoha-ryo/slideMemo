import { v4 as uuidv4 } from "uuid"
import { CardType, BoardType, Source, AppState } from "@/types/task";

// 新しいカードの情報を作成
function createNewCard(title: string, parentId: string | null, boardId: string) {
  const newCard: CardType = {
    id: `card-${uuidv4()}`,  // 一意のIDを生成
		parentId: parentId,      // カード内から追加の時のみ
		boardId: boardId,        // 引数で受け取り
    title: title.trim(),     // 引数で受け取り
    details: "",
		status: "active",
		progress: "todo",
		startAt: null,
		dueAt: null,
		simpleView: false,
		childrenIds: []
  };
	return newCard
}

export function addCardLogic(title: string, source: Source, state: AppState): AppState {
	if (!title.trim()) return state;

	const { boardOrder, boards, cards } = state

	// ボードの場合の処理
	if (source.type === "board") {
		const targetBoard: BoardType = source.data
		const newCard = createNewCard(title, null, targetBoard.id);

		return {
			boardOrder,
			boards: {
				...boards,
				[targetBoard.id]: { // 親ボードを更新
					...targetBoard,
					cardIds: [...targetBoard.cardIds, newCard.id]
				}
			},
			cards: {...cards, [newCard.id]: newCard} // 新しいカードを追加
		}
	}

		// カードの場合の処理
	if (source.type === "card") {
		const targetCard: CardType = source.data
		const newCard = createNewCard(title, targetCard.id, targetCard.boardId);

		return {
			boardOrder,
			boards,
			cards: {
				...cards,
				[targetCard.id]: { // 親カードを更新
					...targetCard,
					childrenIds: [newCard.id, ...targetCard.childrenIds]
				},
				[newCard.id]: newCard // 新しいカードを追加
			}
		}
	}

	return state
}