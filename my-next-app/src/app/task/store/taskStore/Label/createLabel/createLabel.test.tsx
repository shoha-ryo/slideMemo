import { describe, it, expect, vi, beforeEach } from "vitest";
import { createLabelLogic } from "./createLabel";
import { AppState } from "@/app/task/store/taskStore/types/TasksType";

// 外部モジュールのモック化
vi.mock("uuid", () => ({
  v4: () => "mocked-uuid-1234",
}));

describe("createLabelLogic (AppState Integration)", () => {
  // AppStateの構造に基づいたモックデータ
  const initialMockState: AppState = {
    boardOrder: ["board-1"],
    boards: {
      "board-1": {
        id: "board-1",
        projectId: "project-abc",
        title: "Main Board",
        cardIds: [],
        createdAt: 1000,
        updatedAt: 1000,
      },
    },
    cards: {},
    labels: {
      "existing-label-id": {
        id: "existing-label-id",
        name: "Existing",
        color: "#000000",
        projectId: "project-abc",
        createdAt: 1000,
        updatedAt: 1000,
      },
    },
  };
  const projectId = "project-abc";

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
  });

  it("正常な入力で labels オブジェクトに新しいラベルが正しく追加されること", () => {
    const name = "Bug Fix";
    const color = "#ef4444";
    const result = createLabelLogic(name, color, initialMockState, projectId);

    const expectedId = "label-mocked-uuid-1234";

    // 1. newState の検証
    // labels以外のプロパティが維持されているか
    expect(result.newState.boardOrder).toEqual(initialMockState.boardOrder);
    expect(result.newState.boards).toEqual(initialMockState.boards);

    // labelsに新旧両方が含まれているか
    expect(Object.keys(result.newState.labels)).toHaveLength(2);
    expect(result.newState.labels[expectedId]).toMatchObject({
      id: expectedId,
      name: "Bug Fix",
      color: "#ef4444",
      projectId: projectId,
      createdAt: expect.any(Number),
    });

    // 2. diffTasks (DB保存用データ) の検証
    expect(result.diffTasks.createTasks.labels).toHaveLength(1);
    expect(result.diffTasks.createTasks.labels[0].id).toBe(expectedId);
  });

  it("名前が空文字の場合、状態を変更せず diffTasks も空であること", () => {
    const result = createLabelLogic(
      "   ",
      "#ffffff",
      initialMockState,
      projectId,
    );

    expect(result.newState).toBe(initialMockState);
    expect(result.diffTasks.createTasks.labels).toEqual([]);
  });

  it("projectIdがnullの場合、状態を変更しないこと", () => {
    const nullProjectId = null as unknown as string;

    const result = createLabelLogic(
      "New Label",
      "#ffffff",
      initialMockState,
      nullProjectId,
    );

    expect(result.newState).toBe(initialMockState);
  });

  it("入力された名前の前後空白がトリミングされること", () => {
    const result = createLabelLogic(
      "  Trim Test  ",
      "#000",
      initialMockState,
      projectId,
    );
    const expectedId = "label-mocked-uuid-1234";
    expect(result.newState.labels[expectedId].name).toBe("Trim Test");
  });

  it("Stateのイミュータビリティ（不変性）が守られていること", () => {
    const projectId = "p1";

    const result = createLabelLogic(
      "Test",
      "#000",
      initialMockState,
      projectId,
    );

    // labelsオブジェクトが新しい参照になっているか
    expect(result.newState.labels).not.toBe(initialMockState.labels);
    // 元のStateが汚染されていないか
    expect(Object.keys(initialMockState.labels)).toHaveLength(1);
  });
});
