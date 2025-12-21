// taskStore.tsx

import { create } from "zustand";
import { sampleAppState } from "../../flatData"; // サンプルデータ取得
import { taskActions } from "./taskActions";

import { TaskStore } from "@/types/task";
import { Droplet } from "lucide-react";


export const useTaskStore = create<TaskStore>((set, get) => ({

	activeId: null,
	overId: null,
	dropPosition: null,
	setActiveId: (activeId) => set({activeId}),
	setOverId: (overId) => set({overId}),
	setPayload: ({activeId, overId, dropPosition}) => set(
		{
			activeId: activeId,
			overId: overId,
			dropPosition: dropPosition
		}
	),

	isTaskCreating: false,
	setIsTaskCreating: (isTaskCreating) => set({isTaskCreating}),

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
