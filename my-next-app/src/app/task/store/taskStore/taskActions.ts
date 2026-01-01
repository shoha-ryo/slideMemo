"taskActions.ts";

import {
  TaskStore,
  Payload,
  Source,
  CardType,
  BoardType,
} from "@/types/TasksType";

import { applyMoveLogic } from "./moveTask/applyMoveLogic";
import { addCardLogic } from "./addTask/addTask";
import { deleteCardLogic } from "./deleteTask/deleteTask";
import { updateCardLogic } from "./updateTask/updateTask";
import { moveBoardLogic } from "./moveBoard/moveBoard";
import { addBoardLogic } from "./addBoard/addBoard";
import { deleteBoardLogic } from "./deleteBoard/deleteBoard";
import { updateBoardLogic } from "./updateBoard/updateBoard";

import { updateCheckForToDB } from "../../actions/updateCheckForToDB";
import { useUserStore } from "@/store/userStore";

export const taskActions = (
  set: (
    state: Partial<TaskStore> | ((state: TaskStore) => Partial<TaskStore>),
  ) => void,
  get: () => TaskStore,
) => ({

  moveTask: (payload: Payload) => {
    // storeの状態を取得
    const state = get();
    // 移動ロジックを実行
    const { newState, diffTasks } = applyMoveLogic(payload, state);

    if (!state.projectId) return;
    // storeの状態を更新
    set(newState);
    // DBへ登録
    updateCheckForToDB(diffTasks, state.projectId);
  },

  addTask: (title: string, source: Source) => {
    // storeの状態を取得
    const state = get();
    // 追加ロジックを実行
    const { newState, diffTasks } = addCardLogic(title, source, state);

    if (!state.projectId) return;
    // storeの状態を更新
    set(newState);
    updateCheckForToDB(diffTasks, state.projectId);
  },

  deleteTask: (cardId: string) => {
    // storeの状態を取得
    const state = get();
    // 削除ロジックを実行
    const { newState, diffTasks } = deleteCardLogic(cardId, state);

    if (!state.projectId) return;
    // storeの状態を更新
    set(newState);
    updateCheckForToDB(diffTasks, state.projectId);
  },

  updateTask: (cardId: string, updates: Partial<CardType>) => {
    // storeの状態を取得
    const state = get();
    // 削除ロジックを実行
    const { newState, diffTasks } = updateCardLogic(cardId, updates, state);

    if (!state.projectId) return;
    // storeの状態を更新
    set(newState);
    updateCheckForToDB(diffTasks, state.projectId);
  },

  moveBoard: (payload: Payload) => {
    // storeの状態を取得
    const state = get();
    // 移動ロジックを実行
    const { newState, diffTasks } = moveBoardLogic(payload, state);

    if (!state.projectId) return;
    // storeの状態を更新
    set(newState);
    updateCheckForToDB(diffTasks, state.projectId);
  },

  addBoard: (title: string) => {
    // storeの状態を取得
    const state = get();
    // 追加ロジックを実行
    const { newState, diffTasks } = addBoardLogic(title, state);

    if (!state.projectId) return;
    // storeの状態を更新
    set(newState);
    updateCheckForToDB(diffTasks, state.projectId);
  },

  deleteBoard: (cardId: string) => {
    // storeの状態を取得
    const state = get();
    // 削除ロジックを実行
    const { newState, diffTasks } = deleteBoardLogic(cardId, state);

    if (!state.projectId) return;
    // storeの状態を更新
    set(newState);
    updateCheckForToDB(diffTasks, state.projectId);
  },

  updateBoard: (boardId: string, updates: Partial<BoardType>) => {
    // storeの状態を取得
    const state = get();
    // 削除ロジックを実行
    const { newState, diffTasks } = updateBoardLogic(boardId, updates, state);

    if (!state.projectId) return;
    // storeの状態を更新
    set(newState);
    updateCheckForToDB(diffTasks, state.projectId);
  },
});
