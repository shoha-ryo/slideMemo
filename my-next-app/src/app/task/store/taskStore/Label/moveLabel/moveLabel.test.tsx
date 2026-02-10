import { describe, it, expect, vi, beforeEach } from "vitest";
import { moveLabelLogic } from "./moveLabel";
import {
  AppState,
  CardType,
  LabelType,
  Payload,
} from "@/app/task/store/taskStore/types/TasksType";
import { emptyTasks } from "@/app/task/actions/emptyTasks";

vi.mock("@/app/task/actions/getDiff", () => ({
  getObjectDiff: vi.fn((oldObj, newObj) => {
    const diff: Record<string, LabelType> = {};
    for (const key in newObj) {
      if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
        diff[key] = newObj[key];
      }
    }
    return diff;
  }),
}));

describe("moveLabelLogic", () => {
  const mockNow = 1700000000000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  const baseState: AppState = {
    boardOrder: [],
    boards: {},
    cards: {
      "card-1": {
        id: "card-1",
        labelIds: ["label-a"],
        updatedAt: 0,
      } as unknown as CardType,
      "card-2": {
        id: "card-2",
        labelIds: ["label-b"],
        updatedAt: 0,
      } as unknown as CardType,
    },
    labels: {},
  };

  describe("パターンA: マスターからのドラッグ", () => {
    it("ラベルがカードに追加されること", () => {
      const payload: Payload = {
        activeId: "label-new_master",
        overId: "card-1",
        dropPosition: null,
      };
      const result = moveLabelLogic(payload, baseState);

      expect(result.newState.cards["card-1"].labelIds).toEqual([
        "label-a",
        "label-new",
      ]);
      expect(result.diffTasks.updateTasks.cards).toHaveLength(1);
    });

    it("すでにラベルが存在する場合、重複して追加されないこと", () => {
      const payload: Payload = {
        activeId: "label-a_master",
        overId: "card-1",
        dropPosition: null,
      };
      const result = moveLabelLogic(payload, baseState);

      expect(result.newState).toEqual(baseState);
      expect(result.diffTasks).toEqual(emptyTasks);
    });
  });

  describe("パターンB: カード間の移動", () => {
    it("移動元のラベルが削除され、移動先に追加されること", () => {
      const payload: Payload = {
        activeId: "label-a_card-1",
        overId: "card-2",
        dropPosition: null,
      };
      const result = moveLabelLogic(payload, baseState);

      expect(result.newState.cards["card-1"].labelIds).toEqual([]);
      expect(result.newState.cards["card-2"].labelIds).toEqual([
        "label-b",
        "label-a",
      ]);
      expect(result.diffTasks.updateTasks.cards).toHaveLength(2);
    });

    it("同一カード内での移動は何も行わないこと", () => {
      const payload: Payload = {
        activeId: "label-a_card-1",
        overId: "card-1",
        dropPosition: null,
      };
      const result = moveLabelLogic(payload, baseState);

      expect(result.newState).toEqual(baseState);
    });

    it("移動先に既に同じラベルがある場合、移動元からは消えるが移動先は重複しないこと", () => {
      const stateWithOverlap = {
        ...baseState,
        cards: {
          ...baseState.cards,
          "card-2": {
            id: "card-2",
            labelIds: ["label-a"],
            updatedAt: 0,
          } as unknown as CardType,
        },
      };
      const payload: Payload = {
        activeId: "label-a_card-1",
        overId: "card-2",
        dropPosition: null,
      };
      const result = moveLabelLogic(payload, stateWithOverlap);

      expect(result.newState.cards["card-1"].labelIds).toEqual([]);
      expect(result.newState.cards["card-2"].labelIds).toEqual(["label-a"]); // 重複なし
    });

    it("【カバレッジ対策】activeId が欠損している場合、何もせず現在の状態を返すこと", () => {
      const payload: Payload = {
        activeId: null,
        overId: "card-1",
        dropPosition: null,
      };
      const result = moveLabelLogic(payload, baseState);
      expect(result.newState).toBe(baseState);
    });

    it("【カバレッジ対策】overId がカードではない（例: ボード）場合、何もせず現在の状態を返すこと", () => {
      const payload: Payload = {
        activeId: "label-1_master",
        overId: "board-1",
        dropPosition: null,
      };
      const result = moveLabelLogic(payload, baseState);
      expect(result.newState).toBe(baseState);
    });

    it("【カバレッジ対策】どのパターン（master, card-）にも当てはまらない不正なID形式の場合、フォールバックすること", () => {
      // プレフィックスがないなどの不正なID
      const payload: Payload = {
        activeId: "unknown-format",
        overId: "card-1",
        dropPosition: null,
      };
      const result = moveLabelLogic(payload, baseState);
      expect(result.newState).toBe(baseState);
    });

    it("【カバレッジ対策】overId(カードID)は存在するが、state内にその実体がない場合、何もせず現在の状態を返すこと", () => {
      const payload: Payload = {
        activeId: "label-1_master",
        overId: "card-non-existent", // ID形式は正しいが、baseState.cardsには存在しないID
        dropPosition: null,
      };

      const result = moveLabelLogic(payload, baseState);

      // ステートが変更されず、空の差分が返ることを確認
      expect(result.newState).toBe(baseState);
      expect(result.diffTasks).toEqual(emptyTasks);
    });
  });
});
