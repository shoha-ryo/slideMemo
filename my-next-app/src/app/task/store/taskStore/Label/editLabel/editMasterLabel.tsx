import { AppState, ReturnTasks, LabelType } from "@/app/task/store/taskStore/types/TasksType";
import { getObjectDiff } from "@/app/task/actions/getDiff";
import { emptyTasks } from "@/app/task/actions/emptyTasks";

/**
 * マスターラベルを更新するロジック
 * @param labelId 更新対象の純粋なラベルID (例: "label-uuid")
 * @param updates 更新したい内容 (nameやcolor)
 * @param state 現在のAppState
 */
export function editMasterLabelLogic(
  labelId: string,
  updates: Partial<Pick<LabelType, "name" | "color">>,
  state: AppState
): ReturnTasks {
  const { labels } = state;

  const targetLabel = labels[labelId];

  // 対象のラベルが存在しない場合は何もしない
  if (!targetLabel) {
    return { newState: state, diffTasks: emptyTasks };
  }

  // 1. 新しいラベルオブジェクトを作成
  const newLabel: LabelType = {
    ...targetLabel,
    ...updates,
    updatedAt: Date.now(),
  };

  // 2. 差分の抽出 (DB更新用)
  const updateTasks = [
    {
      id: labelId,
      ...getObjectDiff(targetLabel, newLabel),
    },
  ];

  // 3. Stateを更新
  return {
    newState: {
      ...state,
      labels: {
        ...labels,
        [labelId]: newLabel,
      },
    },
    diffTasks: {
      ...emptyTasks,
      updateTasks: {
        ...emptyTasks.updateTasks,
        labels: updateTasks as Partial<LabelType>[],
      },
    },
  };
}