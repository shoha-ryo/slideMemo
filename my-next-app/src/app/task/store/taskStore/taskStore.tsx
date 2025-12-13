// taskStore.tsx

import { create } from "zustand";
import { sampleAppState } from "../../flatData"; // サンプルデータ取得
import { taskActions } from "./taskActions";

import { TaskStore } from "@/types/task";

export const useTaskStore = create<TaskStore>((set, get) => ({
  // サンプルの初期値(後でDBと接続)
  boardOrder: sampleAppState.boardOrder,
  boards: sampleAppState.boards,
  cards: sampleAppState.cards,
  setBoardOrder: (boardOrder) => set({ boardOrder }),
  setBoards: (boards) => set({ boards }),
  setCards: (cards) => set({ cards }),

  // タスクのCRUD操作
  ...taskActions(set, get),
}));
