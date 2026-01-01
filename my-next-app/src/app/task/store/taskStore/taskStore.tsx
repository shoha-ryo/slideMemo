// taskStore.tsx

import { create } from "zustand";
import { taskActions } from "./taskActions";
import { useUserStore } from "@/store/userStore";

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

	applyDiff: (diff, userId) => {
		// 更新者が自分なら処理しない
		// const currentUserId = useUserStore.getState().userId
		// if (currentUserId === userId) return;

		set((state) => {
			// 現在の状態をコピー
			const nextCards = { ...state.cards };
			const nextBoards = { ...state.boards };

			console.log("差分データ：",diff)
			// --- 1. 削除処理 ---
			diff.deleteTasks?.cardIds?.forEach((id) => {
				delete nextCards[id];
			});
			diff.deleteTasks?.boardIds?.forEach((id) => {
				delete nextBoards[id];
			});

			// --- 2. 更新処理 (Partialマージ) ---
			// Cardsの更新
			diff.updateTasks?.cards?.forEach((patch) => {
				if (patch.id && nextCards[patch.id]) {
					nextCards[patch.id] = { ...nextCards[patch.id], ...patch };
				}
			});
			// Boardsの更新
			diff.updateTasks?.boards?.forEach((patch) => {
				if (patch.id && nextBoards[patch.id]) {
					nextBoards[patch.id] = { ...nextBoards[patch.id], ...patch };
				}
			});

			// --- 3. 追加処理 ---
			diff.createTasks?.cards?.forEach((newCard) => {
				nextCards[newCard.id] = newCard;
			});
			diff.createTasks?.boards?.forEach((newBoard) => {
				nextBoards[newBoard.id] = newBoard;
			});

			// --- 4. 状態の返却 ---
			return {
				cards: nextCards,
				boards: nextBoards,
				// boardOrderは配列なのでそのまま上書き
				boardOrder: diff.updateTasks.boardOrder.length > 0 
										? diff.updateTasks.boardOrder 
										: state.boardOrder
			};
		});
	}
}));
