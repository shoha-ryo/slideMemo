"taskActions.ts"

import { TaskStore, Payload, Source } from "@/types/task";

import { applyMoveLogic } from "./moveTask/applyMoveLogic";
import { addCardLogic } from "./addTask/addTask";
import { deleteCardLogic } from "./deleteTask/deleteTask";

export const taskActions = (set: Function, get: () => TaskStore) => ({
  moveTask: (payload: Payload) => {
    // storeの状態を取得
    const state = get();
    // 移動ロジックを実行
    const newState = applyMoveLogic(payload, state);
    // storeの状態を更新
    set(newState);
  },

  addTask: (title: string, source: Source) => {
		// storeの状態を取得
    const state = get();
		// 追加ロジックを実行
		const newState = addCardLogic(title, source, state)
		// storeの状態を更新
    set(newState);
	},

  deleteTask: (cardId: string) => {
    // storeの状態を取得
    const state = get();
    // 削除ロジックを実行
    const newState = deleteCardLogic(cardId, state);
    // storeの状態を更新
    set(newState);
  },
});
