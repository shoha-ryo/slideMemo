import { describe, it, expect, vi, beforeEach } from "vitest";
import { editMasterLabelLogic } from "./editMasterLabel"; // パスは適宜調整してください
import {
  AppState,
  LabelType,
} from "@/app/task/store/taskStore/types/TasksType";
import { emptyTasks } from "@/app/task/actions/emptyTasks";

// getObjectDiff のモック化
vi.mock("@/app/task/actions/getDiff", () => ({
  getObjectDiff: vi.fn((oldObj, newObj) => {
    const diff: Record<string, LabelType> = {};
    for (const key in newObj) {
      if (oldObj[key] !== newObj[key]) {
        diff[key] = newObj[key];
      }
    }
    return diff;
  }),
}));

describe("editMasterLabelLogic", () => {
  const mockNow = 1700000000000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  const baseState: AppState = {
    boardOrder: [],
    boards: {},
    cards: {},
    labels: {
      "label-1": {
        id: "label-1",
        name: "Old Name",
        color: "blue",
        projectId: "p1",
        createdAt: 1000,
        updatedAt: 1000,
      },
    },
  };

  it("ラベルの名前と色が正しく更新され、updatedAt が更新されること", () => {
    const updates = { name: "New Name", color: "red" };
    const result = editMasterLabelLogic("label-1", updates, baseState);

    // Stateの更新確認
    expect(result.newState.labels["label-1"]).toEqual({
      ...baseState.labels["label-1"],
      name: "New Name",
      color: "red",
      updatedAt: mockNow,
    });
  });

  it("diffTasks に変更点のみが含まれていること", () => {
    const updates = { name: "New Name" }; // 色は変更しない
    const result = editMasterLabelLogic("label-1", updates, baseState);

    const labelUpdates = result.diffTasks.updateTasks.labels;
    expect(labelUpdates).toHaveLength(1);
    expect(labelUpdates![0]).toEqual({
      id: "label-1",
      name: "New Name",
      updatedAt: mockNow,
    });
    // color は差分に含まれていないことを確認（getObjectDiffの挙動依存）
    expect(labelUpdates![0]).not.toHaveProperty("color");
  });

  it("存在しないラベルIDが指定された場合、元の状態を返し、差分を発生させないこと", () => {
    const result = editMasterLabelLogic(
      "non-existent",
      { name: "Test" },
      baseState,
    );

    expect(result.newState).toBe(baseState);
    expect(result.diffTasks).toEqual(emptyTasks);
  });

  it("空の updates が渡された場合でも updatedAt は更新されること", () => {
    const result = editMasterLabelLogic("label-1", {}, baseState);

    expect(result.newState.labels["label-1"].updatedAt).toBe(mockNow);
    expect(result.diffTasks.updateTasks.labels![0].updatedAt).toBe(mockNow);
  });
});
