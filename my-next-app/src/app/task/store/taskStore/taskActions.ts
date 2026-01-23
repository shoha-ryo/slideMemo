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

export const taskActions = (
  set: (
    state: Partial<TaskStore> | ((state: TaskStore) => Partial<TaskStore>),
  ) => void,
  get: () => TaskStore,
) => ({
  moveTask: (payload: Payload) => {
    const state = get();
    const { newState, diffTasks } = applyMoveLogic(payload, state);
    if (!state.projectId || !state.userId) return;
    updateCheckForToDB(diffTasks, state.projectId, state.userId);
    set(newState);
  },

  addTask: (title: string, source: Source) => {
    const state = get();
    const { newState, diffTasks } = addCardLogic(title, source, state);
    if (!state.projectId || !state.userId) return;
    set(newState);
    updateCheckForToDB(diffTasks, state.projectId, state.userId);
  },

  deleteTask: (cardId: string) => {
    const state = get();
    const { newState, diffTasks } = deleteCardLogic(cardId, state);
    if (!state.projectId || !state.userId) return;
    set(newState);
    updateCheckForToDB(diffTasks, state.projectId, state.userId);
  },

  updateTask: (cardId: string, updates: Partial<CardType>) => {
    const state = get();
    const { newState, diffTasks } = updateCardLogic(cardId, updates, state);
    if (!state.projectId || !state.userId) return;
    set(newState);
    updateCheckForToDB(diffTasks, state.projectId, state.userId);
  },

  moveBoard: (payload: Payload) => {
    const state = get();
    const { newState, diffTasks } = moveBoardLogic(payload, state);
    if (!state.projectId || !state.userId) return;
    set(newState);
    updateCheckForToDB(diffTasks, state.projectId, state.userId);
  },

  addBoard: (title: string) => {
    const state = get();
    const { newState, diffTasks } = addBoardLogic(title, state);
    if (!state.projectId || !state.userId) return;
    set(newState);
    updateCheckForToDB(diffTasks, state.projectId, state.userId);
  },

  deleteBoard: (cardId: string) => {
    const state = get();
    const { newState, diffTasks } = deleteBoardLogic(cardId, state);
    if (!state.projectId || !state.userId) return;
    set(newState);
    updateCheckForToDB(diffTasks, state.projectId, state.userId);
  },

  updateBoard: (boardId: string, updates: Partial<BoardType>) => {
    const state = get();
    const { newState, diffTasks } = updateBoardLogic(boardId, updates, state);
    if (!state.projectId || !state.userId) return;
    set(newState);
    updateCheckForToDB(diffTasks, state.projectId, state.userId);
  },

  moveLabel: (payload: Payload) => {
    const state = get();
    const { newState, diffTasks } = moveLabelLogic(payload, state);
    console.log(newState, diffTasks);
    if (!state.projectId || !state.userId) return;
    set(newState);
    updateCheckForToDB(diffTasks, state.projectId, state.userId);
  },

  createLabel: (name: string, color: string) => {
    const state = get();
    const { newState, diffTasks } = createLabelLogic(name, color, state);
    if (!state.projectId || !state.userId) return;
    set(newState);
    updateCheckForToDB(diffTasks, state.projectId, state.userId);
  },

  deleteLabel: (activeId: string) => {
    const state = get();
    const { newState, diffTasks } = deleteLabelFromCardLogic(activeId, state);
    if (!state.projectId || !state.userId) return;
    set(newState);
    updateCheckForToDB(diffTasks, state.projectId, state.userId);
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
    if (!state.projectId || !state.userId) return;
    set(newState);
    updateCheckForToDB(diffTasks, state.projectId, state.userId);
  },

  deleteMasterLabel: (labelId: string) => {
    const state = get();
    const { newState, diffTasks } = deleteMasterLabelLogic(labelId, state);
    if (!state.projectId || !state.userId) return;
    set(newState);
    updateCheckForToDB(diffTasks, state.projectId, state.userId);
  },
});
