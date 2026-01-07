import { describe, it, expect } from "vitest";
import { deleteCardLogic } from "./deleteTask"; // パスは適宜調整してください
import {
  CardType,
  TaskStore,
} from "@/app/task/store/taskStore/types/TasksType";
import { emptyTasks } from "@/app/task/actions/emptyTasks";

describe("deleteCardLogic", () => {
  // テスト用の階層構造データ
  // Board -> Card A -> Card B (子) -> Card C (孫)
  const mockInitialState = {
    boardOrder: ["board-1"],
    boards: {
      "board-1": {
        id: "board-1",
        title: "Board 1",
        cardIds: ["card-a"],
        projectId: "p1",
      },
    },
    cards: {
      "card-a": {
        id: "card-a",
        title: "Parent",
        boardId: "board-1",
        parentId: null,
        childrenIds: ["card-b"],
      } as CardType,
      "card-b": {
        id: "card-b",
        title: "Child",
        boardId: "board-1",
        parentId: "card-a",
        childrenIds: ["card-c"],
      } as CardType,
      "card-c": {
        id: "card-c",
        title: "Grandchild",
        boardId: "board-1",
        parentId: "card-b",
        childrenIds: [],
      } as unknown as CardType,
    },
  };

  it("カードを削除したとき、その子孫もすべて state から消え、親の参照が更新されること", () => {
    // 中間のカードBを削除（これによりBと、その子のCが消えるはず）
    const targetId = "card-b";
    const result = deleteCardLogic(
      targetId,
      mockInitialState as unknown as TaskStore,
    );

    // 1. newState の検証
    // 削除対象とその子は消えているか
    expect(result.newState.cards["card-b"]).toBeUndefined();
    expect(result.newState.cards["card-c"]).toBeUndefined();

    // ルートカード(A)は残っているか
    expect(result.newState.cards["card-a"]).toBeDefined();

    // 親カード(A)の childrenIds から B が消えているか
    expect(result.newState.cards["card-a"].childrenIds).not.toContain("card-b");

    // 2. diffTasks の検証
    // idsToDelete に B と C の両方が含まれているか
    expect(result.diffTasks.deleteTasks.cardIds).toContain("card-b");
    expect(result.diffTasks.deleteTasks.cardIds).toContain("card-c");
    expect(result.diffTasks.deleteTasks.cardIds).toHaveLength(2);
  });

  it("ルートカードを削除したとき、ボード側の cardIds からも消えること", () => {
    const targetId = "card-a";
    const result = deleteCardLogic(
      targetId,
      mockInitialState as unknown as TaskStore,
    );

    // ボードの参照が更新されているか
    expect(result.newState.boards["board-1"].cardIds).not.toContain("card-a");
    expect(result.newState.boards["board-1"].cardIds).toHaveLength(0);

    // 全カードが消えているか（Aを消せばBもCも消える）
    expect(Object.keys(result.newState.cards)).toHaveLength(0);
  });

  it("存在しない cardId の場合は何もせず emptyTasks を返すこと", () => {
    const result = deleteCardLogic(
      "unknown",
      mockInitialState as unknown as TaskStore,
    );
    expect(result.newState).toEqual(mockInitialState);
    expect(result.diffTasks).toEqual(emptyTasks);
  });
});
