import { emptyTasks } from "./emptyTasks";
import { toDataBase } from "./toDataBase";
import { toLocalDataBase } from "./toLocalDataBase";

type DiffTasks = typeof emptyTasks;

export const updateCheckForToDB = (
  diffTasks: DiffTasks,
  projectId: string,
  userId: string,
) => {
  if (diffTasks === emptyTasks) {
    console.log("空データの為、DB保存前に早期リターン");
    return;
  }
  // todo ローカル更新ロジック
  toLocalDataBase(diffTasks, projectId);
  toDataBase(diffTasks, projectId, userId);
};
