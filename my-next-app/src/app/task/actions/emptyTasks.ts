import { BoardType, CardType, LabelType } from "@/app/task/store/taskStore/types/TasksType";

// ここには "use server" を書かない！ただの定数ファイルにする
export const emptyTasks = {
  createTasks: {
    boardOrder: [] as string[],
    boards: [] as BoardType[],
    cards: [] as CardType[],
		labels: [] as LabelType[],
  },
  updateTasks: {
    boardOrder: [] as string[],
    boards: [] as Partial<BoardType>[],
    cards: [] as Partial<CardType>[],
    labels: [] as Partial<LabelType>[],
  },
  deleteTasks: {
    boardOrder: [] as string[],
    boardIds: [] as string[],
    cardIds: [] as string[],
    labelIds: [] as string[],
  },
};
