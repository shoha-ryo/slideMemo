// taskStore.tsx

import { create } from "zustand";
import { taskActions } from "./taskActions";

import { TaskStore } from "@/types/TasksType";

export const useTaskStore = create<TaskStore>((set, get) => ({
  activeId: null,
  overId: null,
  dropPosition: null,
  setActiveId: (activeId) => set({ activeId }),
  setOverId: (overId) => set({ overId }),
  setPayload: ({ activeId, overId, dropPosition }) =>
    set({
      activeId: activeId,
      overId: overId,
      dropPosition: dropPosition,
    }),

  isTaskCreating: false,
  setIsTaskCreating: (isTaskCreating) => set({ isTaskCreating }),

  projectId: null,
  projectTitle: null,
  setProjectId: (projectId) => set({ projectId }),
  setProjectTitle: (projectTitle) => set({ projectTitle }),

  boardOrder: [],
  boards: {},
  cards: {},
  setBoardOrder: (boardOrder) => set({ boardOrder }),
  setBoards: (boards) => set({ boards }),
  setCards: (cards) => set({ cards }),

  // タスクのCRUD操作
  ...taskActions(set, get),
}));
