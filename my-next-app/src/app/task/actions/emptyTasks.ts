import { BoardType, CardType } from "@/types/task";

// ここには "use server" を書かない！ただの定数ファイルにする
export const emptyTasks = {
    createTasks: {
      boardOrder: [] as string[],
      boards: [] as BoardType[],
      cards: [] as CardType[],
    },
    updateTasks: {
      boardOrder: [] as string[],
      boards: [] as Partial<BoardType>[],
      cards: [] as Partial<CardType>[],
    },
    deleteTasks: {
      boardOrder: [] as string[],
      boardIds: [] as string[],
      cardIds: [] as string[],
    },
};