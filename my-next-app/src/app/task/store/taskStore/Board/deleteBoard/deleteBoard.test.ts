import { describe, it, expect } from "vitest";
import { deleteBoardLogic } from "./deleteBoard"; // パスは適宜調整してください
import {
  AppState,
  BoardType,
  CardType,
} from "@/app/task/store/taskStore/types/TasksType";
import { emptyTasks } from "@/app/task/actions/emptyTasks";

describe("deleteBoardLogic", () => {
  const mockInitialState: AppState = {
    boardOrder: ["board-1", "board-2"],
    boards: {
      "board-1": {
        id: "board-1",
        title: "Board 1",
        cardIds: ["card-1", "card-2"],
        projectId: "p1",
      } as unknown as BoardType,
      "board-2": {
        id: "board-2",
        title: "Board 2",
        cardIds: ["card-3"],
        projectId: "p1",
      } as unknown as BoardType,
    },
    cards: {
      "card-1": {
        id: "card-1",
        title: "Task 1",
        boardId: "board-1",
      } as unknown as CardType,
      "card-2": {
        id: "card-2",
        title: "Task 2",
        boardId: "board-1",
      } as unknown as CardType,
      "card-3": {
        id: "card-3",
        title: "Task 3",
        boardId: "board-2",
      } as unknown as CardType,
    },
    labels: {},
  };

  it("ボードを削除したとき、そのボードと所属するカードが state から消えること", () => {
    const targetId = "board-1";
    const result = deleteBoardLogic(targetId, mockInitialState);

    // 1. newState の検証
    // ボードが消えているか
    expect(result.newState.boards[targetId]).toBeUndefined();
    expect(result.newState.boardOrder).not.toContain(targetId);
    expect(result.newState.boardOrder).toHaveLength(1);

    // 所属していたカード(card-1, card-2)が消えているか
    expect(result.newState.cards["card-1"]).toBeUndefined();
    expect(result.newState.cards["card-2"]).toBeUndefined();

    // 他のボードのカード(card-3)は残っているか
    expect(result.newState.cards["card-3"]).toBeDefined();

    // 2. diffTasks の検証
    expect(result.diffTasks.deleteTasks.boardIds).toEqual([targetId]);
    expect(result.diffTasks.updateTasks.boardOrder).toEqual(["board-2"]);
  });

  it("存在しない boardId が渡された場合、何も変更せずに現在の state を返すこと", () => {
    const result = deleteBoardLogic("non-existent-id", mockInitialState);

    expect(result.newState).toEqual(mockInitialState);
    expect(result.diffTasks).toEqual(emptyTasks);
  });

  it("ボードが空（カードがない）の状態でも正常に削除できること", () => {
    const emptyBoardState: AppState = {
      ...mockInitialState,
      boards: {
        "board-empty": {
          id: "board-empty",
          title: "Empty",
          cardIds: [],
          projectId: "p1",
        } as unknown as BoardType,
      },
      boardOrder: ["board-empty"],
    };

    const result = deleteBoardLogic("board-empty", emptyBoardState);
    expect(result.newState.boardOrder).toHaveLength(0);
    expect(result.newState.boards).toEqual({});
  });
});
