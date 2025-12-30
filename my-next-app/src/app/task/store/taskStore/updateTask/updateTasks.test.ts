import { describe, it, expect } from "vitest";
import { updateCardLogic } from "./updateTask";
import { AppState, CardType } from "@/types/TasksType";
import { emptyTasks } from "@/app/task/actions/emptyTasks";

describe("updateCardLogic", () => {
  // テスト用の初期状態
  const initialState: AppState = {
    boardOrder: ["board-1"],
    boards: {
      "board-1": { id: "board-1", title: "Board 1", cardIds: ["card-1"] },
    },
    cards: {
      "card-1": {
        id: "card-1",
        title: "Initial Title",
        details: "Initial Details",
        boardId: "board-1",
        parentId: null,
      } as unknown as CardType,
    },
  };

  it("1. 指定したプロパティ（タイトル）のみが更新されること", () => {
    const { newState, diffTasks } = updateCardLogic(
      "card-1",
      { title: "New Title" },
      initialState,
    );

    // stateが更新されているか
    expect(newState.cards["card-1"].title).toBe("New Title");
    // 他の項目（details）は維持されているか
    expect(newState.cards["card-1"].details).toBe("Initial Details");

    // diffTasksに正しいデータが入っているか
    expect(diffTasks.updateTasks.cards).toHaveLength(1);
    expect(diffTasks.updateTasks.cards[0]).toEqual({
      id: "card-1",
      title: "New Title",
    });
  });

  it("2. 複数のプロパティを同時に更新できること", () => {
    const { newState, diffTasks } = updateCardLogic(
      "card-1",
      { title: "Changed", details: "Changed" },
      initialState,
    );

    expect(newState.cards["card-1"].title).toBe("Changed");
    expect(newState.cards["card-1"].details).toBe("Changed");
    expect(diffTasks.updateTasks.cards[0]).toMatchObject({
      title: "Changed",
      details: "Changed",
    });
  });

  it("3. 値に変更がない場合は emptyTasks を返すこと", () => {
    const { diffTasks } = updateCardLogic(
      "card-1",
      { title: "Initial Title" }, // 元と同じ値
      initialState,
    );

    expect(diffTasks).toEqual(emptyTasks);
  });

  it("4. 存在しないカードIDの場合は状態を維持すること", () => {
    const { newState, diffTasks } = updateCardLogic(
      "non-existent-id",
      { title: "Ghost" },
      initialState,
    );

    expect(newState).toEqual(initialState);
    expect(diffTasks).toEqual(emptyTasks);
  });
});
