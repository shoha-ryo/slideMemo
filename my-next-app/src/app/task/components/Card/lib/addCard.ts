import { v4 as uuidv4 } from "uuid"
import { CardType, BoardType } from "@/types/task";

// 新しいカードの情報を作成
function createNewCard(title: string, boardId: string) {
  const newCard: CardType = {
    id: `card-${uuidv4()}`, // 一意のIDを生成
		parentId: null,         // 今後、カード内から追加の際は考慮が必要
		boardId: `${boardId}`,            // 引数で受け取り
    title: title.trim(),    // 引数で受け取り
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


// メイン関数
export function addCardFromBoard(title: string, board: BoardType) {
  if (!title.trim()) return;

	const boardId: string = board.id
  const newCard = createNewCard(title, boardId);

	

  return newCard;
}
