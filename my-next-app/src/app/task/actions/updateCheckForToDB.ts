import { emptyTasks } from "./emptyTasks";
import { toDataBase } from "./toDataBase";
import { toLocalDataBase } from "./toLocalDataBase";

type DiffTasks = typeof emptyTasks;

export const updateCheckForToDB = (diffTasks: DiffTasks, projectId: string) => {
  if (diffTasks === emptyTasks) return;
  toDataBase(diffTasks, projectId);
};
