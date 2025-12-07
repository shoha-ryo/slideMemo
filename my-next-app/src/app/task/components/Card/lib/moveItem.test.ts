import { describe, it, expect } from "vitest";
// 実際のファイルからのインポート
import {
  moveItem,
  getNode,
  collectDescendantIds,
  isDroppingIntoOwnDescendant,
  removeNode,
} from "./moveItem";
import { Item } from "@/types/item";

// ---------------------------------------------
// テスト用初期データ
// ---------------------------------------------

// ケース1: カードのみのツリー (A -> B(D), C)
function createInitialTree(): Item[] {
  return [
    {
      id: "card-A",
      title: "card-A",
      details: "",
      level: 1,
      children: [
        {
          id: "card-B",
          title: "card-B",
          details: "",
          level: 2,
          children: [
            {
              id: "card-D",
              title: "card-D",
              details: "",
              level: 3,
              children: [],
            },
          ],
        },
        { id: "card-C", title: "card-C", details: "", level: 2, children: [] },
      ],
    },
  ];
}

// ケース2: ボードとカードのツリー (Board-1, Board-2)
function createTreeWithBoards(): Item[] {
  return [
    {
      id: "board-1",
      title: "Board 1",
      level: 0,
      details: "",
      children: [
        { id: "card-A", title: "card-A", level: 1, details: "", children: [] },
      ],
    },
    {
      id: "board-2",
      title: "Board 2",
      level: 0,
      details: "",
      children: [
        { id: "card-X", title: "X", level: 1, details: "", children: [] },
      ],
    },
  ];
}

// ---------------------------------------------
// ヘルパー関数のテスト
// ---------------------------------------------
describe("Helper Functions", () => {
  it("isDroppingIntoOwnDescendant: 自分の子孫にドロップしようとした場合は true を返す", () => {
    const tree = createInitialTree();
    // B の子孫は D
    expect(isDroppingIntoOwnDescendant(tree, "card-B", "card-D")).toBe(true);
    // B の子孫ではない C
    expect(isDroppingIntoOwnDescendant(tree, "card-B", "card-C")).toBe(false);
  });

  it("removeNode: ターゲットノードを正しく削除し、分離したノードを返す", () => {
    const tree = createInitialTree();
    const { newTree, removed } = removeNode(tree, "card-B");

    // newTree に B が存在しないことを確認
    const A_children = newTree[0].children.map((n) => n.id);
    expect(A_children).toEqual(["card-C"]);

    expect(removed).not.toBeNull();

    // 削除されたノードが B であることを確認
    expect(removed!.id).toBe("card-B");
    expect(removed!.children.map((n) => n.id)).toEqual(["card-D"]);
  });
});

// ---------------------------------------------
// moveItem メインロジックのテスト
// ---------------------------------------------
describe("moveItem Card Logic (moveBoard returns null)", () => {
  // 兄弟挿入 (Left: topLeft/bottomLeft)
  it("兄弟として C の前に D を移動（topLeft → 挿入前）する", () => {
    const tree = createInitialTree(); // D は B の子

    // D を C の前に移動する
    const result = moveItem(tree, "card-D", "card-C", "topLeft");

    const A_children_ids = result[0].children.map((n) => n.id);
    expect(A_children_ids).toEqual(["card-B", "card-D", "card-C"]); // D が B の子から A の子になり、C の前に挿入される

    // level の更新チェック (C: level 2 なので activeNode D のレベルは 2)
    const D = result[0].children.find((n) => n.id === "card-D");
    expect(D?.level).toBe(2);
  });

  it("兄弟として C の後に D を移動（bottomLeft → 挿入後）する", () => {
    const tree = createInitialTree();

    // D を C の後に移動する
    const result = moveItem(tree, "card-D", "card-C", "bottomLeft");

    const A_children_ids = result[0].children.map((n) => n.id);
    expect(A_children_ids).toEqual(["card-B", "card-C", "card-D"]); // C の後に D が挿入される
  });

  // 子要素挿入 (Right: topRight/bottomRight)
  it("C の子として D を移動（topRight → insertUnder）する", () => {
    const tree = createInitialTree();

    // D を C の子として挿入
    const result = moveItem(tree, "card-D", "card-C", "topRight");

    const A = result[0];
    const C = A.children.find((c) => c.id === "card-C");

    expect(C?.children.map((n) => n.id)).toEqual(["card-D"]); // C の子に D が入る

    // level の更新チェック (C: level 2 なので activeNode D のレベルは 3)
    expect(C?.level).toBe(2);
    expect(C?.children[0].level).toBe(3);
  });

  // エラー/ガードチェック
  it("自分の子孫にドロップしようとした場合は無視される（B → D のパターン）", () => {
    const tree = createInitialTree();

    const result = moveItem(tree, "card-B", "card-D", "topRight");

    // 変更されない
    expect(result).toEqual(tree);
  });

  it("ドロップ先が Board の場合は無視される（isItemOfKind ガード）", () => {
    const tree = createTreeWithBoards();

    // active: A (card) -> over: Board-2
    const result = moveItem(tree, "card-A", "board-2", "topLeft");

    // 変更されない
    expect(result).toEqual(tree);
  });
});

// ---------------------------------------------
// moveItem ボード移動ロジックのテスト
// ---------------------------------------------
describe("moveItem Board Logic (using moveBoard)", () => {
  it("Board-2 を Board-1 の前に移動させる（moveBoardへの委譲）", () => {
    const tree = createTreeWithBoards(); // [Board-1, Board-2]

    // Board-2 (active) を Board-1 (over) の前に移動
    const result = moveItem(tree, "board-2", "board-1", "topLeft");

    // moveBoard モックの期待値: [Board-2, Board-1]
    expect(result.map((n) => n.id)).toEqual(["board-2", "board-1"]);
    // レベルが維持されていること (最上位なので 0)
    expect(result[0].level).toBe(0);
  });

  it("Active Board と Over Card のドラッグで moveBoard へ委譲し、ボードを移動させる", () => {
    const tree = createTreeWithBoards(); // [Board-1, Board-2]

    // Active: Board-2, Over: A (Card, 親は Board-1)
    const result = moveItem(tree, "board-2", "card-A", "topRight");

    // moveBoard は 'Board-2' と 'Board-1' の移動として処理するはず
    // moveBoard のモックは board-2 と board-1 の移動に対応していないため、nullが返るはず。
    // ※ 実際の moveBoard ロジック次第だが、今回はテストの正確性を期すため、
    //    moveBoard が board-2, board-1 の移動を処理すると仮定してテスト
    // (Board-2, 'Board-1') の移動結果を期待
    // 期待結果: [Board-2, Board-1]

    expect(result.map((n) => n.id)).toEqual(["board-2", "board-1"]);
    expect(result[0].id).toBe("board-2");
  });
});
