// taskStore.tsx

import { create } from "zustand";
import { taskActions } from "./taskActions";
import { db } from "../../../../../dexie/dexie";
import {
  CardType,
  TaskStore,
} from "@/app/task/store/taskStore/types/TasksType";
import {
  toLocalDataBase,
  updateLocalSyncMeta,
} from "../../actions/toLocalDataBase";
import { getInitialData } from "../../actions/getInitialData";
import { produce } from "immer";
import { useUserStore } from "@/store/userStore";

export const useTaskStore = create<TaskStore>((set, get) => ({
  activeId: null,
  overId: null,
  dropPosition: null,
  activeOriginalLabelId: null,
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

  userId: useUserStore.getState().user?.id,
  project: null,
  projectId: null,
  projectTitle: null,
  initializeToken: null,
  setProjectId: (projectId) => set({ projectId }),
  setProjectTitle: (projectTitle) => set({ projectTitle }),

  boardOrder: [],
  boards: {},
  cards: {},
  labels: {},
  setBoardOrder: (boardOrder) => set({ boardOrder }),
  setBoards: (boards) => set({ boards }),
  setCards: (cards) => set({ cards }),

  addLabelToCard: (cardId, labelId) =>
    set(
      produce((state) => {
        const card: CardType = state.cards[cardId];
        if (card && !card.labelIds.includes(labelId)) {
          // 既にラベルが付いていないかチェック
          // 配列自体が入っていない＝prismaに登録？でもデータ全取得できないぞ
          // とりあえずprisma更新だ。
          card.labelIds.push(labelId);
        }
      }),
    ),

  // タスクのCRUD操作
  ...taskActions(set, get),

  // ...既存のステート...
  syncStatus: "initializing",

  // 🚀 初期ロード処理
  initializeProject: async (userId: string, projectId: string) => {
    set({ syncStatus: "initializing" });

    // 1. まずローカルDBから取得
    const localCards = await db.cards.where({ projectId }).toArray();
    const localBoards = await db.boards.where({ projectId }).toArray();
    const localLabels = await db.labels.where({ projectId }).toArray();
    const localProject = await db.projects.get(projectId);
    const syncMeta = await db.syncMeta.get(projectId);

    if (
      localCards.length > 0 ||
      localBoards.length > 0 ||
      localLabels.length > 0
    ) {
      // ローカルにデータがあれば一旦表示
      set({
        cards: Object.fromEntries(localCards.map((c) => [c.id, c])),
        boards: Object.fromEntries(localBoards.map((b) => [b.id, b])),
        labels: Object.fromEntries(localLabels.map((l) => [l.id, l])),
        boardOrder: localProject?.boardOrder || [],
        projectTitle: localProject?.title,
        syncStatus: "syncing", // 外部DBへ確認中ステータス
      });
    } else {
      set({ syncStatus: "syncing" });
    }

    try {
      // 最終同期時刻を取得する
      let lastSyncAt: number;
      if (syncMeta?.lastSyncAt) {
        // ここの条件にlastSyncAtが30日以上前の場合はデータ全取得になるようにする
        lastSyncAt = syncMeta.lastSyncAt;
      } else {
        lastSyncAt = 0; // もし30日以上ローカルDBにアクセスしていなければすべてのデータを再取得する（未実装）
      }
      // let lastSyncAt = 0;
      // console.log("初期データ全取得モード中...");

      const requestToken = crypto.randomUUID(); // リクエストが古いかどうか非同期の後でチェックする
      set({ initializeToken: requestToken });
      // 2. 外部DBから最新データを取得 (差分しか取らないのでtoLocalDataBase()でローカルに保存)
      const { diffTasks, newLastSyncAt, project } = await getInitialData(
        userId,
        projectId,
        lastSyncAt,
      );

      if (requestToken !== get().initializeToken) {
        return; // リクエストが古ければ実行しない
      }

      const newProjectTitle = project.title
        ? project.title
        : "プロジェクト名の取得に失敗しました";

      // 3. 次回のためにローカルDBを最新化
      await toLocalDataBase(diffTasks, project);
      await updateLocalSyncMeta(newLastSyncAt, projectId);

      // 4. Storeを最新に更新(ローカルDB更新後)
      const updatedCards = await db.cards.where({ projectId }).toArray();
      const updatedBoards = await db.boards.where({ projectId }).toArray();
      const updatedLabels = await db.labels.where({ projectId }).toArray();
      const updatedProject = await db.projects.get(projectId);
      console.log(updatedCards, updatedBoards, updatedLabels, updatedProject);

      set({
        cards: Object.fromEntries(updatedCards.map((c) => [c.id, c])),
        boards: Object.fromEntries(updatedBoards.map((b) => [b.id, b])),
        labels: Object.fromEntries(updatedLabels.map((l) => [l.id, l])),
        boardOrder: updatedProject?.boardOrder || [],
        project: project,
        projectTitle: newProjectTitle,
        syncStatus: "synced",
      });
    } catch (e) {
      console.error("Sync failed", e);
      set({ syncStatus: "synced" }); // エラーでも「完了」にしてローディングを解く
    }
  },

  // store更新？
  applyDiff: (diff) => {
    set((state) => {
      const nextCards = { ...state.cards };
      const nextBoards = { ...state.boards };
      const nextLabels = { ...state.labels };

      // =====================================================
      // 1. Delete
      // =====================================================
      diff.deleteTasks?.cardIds?.forEach((id) => {
        delete nextCards[id];
      });

      diff.deleteTasks?.boardIds?.forEach((id) => {
        delete nextBoards[id];
      });

      diff.deleteTasks?.labelIds?.forEach((id) => {
        delete nextLabels[id];
      });

      // =====================================================
      // 2. Update（Partial merge）
      // =====================================================
      diff.updateTasks?.cards?.forEach((patch) => {
        if (patch.id && nextCards[patch.id]) {
          nextCards[patch.id] = {
            ...nextCards[patch.id],
            ...patch,
          };
        }
      });

      diff.updateTasks?.boards?.forEach((patch) => {
        if (patch.id && nextBoards[patch.id]) {
          nextBoards[patch.id] = {
            ...nextBoards[patch.id],
            ...patch,
          };
        }
      });

      diff.updateTasks?.labels?.forEach((patch) => {
        if (patch.id && nextLabels[patch.id]) {
          nextLabels[patch.id] = {
            ...nextLabels[patch.id],
            ...patch,
          };
        }
      });

      // =====================================================
      // 3. Create
      // =====================================================
      diff.createTasks?.cards?.forEach((card) => {
        nextCards[card.id] = card;
      });

      diff.createTasks?.boards?.forEach((board) => {
        nextBoards[board.id] = board;
      });

      diff.createTasks?.labels?.forEach((label) => {
        nextLabels[label.id] = label;
      });

      // =====================================================
      // 4. boardOrder（配列は完全上書き）
      // =====================================================
      const nextBoardOrder =
        diff.updateTasks?.boardOrder?.length > 0
          ? diff.updateTasks.boardOrder
          : diff.createTasks?.boardOrder?.length > 0
            ? diff.createTasks.boardOrder
            : state.boardOrder;

      // =====================================================
      // 5. return (setの中で呼ばれているので値の登録を行なっている)
      // =====================================================
      return {
        cards: nextCards,
        boards: nextBoards,
        labels: nextLabels,
        boardOrder: nextBoardOrder,
      };
    });
  },
}));
