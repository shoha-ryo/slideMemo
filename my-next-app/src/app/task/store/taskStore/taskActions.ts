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
    // storeの状態を更新
    set(newState);
    // DBへ登録
    updateCheckForToDB(diffTasks);
  },

  addTask: (title: string, source: Source) => {
    // storeの状態を取得
    const state = get();
    // 追加ロジックを実行
    const { newState, diffTasks } = addCardLogic(title, source, state);
    // storeの状態を更新
    set(newState);

    updateCheckForToDB(diffTasks);
  },

  deleteTask: (cardId: string) => {
    // storeの状態を取得
    const state = get();
    // 削除ロジックを実行
    const { newState, diffTasks } = deleteCardLogic(cardId, state);
    // storeの状態を更新
    set(newState);

    updateCheckForToDB(diffTasks);
  },

  updateTask: (cardId: string, updates: Partial<CardType>) => {
    // storeの状態を取得
    const state = get();
    // 削除ロジックを実行
    const { newState, diffTasks } = updateCardLogic(cardId, updates, state);
    // storeの状態を更新
    set(newState);

    updateCheckForToDB(diffTasks);
  },

  moveBoard: (payload: Payload) => {
    // storeの状態を取得
    const state = get();
    // 移動ロジックを実行
    const { newState, diffTasks } = moveBoardLogic(payload, state);
    // storeの状態を更新
    set(newState);

    updateCheckForToDB(diffTasks);
  },

  addBoard: (title: string) => {
    // storeの状態を取得
    const state = get();
    // 追加ロジックを実行
    const { newState, diffTasks } = addBoardLogic(title, state);
    // storeの状態を更新
    set(newState);

    updateCheckForToDB(diffTasks);
  },

  deleteBoard: (cardId: string) => {
    // storeの状態を取得
    const state = get();
    // 削除ロジックを実行
    const { newState, diffTasks } = deleteBoardLogic(cardId, state);
    // storeの状態を更新
    set(newState);

    updateCheckForToDB(diffTasks);
  },

  updateBoard: (boardId: string, updates: Partial<BoardType>) => {
    // storeの状態を取得
    const state = get();
    // 削除ロジックを実行
    const { newState, diffTasks } = updateBoardLogic(boardId, updates, state);
    // storeの状態を更新
    set(newState);
    console.log(diffTasks);
    updateCheckForToDB(diffTasks);
  },
});
