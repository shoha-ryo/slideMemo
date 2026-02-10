import { v4 as uuidv4 } from "uuid";
import {
  LabelType,
  AppState,
  ReturnTasks,
} from "@/app/task/store/taskStore/types/TasksType";
import { emptyTasks } from "@/app/task/actions/emptyTasks";

/**
 * 新しいラベルオブジェクトを生成
 */
function createNewLabel(
  name: string,
  color: string,
  projectId: string,
): LabelType {
  const now = Date.now();
  return {
    id: `label-${uuidv4()}`,
    name: name.trim(),
    color: color,
    projectId: projectId,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * ラベル追加のメインロジック
 */
export function createLabelLogic(
  name: string,
  color: string, // カラーコード (例: #3b82f6)
  state: AppState,
  projectId: string,
): ReturnTasks {
  // 名前が空なら何もしない
  if (!name.trim()) {
    return { newState: state, diffTasks: emptyTasks };
  }

  const { labels } = state;

  if (!projectId) {
    return { newState: state, diffTasks: emptyTasks };
  }

  // 1. 新しいラベルを作成
  const newLabel = createNewLabel(name, color, projectId);

  // 2. 新しいStateを作成（labelsオブジェクトに新ラベルを追加）
  const newState: AppState = {
    ...state,
    labels: {
      ...labels,
      [newLabel.id]: newLabel,
    },
  };

  // 3. 差分（diffTasks）を構築
  return {
    newState: newState,
    diffTasks: {
      ...emptyTasks,
      createTasks: {
        ...emptyTasks.createTasks,
        labels: [newLabel], // DB保存用に新規作成リストへ
      },
    },
  };
}
