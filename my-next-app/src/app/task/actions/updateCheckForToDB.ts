import { emptyTasks } from "./emptyTasks";
import { toDataBase } from "./toDataBase";

type DiffTasks = typeof emptyTasks;

export const updateCheckForToDB = (diffTasks: DiffTasks, projectId: string) => {
  if (diffTasks === emptyTasks) return;
  toDataBase(diffTasks, projectId);
};
