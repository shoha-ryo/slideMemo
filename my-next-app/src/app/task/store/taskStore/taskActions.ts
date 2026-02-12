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
import { deleteMasterLabelLogic } from "./Label/deleteLabel/deleteMasterLabel";

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
  const executeGet = () => {
    const state = get();
    const projectId = get().projectId;
    return {
      state,
      projectId,
    };
  };

  const executeUpdate = (
    diffTasks: typeof emptyTasks,
    newState: Partial<TaskStore>,
  ) => {
    const state = get();
    const userId = state.userId || useUserStore.getState().user?.id;
    if (!state.project || !userId) return;

    set(newState);
    updateCheckForToDB(diffTasks, state.project, userId);
  };

  return {
    moveTask: (payload: Payload) => {
      const result = executeGet();
      const { newState, diffTasks } = applyMoveLogic(payload, result.state);
      executeUpdate(diffTasks, newState);
    },

    addTask: (title: string, source: Source) => {
      const result = executeGet();
      if (!result.projectId) return;
      const { newState, diffTasks } = addCardLogic(
        title,
        source,
        result.state,
        result.projectId,
      );
      executeUpdate(diffTasks, newState);
    },

    deleteTask: (cardId: string) => {
      const result = executeGet();
      const { newState, diffTasks } = deleteCardLogic(cardId, result.state);
      executeUpdate(diffTasks, newState);
    },

    updateTask: (cardId: string, updates: Partial<CardType>) => {
      const result = executeGet();
      const { newState, diffTasks } = updateCardLogic(
        cardId,
        updates,
        result.state,
      );
      executeUpdate(diffTasks, newState);
    },

    moveBoard: (payload: Payload) => {
      const result = executeGet();
      const { newState, diffTasks } = moveBoardLogic(payload, result.state);
      executeUpdate(diffTasks, newState);
    },

    addBoard: (title: string) => {
      const result = executeGet();
      const { newState, diffTasks } = addBoardLogic(title, result.state);
      executeUpdate(diffTasks, newState);
    },

    deleteBoard: (cardId: string) => {
      const result = executeGet();
      const { newState, diffTasks } = deleteBoardLogic(cardId, result.state);
      executeUpdate(diffTasks, newState);
    },

    updateBoard: (boardId: string, updates: Partial<BoardType>) => {
      const result = executeGet();
      const { newState, diffTasks } = updateBoardLogic(
        boardId,
        updates,
        result.state,
      );
      executeUpdate(diffTasks, newState);
    },

    moveLabel: (payload: Payload) => {
      const result = executeGet();
      const { newState, diffTasks } = moveLabelLogic(payload, result.state);
      executeUpdate(diffTasks, newState);
    },

    createLabel: (name: string, color: string) => {
      const result = executeGet();
      if (!result.projectId) return;
      const { newState, diffTasks } = createLabelLogic(
        name,
        color,
        result.state,
        result.projectId,
      );
      executeUpdate(diffTasks, newState);
    },

    deleteLabel: (activeId: string) => {
      const result = executeGet();
      const { newState, diffTasks } = deleteLabelFromCardLogic(
        activeId,
        result.state,
      );
      executeUpdate(diffTasks, newState);
    },

    editMasterLabel: (
      labelId: string,
      updates: {
        name: string | undefined;
        color: string | undefined;
      },
    ) => {
      const result = executeGet();
      const { newState, diffTasks } = editMasterLabelLogic(
        labelId,
        updates,
        result.state,
      );
      executeUpdate(diffTasks, newState);
    },

    deleteMasterLabel: (labelId: string) => {
      const result = executeGet();
      const { newState, diffTasks } = deleteMasterLabelLogic(
        labelId,
        result.state,
      );
      executeUpdate(diffTasks, newState);
    },
  };
};
