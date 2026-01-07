// type/task.ts

import { emptyTasks } from "@/app/task/actions/emptyTasks";

export interface TaskStore extends AppState, Payload {
  setActiveId: (activeId: Pick<Payload, "activeId">["activeId"]) => void;
  setOverId: (overId: Pick<Payload, "overId">["overId"]) => void;
  setPayload: (payload: Payload) => void;

  projectId: string | null;
  projectTitle: string | null;
  setProjectId: (projectId: string) => void;
  setProjectTitle: (projectTitle: string) => void;

  setBoardOrder: (boardOrder: Pick<AppState, "boardOrder">["boardOrder"]) => void;
  setBoards: (boards: Pick<AppState, "boards">["boards"]) => void;
  setCards: (cards: Pick<AppState, "cards">["cards"]) => void;

  addTask: (title: string, source: Source) => void;
  addBoard: (title: string) => void;
	addLabelToCard: (labelId: string, cardId: string) => void,
  moveTask: (payload: Payload) => void;
  moveBoard: (payload: Payload) => void;
  deleteTask: (cardId: string) => void;
  deleteBoard: (boardId: string) => void;
	// deleteLabelFromCard:
  updateTask: (cardId: string, updates: Partial<CardType>) => void;
  updateBoard: (boardId: string, updates: Partial<BoardType>) => void;

  isTaskCreating: boolean;
  setIsTaskCreating: (isTaskCreating: boolean) => void;

	syncStatus: "initializing" | "syncing" | "synced"
	initializeProject: (userId: string, projectId: string) => void,
	applyDiff: (diffTasks: typeof emptyTasks, userId: string) => void
}

export type Payload = {
  activeId: string | null;
  overId: string | null;
  dropPosition: "top" | "bottom" | "center" | null;
};

export type Source =
  | { type: "board"; data: BoardType }
  | { type: "card"; data: CardType }
  | { type: "boardList"; data: null };

export interface BoardType {
  id: string;
  projectId: string;
  title: string;
  cardIds: string[];
	createdAt: number;
  updatedAt: number;
}

export interface CardType {
  id: string;
	projectId: string
  parentId: string | null;
  boardId: string;
  title: string;
  details: string | "";
  status: "active" | "archived";
  progress: "todo" | "doing" | "done";
  startAt: number | null;
  dueAt: number | null;
  simpleView: boolean;
  childrenIds: string[];
	labelIds: string[]
  createdAt: number;
  updatedAt: number;
}

export interface LabelType {
	id: string
	name: string
	color: string
	projectId: string
	createdAt: number
	updatedAt: number
}

// アプリのオブジェクト情報
export interface AppState {
  boardOrder: string[]; // まずはボードの順番を取得する。
	boards: Record<string, BoardType>;
  cards: Record<string, CardType>;
  labels: Record<string, LabelType>;
}

// 各タスクロジックの戻り値
export type ReturnTasks = {
  newState: AppState;
  diffTasks: typeof emptyTasks;
};
