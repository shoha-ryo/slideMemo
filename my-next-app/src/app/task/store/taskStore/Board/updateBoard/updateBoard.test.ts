import { describe, it, expect } from "vitest";
import { updateBoardLogic } from "./updateBoard";
import {
  AppState,
  BoardType,
  CardType,
} from "@/app/task/store/taskStore/types/TasksType";
import { emptyTasks } from "@/app/task/actions/emptyTasks";

describe("updateBoardLogic", () => {
  const initialState: AppState = {
    boardOrder: ["board-1", "board-2"],
    boards: {
      "board-1": {
        id: "board-1",
        title: "Original Board Title",
        cardIds: ["card-1"],
      } as unknown as BoardType,
      "board-2": {
        id: "board-2",
        title: "Another Board",
        cardIds: [],
      } as unknown as BoardType,
    },
    cards: {
      "card-1": {
        id: "card-1",
        title: "Task 1",
        details: "",
        boardId: "board-1",
        parentId: null,
      } as unknown as CardType,
    },
    labels: {},
  };

  it("1. ボードのタイトルを正しく更新できること", () => {
    const { newState, diffTasks } = updateBoardLogic(
      "board-1",
      { title: "Renamed Board" },
      initialState,
    );

    // stateの反映確認
    expect(newState.boards["board-1"].title).toBe("Renamed Board");
    // 他のボードやカードに影響がないか
    expect(newState.boards["board-2"].title).toBe("Another Board");
    expect(newState.cards["card-1"].title).toBe("Task 1");

    // diffTasksの確認
    expect(diffTasks.updateTasks.boards).toHaveLength(1);
    expect(diffTasks.updateTasks.boards[0]).toEqual({
      id: "board-1",
      title: "Renamed Board",
    });
  });

  it("2. 変更がない場合は emptyTasks を返し、参照も維持すること", () => {
    const { newState, diffTasks } = updateBoardLogic(
      "board-1",
      { title: "Original Board Title" },
      initialState,
    );

    expect(diffTasks).toEqual(emptyTasks);
    // 変更がないので state も元のまま（または同等）であること
    expect(newState.boards).toBe(initialState.boards);
  });

  it("3. 存在しないボードIDの場合は console.warn を出し、状態を維持すること", () => {
    const { newState, diffTasks } = updateBoardLogic(
      "unknown-id",
      { title: "New Title" },
      initialState,
    );

    expect(newState).toEqual(initialState);
    expect(diffTasks).toEqual(emptyTasks);
  });
});
