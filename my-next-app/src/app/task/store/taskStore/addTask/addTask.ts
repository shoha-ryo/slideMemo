import { v4 as uuidv4 } from "uuid"
import { CardType, BoardType, Source, AppState } from "@/types/task";
import { getObjectDiff } from "@/app/task/actions/getDiff";
import { emptyTasks } from "@/app/task/actions/emptyTasks";
import { ReturnTasks } from "@/types/task";

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

export function addCardLogic(title: string, source: Source, state: AppState): ReturnTasks {
	if (!title.trim())
		return {
			newState: state,
			diffTasks: emptyTasks
		};

	const { boardOrder, boards, cards } = state

	// ボードの場合の処理
	if (source.type === "board") {
		const targetBoard: BoardType = source.data
		const newCard = createNewCard(title, null, targetBoard.id);
		const newTargetBoard = {
			...targetBoard,
			cardIds: [...targetBoard.cardIds, newCard.id]
		}

		const updateBoard = [{
			id: targetBoard.id,
			...getObjectDiff(targetBoard, newTargetBoard)
		}];

		return {
			newState: {
				...state,
				boards: {
					...boards,
					[targetBoard.id]: newTargetBoard // 親ボードを更新
				},
				cards: {...cards, [newCard.id]: newCard} // 新しいカードを追加
			},
			diffTasks: {
				...emptyTasks,
				createTasks: {
					...emptyTasks.createTasks,
					cards: [newCard],
				},
				updateTasks: {
					...emptyTasks.updateTasks,
					boards: updateBoard,
				}
			}
		};
	}

		// カードの場合の処理
	if (source.type === "card") {
		const targetCard: CardType = source.data
		const newCard = createNewCard(title, targetCard.id, targetCard.boardId);
		const newTargetCard = {
			...targetCard,
			childrenIds: [newCard.id, ...targetCard.childrenIds]
		}

		const updateCard = [{
			id: targetCard.id,
			...getObjectDiff(targetCard, newTargetCard)
		}];

		return {
			newState: {
				...state,
				cards: {
					...cards,
					[targetCard.id]: newTargetCard, // 親カードを更新
					[newCard.id]: newCard // 新しいカードを追加
				}
			},
			diffTasks: {
				...emptyTasks,
				createTasks: {
					...emptyTasks.createTasks,
					cards: [newCard],
				},
				updateTasks: {
					...emptyTasks.updateTasks,
					cards: updateCard as Partial<CardType>[],
				}
			}
		};
	}

	return {
			newState: state,
			diffTasks: emptyTasks
		};
}