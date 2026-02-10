import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteMasterLabelLogic } from "./deleteMasterLabel"; // パスは適宜調整してください
import {
  AppState,
  CardType,
  LabelType,
} from "@/app/task/store/taskStore/types/TasksType";
import { emptyTasks } from "@/app/task/actions/emptyTasks";

describe("deleteMasterLabelLogic", () => {
  const mockNow = 1700000000000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
    // console.log を抑制したい場合はここで mock する
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  const baseState: AppState = {
    boardOrder: ["board-1"],
    boards: {},
    cards: {
      "card-with-label": {
        id: "card-with-label",
        labelIds: ["target-label", "other-label"],
        updatedAt: 0,
        // ... 他の必須プロパティ（省略可。実際は型定義に従う）
      } as unknown as CardType,
      "card-without-label": {
        id: "card-without-label",
        labelIds: ["other-label"],
        updatedAt: 0,
      } as unknown as CardType,
    },
    labels: {
      "target-label": {
        id: "target-label",
        name: "Delete Me",
      } as unknown as LabelType,
      "other-label": {
        id: "other-label",
        name: "Keep Me",
      } as unknown as LabelType,
    },
  };

  it("マスターラベルが削除され、該当するすべてのカードからラベルが除外されること", () => {
    const labelIdToDelete = "target-label";
    const result = deleteMasterLabelLogic(labelIdToDelete, baseState);

    // 1. Labels State の検証
    expect(result.newState.labels["target-label"]).toBeUndefined();
    expect(result.newState.labels["other-label"]).toBeDefined();

    // 2. Cards State の検証
    expect(result.newState.cards["card-with-label"].labelIds).toEqual([
      "other-label",
    ]);
    expect(result.newState.cards["card-with-label"].updatedAt).toBe(mockNow);

    // ラベルを持っていなかったカードは変更されないこと
    expect(result.newState.cards["card-without-label"]).toBe(
      baseState.cards["card-without-label"],
    );
  });

  it("diffTasks に削除されたラベルIDと、更新されたカードのリストが含まれていること", () => {
    const labelIdToDelete = "target-label";
    const result = deleteMasterLabelLogic(labelIdToDelete, baseState);

    // 削除タスクの検証
    expect(result.diffTasks.deleteTasks.labelIds).toContain("target-label");

    // 更新タスク（カード）の検証
    const updateCards = result.diffTasks.updateTasks.cards;
    expect(updateCards).toHaveLength(1);
    expect(updateCards[0]).toEqual({
      id: "card-with-label",
      labelIds: ["other-label"],
      updatedAt: mockNow,
    });
  });

  it("存在しないラベルIDを指定した場合、元の状態を維持し差分が発生しないこと", () => {
    const result = deleteMasterLabelLogic("non-existent", baseState);

    expect(result.newState).toEqual(baseState);
    expect(result.diffTasks).toEqual(emptyTasks);
  });
});
