"taskActions.ts"

import { TaskStore } from "@/types/task";
import { Payload } from "@/types/task";

import { applyMoveLogic } from "./moveTask/applyMoveLogic";

export const taskActions = (set: Function, get: () => TaskStore) => ({
  moveTask: (payload: Payload) => {
    // storeの状態を取得
    const state = get();

    // 移動ロジックを実行
    const newState = applyMoveLogic(payload, state);
		console.log(newState);

    // storeの状態を更新
    set(newState);
  },

  // addTask()

  // deleteTask()
});
