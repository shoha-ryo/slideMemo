// taskStore.tsx

import { create } from "zustand";
import { taskActions } from "./taskActions";
import { db } from "@/lib/dexie";
import { TaskStore } from "@/types/TasksType";
import { toLocalDataBase } from "../../actions/toLocalDataBase";
import { getInitialData } from "../../actions/getTasks";
import { log } from "console";

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



	// ...既存のステート...
  syncStatus: 'initializing',

  // 🚀 初期ロード処理
  initializeProject: async (userId:string, projectId: string) => {
    set({ syncStatus: 'initializing', projectId });

    // 1. まずローカルDBから取得（爆速）
    const localCards = await db.cards.where({ projectId }).toArray();
    const localBoards = await db.boards.toArray();
    const localProject = await db.projects.get(projectId);
		const syncMeta = await db.syncMeta.get(projectId)

    if (localCards.length > 0 || localBoards.length > 0) {
      // ローカルにデータがあれば一旦表示
      set({
        cards: Object.fromEntries(localCards.map(c => [c.id, c])),
        boards: Object.fromEntries(localBoards.map(b => [b.id, b])),
        boardOrder: localProject?.boardOrder || [],
        syncStatus: 'syncing' // 外部DBへ確認中ステータス
      });
    } else {
      set({ syncStatus: 'syncing' });
    }

    try {
			// 最終同期時刻を取得する
			let lastSyncAt: number
			if (syncMeta?.lastSyncAt) { // ここの条件にlastSyncAtが30日以上前の場合はデータ全取得になるようにする
				lastSyncAt = syncMeta.lastSyncAt
			} else {
				lastSyncAt = 0 // もし30日以上ローカルDBにアクセスしていなければすべてのデータを再取得する（未実装）
			}

			console.log("最終更新時刻：", lastSyncAt)

			// 2. 外部DBから最新データを取得 (差分しか取らないのでtoLocalDataBase()でローカルに保存)
			const {diffTasks, newLastSyncAt} = await getInitialData(userId, projectId, lastSyncAt)
			console.log("外部DBから取得(OKぽい)：", diffTasks)

			// 3. 次回のためにローカルDBを最新化
      await toLocalDataBase(diffTasks, projectId, userId, newLastSyncAt)

			// 4. Storeを最新に更新(ローカルDB更新後)
			const localCards = await db.cards.where({ projectId }).toArray();
			const localBoards = await db.boards.toArray();
			const localProject = await db.projects.get(projectId);

			const cardMap = Object.fromEntries(localCards.map((c) => [c.id, c]));
			const boardMap = Object.fromEntries(localBoards.map((b) => [b.id, b]));

			set({
				cards: cardMap,
				boards: boardMap,
				boardOrder: localProject?.boardOrder,
				syncStatus: 'synced'
			});
    } catch (e) {
      console.error("Sync failed", e);
      set({ syncStatus: 'synced' }); // エラーでも「完了」にしてローディングを解く
    }
  },



	applyDiff: (diff, userId) => {
		// 更新者が自分なら処理しない
		// const currentUserId = useUserStore.getState().userId
		// if (currentUserId === userId) return;

		set((state) => {
			// 現在の状態をコピー
			const nextCards = { ...state.cards };
			const nextBoards = { ...state.boards };

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

			console.log(diff,diff.createTasks?.cards)
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
				boardOrder: diff?.updateTasks?.boardOrder?.length > 0 
										? diff?.updateTasks?.boardOrder 
										: state?.boardOrder
			};
		});
	}
}));
