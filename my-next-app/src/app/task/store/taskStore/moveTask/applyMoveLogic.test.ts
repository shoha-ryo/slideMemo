import { describe, it, expect, beforeEach } from "vitest";

import { useTaskStore } from "../taskStore";
import { applyMoveLogic } from "./applyMoveLogic"; // ファイルパスは適宜変更してください
import { AppState, CardType, BoardType, Payload } from "@/types/task";
// 実際のファイルからのインポート

// ---------------------------------------------
// テスト用初期データ
// ---------------------------------------------

const { boardOrder, boards, cards } = useTaskStore.getState();

// ---------------------------------------------
// 書き方の参考
// ---------------------------------------------

// describe("テスト内容のタイトル", () => {
//   it("テストの内容の説明", () => {
//     const 変数 = 処理する関数();

//     expect(結果の値).toEqual(期待する値);  値が同じであればOK
//     expect(結果の値).toBe(期待する値);     完全一致であればOK
//     expect(結果の値).not.toBe(期待する値); 完全一致はNG
//   });
// });

// 子要素として配置(上に配置)
// (active: parentIdを変更 / over: 自身のchildrenIdsを変更)
// (active&overのboardIdが異なればboardIdを変更)
describe.only("applyMoveLogic", () => {
  let state: AppState;

  beforeEach(() => {
    state = { boardOrder, boards, cards };
  });

  describe("基本動作とガード句", () => {
    it("activeIdとoverIdが同じ場合はstateをそのまま返す", () => {
      const payload: Payload = { activeId: "card-1", overId: "card-1", quadrant: "topLeft" };
      const result = applyMoveLogic(payload, state);
      expect(result).toBe(state); // 参照が同じであることを確認
    });

    it("無効なIDの場合はstateをそのまま返す", () => {
      const payload: Payload = { activeId: null as any, overId: "card-1", quadrant: "topLeft" };
      const result = applyMoveLogic(payload, state);
      expect(result).toBe(state);
    });
  });

  describe("同じボード内での移動 (Reorder)", () => {
    it("兄弟要素の並び替え (bottomLeft: 下に移動)", () => {
      // card-1 を card-2 の下に移動
      const payload: Payload = {
        activeId: "card-1",
        overId: "card-2",
        quadrant: "bottomLeft",
      };

      const result = applyMoveLogic(payload, state);
      const board1 = result.boards["board-1"];

      expect(board1.cardIds).toEqual(["card-2", "card-1"]);
      expect(result.cards["card-1"].parentId).toBeNull();
    });

    it("兄弟要素の並び替え (topLeft: 上に移動)", () => {
      // card-2 を card-1 の上に移動
      const payload: Payload = {
        activeId: "card-2",
        overId: "card-1",
        quadrant: "topLeft",
      };

      const result = applyMoveLogic(payload, state);
      const board1 = result.boards["board-1"];

      expect(board1.cardIds).toEqual(["card-2", "card-1"]);
    });
  });

  describe("ネスト処理 (Nest)", () => {
    it("カードの中に子として移動 (topRight)", () => {
      // card-2 を card-1 の中に入れる
      const payload: Payload = {
        activeId: "card-2",
        overId: "card-1",
        quadrant: "topRight",
      };

      const result = applyMoveLogic(payload, state);

      // 元の場所から消えているか
      expect(result.boards["board-1"].cardIds).not.toContain("card-2");
      // 新しい親のchildrenに追加されているか
      expect(result.cards["card-1"].childrenIds).toContain("card-2");
      // parentIdが更新されているか
      expect(result.cards["card-2"].parentId).toBe("card-1");
    });
  });

  describe("ボード間の移動 (Move Board)", () => {
    it("別のボードのルートへ移動", () => {
      // card-1 を board-2 へ移動
      const payload: Payload = {
        activeId: "card-1",
        overId: "board-2", // ボード自体にドロップ
        quadrant: "topRight",
      };

      const result = applyMoveLogic(payload, state);

      // 移動元から削除
      expect(result.boards["board-1"].cardIds).not.toContain("card-1");
      // 移動先に追加
      expect(result.boards["board-2"].cardIds).toContain("card-1");
      // boardIdの更新
      expect(result.cards["card-1"].boardId).toBe("board-2");
    });

    it("別のボードへ移動時、子孫のboardIdも再帰的に更新される", () => {
      // card-1 (子に card-1-child を持つ) を board-2 へ移動
      const payload: Payload = {
        activeId: "card-1",
        overId: "board-2",
        quadrant: "topRight",
      };

      const result = applyMoveLogic(payload, state);

      // 親のboardId更新確認
      expect(result.cards["card-1"].boardId).toBe("board-2");
      // 子のboardId更新確認 (再帰処理)
      expect(result.cards["card-1-child"].boardId).toBe("board-2");
    });

    it("別のボードのカードの下（兄弟）へ移動", () => {
      // まず board-2 にカードを作る準備（テストデータにはないので擬似的に）
      // ここでは card-1 を board-2 に移動させた後の状態からスタートする想定でも良いが、
      // 簡単のため card-1 を board-2 の何もないところに card-2扱いで入れる処理を確認する
      
      // card-1 (Board1) を card-2 (Board1) の下に移動してもボード移動は発生しないので、
      // Board2に予めカードがある状態を作るか、ロジックを確認する。
      
      // ケース: Board1のcard-1を、Board2へ移動（Board2をOverIdとする）は上でテスト済み。
      // ここでは、Board2にあるカードの上にドロップするケース。
      
      // テストデータを一時的に変更
      state.boards["board-2"].cardIds = ["card-99"];
      state.cards["card-99"] = {
        ...state.cards["card-1"],
        id: "card-99",
        boardId: "board-2",
        childrenIds: []
      };

      // card-1 (Board1) を card-99 (Board2) の下 (bottomLeft) に移動
      const payload: Payload = {
        activeId: "card-1",
        overId: "card-99",
        quadrant: "bottomLeft"
      };

      const result = applyMoveLogic(payload, state);

      // Board1から削除
      expect(result.boards["board-1"].cardIds).not.toContain("card-1");
      // Board2に追加 (card-99の後ろ)
      expect(result.boards["board-2"].cardIds).toEqual(["card-99", "card-1"]);
      // boardId更新
      expect(result.cards["card-1"].boardId).toBe("board-2");
    });
  });
});