import { describe, it, expect } from "vitest";
import { deleteCardLogic } from "./deleteTask"; // パスは適宜調整してください
import { TaskStore, AppState } from "@/types/task";

describe("deleteCardLogic", () => {
  // テスト用のモックデータ作成
  const createMockState = (overrides: Partial<AppState> = {}): TaskStore => ({
    activeId: null,
    overId: null,
    quadrant: null,
    boardOrder: ["board-1"],
    boards: {
      "board-1": { id: "board-1", cardIds: ["card-1", "card-2"] },
    },
    cards: {
      "card-1": {
        id: "card-1",
        boardId: "board-1",
        parentId: null,
        childrenIds: ["card-1-child"],
        title: "Parent Card",
      },
      "card-1-child": {
        id: "card-1-child",
        boardId: "board-1",
        parentId: "card-1",
        childrenIds: [],
        title: "Child Card",
      },
      "card-2": {
        id: "card-2",
        boardId: "board-1",
        parentId: null,
        childrenIds: [],
        title: "Other Card",
      },
    },
    // storeの関数群（ロジック内では使用しないためモック）
    setActiveId: () => {},
    setOverId: () => {},
    setPayload: () => {},
    setBoardOrder: () => {},
    setBoards: () => {},
    setCards: () => {},
    moveTask: () => {},
    addTask: () => {},
    deleteTask: () => {},
    ...overrides,
  } as unknown as TaskStore);

  it("ルートカードを削除したとき、ボードの参照と自身のデータが削除されること", () => {
    const state = createMockState();
    const result = deleteCardLogic("card-2", state);

    // ボードのcardIdsから削除されているか
    expect(result.boards?.["board-1"].cardIds).not.toContain("card-2");
    expect(result.boards?.["board-1"].cardIds).toContain("card-1");
    
    // カードの実体データが削除されているか
    expect(result.cards?.["card-2"]).toBeUndefined();
  });

  it("親カードを削除したとき、その子カード（子孫）も再帰的に削除されること", () => {
    const state = createMockState();
    const result = deleteCardLogic("card-1", state);

    // 親と子が両方消えているか
    expect(result.cards?.["card-1"]).toBeUndefined();
    expect(result.cards?.["card-1-child"]).toBeUndefined();
    
    // 他のカードは残っているか
    expect(result.cards?.["card-2"]).toBeDefined();
  });

  it("子カードを削除したとき、親カードの childrenIds からそのIDだけが消えること", () => {
    const state = createMockState();
    const result = deleteCardLogic("card-1-child", state);

    // 親カードの参照が更新されているか
    expect(result.cards?.["card-1"].childrenIds).not.toContain("card-1-child");
    // 親カード自体は残っているか
    expect(result.cards?.["card-1"]).toBeDefined();
    // 子カードの実体は消えているか
    expect(result.cards?.["card-1-child"]).toBeUndefined();
  });

  it("存在しないIDを指定した場合、空のオブジェクトを返すこと", () => {
    const state = createMockState();
    const result = deleteCardLogic("non-existent-id", state);

    expect(result).toEqual({});
  });
});