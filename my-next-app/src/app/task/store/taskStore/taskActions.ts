"taskActions.ts"

import { TaskStore, Payload, Source } from "@/types/task";

import { applyMoveLogic } from "./moveTask/applyMoveLogic";
import { addCardLogic } from "./addTask/addTask";
import { deleteCardLogic } from "./deleteTask/deleteTask";
import { moveBoardLogic } from "./moveBoard/moveBoard";
import { addBoardLogic } from "./addBoard/addBoard";
import { deleteBoardLogic } from "./deleteBoard/deleteBoard";

import { toDataBase } from "../../actions/toDataBase";

export const taskActions = (set: Function, get: () => TaskStore) => ({
  moveTask: (payload: Payload) => {
    // storeの状態を取得
    const state = get();
    // 移動ロジックを実行
    const {newState, diffTasks} = applyMoveLogic(payload, state);
    // storeの状態を更新
    set(newState);

		// DBへ登録
		toDataBase({diffTasks})
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

  moveBoard: (payload: Payload) => {
    // storeの状態を取得
    const state = get();
    // 移動ロジックを実行
    const {newState, diffTasks} = moveBoardLogic(payload, state);
    // storeの状態を更新
    set(newState);

		toDataBase(diffTasks)
  },

	addBoard: (title: string) => {
		// storeの状態を取得
    const state = get();
		// 追加ロジックを実行
		const newState = addBoardLogic(title, state)
		// storeの状態を更新
    set(newState);
	},

	  deleteBoard: (cardId: string) => {
    // storeの状態を取得
    const state = get();
    // 削除ロジックを実行
    const newState = deleteBoardLogic(cardId, state);
    // storeの状態を更新
    set(newState);
  },

});
