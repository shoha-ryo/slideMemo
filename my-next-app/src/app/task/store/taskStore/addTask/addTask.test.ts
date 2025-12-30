import { describe, it, expect } from "vitest";
import { addCardLogic } from "./addTask"; // 正しいインポート
import { AppState, Source } from "@/types/TasksType";
import { emptyTasks } from "@/app/task/actions/emptyTasks";

describe("addCardLogic", () => {
  const mockInitialState: AppState = {
    boardOrder: ["board-1"],
    boards: {
      "board-1": {
        id: "board-1",
        title: "Board 1",
        cardIds: [],
        projectId: "p1",
      },
    },
    cards: {
      "existing-card": {
        id: "existing-card",
        title: "Parent Card",
        parentId: null,
        boardId: "board-1",
        childrenIds: [],
        details: "",
        status: "active",
        progress: "todo",
        startAt: null,
        dueAt: null,
        simpleView: false,
      },
    },
  };

  it("ボードに対して新しいカードを正常に追加できること", () => {
    const title = "New Task";
    const source: Source = {
      type: "board",
      data: mockInitialState.boards["board-1"],
    };

    const result = addCardLogic(title, source, mockInitialState);

    // 新しく生成されたカードのIDを特定
    const newCardId = Object.keys(result.newState.cards).find((id) =>
      id.startsWith("card-"),
    )!;

    expect(result.newState.cards[newCardId].title).toBe(title);
    expect(result.newState.boards["board-1"].cardIds).toContain(newCardId);
    expect(result.diffTasks.createTasks.cards![0].id).toBe(newCardId);
  });

  it("既存のカードに対して子カードとして追加できること", () => {
    const title = "Sub Task";
    const source: Source = {
      type: "card",
      data: mockInitialState.cards["existing-card"],
    };

    const result = addCardLogic(title, source, mockInitialState);

    const newCardId = Object.keys(result.newState.cards).find(
      (id) => id.startsWith("card-") && id !== "existing-card",
    )!;

    // 子カード側の parentId が正しいか
    expect(result.newState.cards[newCardId].parentId).toBe("existing-card");
    // 親カード側の childrenIds に追加されているか
    expect(result.newState.cards["existing-card"].childrenIds).toContain(
      newCardId,
    );
  });

  it("タイトルが空白の場合、処理をスキップすること", () => {
    const source: Source = {
      type: "board",
      data: mockInitialState.boards["board-1"],
    };

    const result = addCardLogic("   ", source, mockInitialState);

    expect(result.newState).toEqual(mockInitialState);
    expect(result.diffTasks).toEqual(emptyTasks);
  });
});
