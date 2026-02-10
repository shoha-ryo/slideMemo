import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteLabelFromCardLogic } from "./deleteLabelFromCard";
import {
  AppState,
  LabelType,
} from "@/app/task/store/taskStore/types/TasksType";
import { emptyTasks } from "@/app/task/actions/emptyTasks";

// getObjectDiff のモック化（挙動を固定するため）
vi.mock("@/app/task/actions/getDiff", () => ({
  getObjectDiff: vi.fn((oldObj, newObj) => {
    // 簡易的な差分抽出ロジックのシミュレーション
    const diff: Record<string, LabelType> = {};
    for (const key in newObj) {
      if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
        diff[key] = newObj[key];
      }
    }
    return diff;
  }),
}));

describe("deleteLabelFromCardLogic", () => {
  const mockNow = 1700000000000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  const baseState: AppState = {
    boardOrder: ["board-1"],
    boards: {
      "board-1": {
        id: "board-1",
        projectId: "p1",
        title: "Board 1",
        cardIds: ["card-1"],
        createdAt: 0,
        updatedAt: 0,
      },
    },
    cards: {
      "card-1": {
        id: "card-1",
        projectId: "p1",
        parentId: null,
        boardId: "board-1",
        title: "Test Card",
        details: "",
        status: "active",
        progress: "todo",
        startAt: null,
        dueAt: null,
        simpleView: false,
        childrenIds: [],
        labelIds: ["label-a", "label-b"],
        createdAt: 0,
        updatedAt: 0,
      },
    },
    labels: {
      "label-a": {
        id: "label-a",
        name: "Label A",
        color: "red",
        projectId: "p1",
        createdAt: 0,
        updatedAt: 0,
      },
      "label-b": {
        id: "label-b",
        name: "Label B",
        color: "blue",
        projectId: "p1",
        createdAt: 0,
        updatedAt: 0,
      },
    },
  };

  it("指定したラベルがカードの labelIds から削除されること", () => {
    const activeId = "label-a_card-1";
    const result = deleteLabelFromCardLogic(activeId, baseState);

    // 1. 状態の検証
    expect(result.newState.cards["card-1"].labelIds).toEqual(["label-b"]);
    expect(result.newState.cards["card-1"].updatedAt).toBe(mockNow);
  });

  it("diffTasks に適切な更新差分が含まれていること", () => {
    const activeId = "label-a_card-1";
    const result = deleteLabelFromCardLogic(activeId, baseState);

    // 2. 差分の検証
    const updateCards = result.diffTasks.updateTasks.cards;
    expect(updateCards).toHaveLength(1);
    expect(updateCards[0]).toMatchObject({
      id: "card-1",
      labelIds: ["label-b"],
      updatedAt: mockNow,
    });
  });

  it('cardId が "master" の場合は何もせず元の状態を返すこと', () => {
    const activeId = "label-a_master";
    const result = deleteLabelFromCardLogic(activeId, baseState);

    expect(result.newState).toEqual(baseState);
    expect(result.diffTasks).toEqual(emptyTasks);
  });

  it("合成IDにカードIDが含まれていない場合は何もせず元の状態を返すこと", () => {
    const activeId = "label-a"; // セパレーターなし
    const result = deleteLabelFromCardLogic(activeId, baseState);

    expect(result.newState).toEqual(baseState);
    expect(result.diffTasks).toEqual(emptyTasks);
  });

  it("存在しないカードIDが指定された場合は何もせず元の状態を返すこと", () => {
    const activeId = "label-a_non-existent-card";
    const result = deleteLabelFromCardLogic(activeId, baseState);

    expect(result.newState).toEqual(baseState);
    expect(result.diffTasks).toEqual(emptyTasks);
  });
});
