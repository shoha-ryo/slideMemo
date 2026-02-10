"taskActions.ts";

import {
  TaskStore,
  Payload,
  Source,
  CardType,
  BoardType,
} from "@/app/task/store/taskStore/types/TasksType";

import { applyMoveLogic } from "./Card/moveTask/applyMoveLogic";
import { addCardLogic } from "./Card/addTask/addTask";
import { deleteCardLogic } from "./Card/deleteTask/deleteTask";
import { updateCardLogic } from "./Card/updateTask/updateTask";

import { moveBoardLogic } from "./Board/moveBoard/moveBoard";
import { addBoardLogic } from "./Board/addBoard/addBoard";
import { deleteBoardLogic } from "./Board/deleteBoard/deleteBoard";
import { updateBoardLogic } from "./Board/updateBoard/updateBoard";

import { moveLabelLogic } from "./Label/moveLabel/moveLabel";
import { createLabelLogic } from "./Label/createLabel/createLabel";
import { deleteLabelFromCardLogic } from "./Label/deleteLabel/deleteLabelFromCard";
import { editMasterLabelLogic } from "./Label/editLabel/editMasterLabel";
import { deleteMasterLabelLogic } from "./Label/editLabel/deleteMasterLabel";

import { updateCheckForToDB } from "../../actions/updateCheckForToDB";
import { useUserStore } from "@/store/userStore";
import { emptyTasks } from "../../actions/emptyTasks";

export const taskActions = (
  set: (
    state: Partial<TaskStore> | ((state: TaskStore) => Partial<TaskStore>),
  ) => void,
  get: () => TaskStore,
) => {
  // 共通の更新処理を定義
  const executeUpdate = (
    diffTasks: typeof emptyTasks,
    newState: Partial<TaskStore>,
  ) => {
    const state = get();
    const userId = state.userId || useUserStore.getState().user?.id;
    if (!state.projectId || !userId) return;

    set(newState);
    updateCheckForToDB(diffTasks, state.projectId, userId);
  };

  return {
    moveTask: (payload: Payload) => {
      const state = get();
      const { newState, diffTasks } = applyMoveLogic(payload, state);
      executeUpdate(diffTasks, newState);
    },

    addTask: (title: string, source: Source) => {
      const state = get();
      const { newState, diffTasks } = addCardLogic(title, source, state);
      executeUpdate(diffTasks, newState);
    },

    deleteTask: (cardId: string) => {
      const state = get();
      const { newState, diffTasks } = deleteCardLogic(cardId, state);
      executeUpdate(diffTasks, newState);
    },

    updateTask: (cardId: string, updates: Partial<CardType>) => {
      const state = get();
      const { newState, diffTasks } = updateCardLogic(cardId, updates, state);
      executeUpdate(diffTasks, newState);
    },

    moveBoard: (payload: Payload) => {
      const state = get();
      const { newState, diffTasks } = moveBoardLogic(payload, state);
      executeUpdate(diffTasks, newState);
    },

    addBoard: (title: string) => {
      const state = get();
      const { newState, diffTasks } = addBoardLogic(title, state);
      executeUpdate(diffTasks, newState);
    },

    deleteBoard: (cardId: string) => {
      const state = get();
      const { newState, diffTasks } = deleteBoardLogic(cardId, state);
      executeUpdate(diffTasks, newState);
    },

    updateBoard: (boardId: string, updates: Partial<BoardType>) => {
      const state = get();
      const { newState, diffTasks } = updateBoardLogic(boardId, updates, state);
      executeUpdate(diffTasks, newState);
    },

    moveLabel: (payload: Payload) => {
      const state = get();
      const { newState, diffTasks } = moveLabelLogic(payload, state);
      console.log(newState, diffTasks);
      executeUpdate(diffTasks, newState);
    },

    createLabel: (name: string, color: string) => {
      const state = get();
      const { newState, diffTasks } = createLabelLogic(name, color, state);
      executeUpdate(diffTasks, newState);
    },

    deleteLabel: (activeId: string) => {
      const state = get();
      const { newState, diffTasks } = deleteLabelFromCardLogic(activeId, state);
      executeUpdate(diffTasks, newState);
    },

    editMasterLabel: (
      labelId: string,
      updates: {
        name: string | undefined;
        color: string | undefined;
      },
    ) => {
      const state = get();
      const { newState, diffTasks } = editMasterLabelLogic(
        labelId,
        updates,
        state,
      );
      executeUpdate(diffTasks, newState);
    },

    deleteMasterLabel: (labelId: string) => {
      const state = get();
      const { newState, diffTasks } = deleteMasterLabelLogic(labelId, state);
      executeUpdate(diffTasks, newState);
    },
  };
};
