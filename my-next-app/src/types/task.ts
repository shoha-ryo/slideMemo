// export interface Board {
// 	id: string
// 	projectId: string
// 	order: number
// }
// export interface Card {
// 	id: string
// 	title: string
// 	details: string | null
// 	parentId: string | null  // 親カードのID
// 	boardId: string
// 	status: "active" | "archived"
// 	progress: "todo" | "doing" | "done"
// 	startAt: number | null // 開始日
// 	dueAt: number | null  // 完了期限
// 	simpleView: boolean  // シンプル表示の切り替え
// }

export interface TaskStore extends AppState, Payload{
	setActiveId: (activeId: Pick<Payload, "activeId">["activeId"]) => void,
	setOverId: (overId: Pick<Payload, "overId">["overId"]) => void,
	setPayload: (payload: Payload) => void;
  setBoardOrder: (boradOrder: Pick<AppState, "boardOrder">["boardOrder"],) => void;
  setBoards: (boards: Pick<AppState, "boards">["boards"]) => void;
  setCards: (cards: Pick<AppState, "cards">["cards"]) => void;
  moveTask: (payload: Payload) => void;
}

export type Payload = {
  activeId: string | null;
  overId: string | null;
  quadrant: "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | null;
};

export interface CardType {
  id: string;
  parentId: string | null;
  boardId: string;
  title: string;
  details: string;
  status: "active" | "archived";
  progress: "todo" | "doing" | "done";
  startAt: number | null;
  dueAt: number | null;
  simpleView: boolean;

  // ▼ 構造管理用に追加
  childrenIds: string[];
}

export interface BoardType {
  id: string;
  projectId?: string;
  title?: string;

  // ▼ 構造管理用に追加
  cardIds: string[];
}

// アプリのオブジェクト情報
export interface AppState {
  boardOrder: string[]; // まずはボードの順番を取得する。
  boards: { [id: string]: BoardType }; // ボードを並べて、カードの順番も取得する。
  cards: { [id: string]: CardType }; // カードを並べて完了。
}
