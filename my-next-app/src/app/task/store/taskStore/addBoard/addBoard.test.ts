import { describe, it, expect } from "vitest";
import { addBoardLogic } from "./addBoard"; // パスは適宜調整してください
import { AppState, CardType } from "@/app/task/store/taskStore/types/TasksType";
import { emptyTasks } from "@/app/task/actions/emptyTasks";

describe("addBoardLogic", () => {
  // テスト用の初期状態（モック）
  const mockInitialState: AppState = {
    boardOrder: ["board-1"],
    boards: {
      "board-1": {
        id: "board-1",
        title: "Existing Board",
        cardIds: [],
        projectId: "",
      },
    },
    cards: {},
  };

  it("正常に新しいボードを追加できること", () => {
    const newTitle = "New Project Board";
    const result = addBoardLogic(newTitle, mockInitialState);

    // 1. newState の検証
    expect(result.newState.boardOrder).toHaveLength(2);
    expect(result.newState.boardOrder[1]).toMatch(/^board-/); // uuidが含まれているか

    const newBoardId = result.newState.boardOrder[1];
    expect(result.newState.boards[newBoardId]).toBeDefined();
    expect(result.newState.boards[newBoardId].title).toBe(newTitle);

    // 2. diffTasks の検証
    expect(result.diffTasks.createTasks.boards).toHaveLength(1);
    expect(result.diffTasks.createTasks.boards[0].title).toBe(newTitle);
    expect(result.diffTasks.updateTasks.boardOrder).toEqual(
      result.newState.boardOrder,
    );
  });

  it("タイトルが空文字または空白のみの場合、stateを変更せずに返すこと", () => {
    const result = addBoardLogic("   ", mockInitialState);

    expect(result.newState).toEqual(mockInitialState);
    expect(result.diffTasks).toEqual(emptyTasks);
  });

  it("既存のカード情報（cards）を壊さずに保持していること", () => {
    const stateWithCards: AppState = {
      ...mockInitialState,
      cards: {
        "card-1": {
          id: "card-1",
          title: "Task",
          boardId: "board-1",
          childrenIds: [],
          details: "",
          status: "active",
          progress: "todo",
          startAt: null,
          dueAt: null,
          parentId: null,
          simpleView: false,
        } as unknown as CardType,
      },
    };

    const result = addBoardLogic("Next Board", stateWithCards);
    expect(result.newState.cards).toEqual(stateWithCards.cards);
  });
});
