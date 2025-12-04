import { describe, it, expect } from "vitest";
import { moveCard } from "./moveCards";
import { Item } from "@/types/item";

// ---------------------------------------------
// テスト用の初期データ（A-B(D)-C のツリー構造）
// ---------------------------------------------
function createInitialTree(): Item[] {
  return [
    {
      id: "A",
      title: "A",
      details: "",
      level: 1,
      startOffset: { x: 0, y: 0 },
      children: [
        {
          id: "B",
          title: "B",
          details: "",
          level: 2,
          startOffset: { x: 0, y: 0 },
          children: [
            {
              id: "D",
              title: "D",
              details: "",
              level: 3,
              startOffset: { x: 0, y: 0 },
              children: [],
            },
          ],
        },
        {
          id: "C",
          title: "C",
          details: "",
          level: 2,
          startOffset: { x: 0, y: 0 },
          children: [],
        },
      ],
    },
  ];
}

describe("moveCard basic behavior", () => {
	// it関数を実行すると第一引数の説明文が表示され、第二引数の関数が実行される
  it("兄弟として C の前に B を移動（Left/Top → 挿入前）する", () => {
    const tree = createInitialTree();

    const result = moveCard(tree, "B", "C", "topLeft");

    const A = result[0];

    expect(A.children.map((n) => n.id)).toEqual(["B", "C"]); // B が先頭へ
    expect(A.children[0].id).toBe("B");
  });

  it("兄弟として C の後に B を移動（Left/Bottom → 挿入後）する", () => {
    const tree = createInitialTree();

    const result = moveCard(tree, "B", "C", "bottomLeft");

    const A = result[0];
    expect(A.children.map((n) => n.id)).toEqual(["C", "B"]); // C の後に B
  });

  it("C の子として B を移動（Right → insertUnder）する", () => {
    const tree = createInitialTree();

    const result = moveCard(tree, "B", "C", "topRight");

    const A = result[0];
    const C = A.children.find((c) => c.id === "C");

    expect(C?.children.map((n) => n.id)).toEqual(["B"]);
  });

  it("自分の子孫にドロップしようとした場合は無視される（B → D のパターン）", () => {
    const tree = createInitialTree();

    const result = moveCard(tree, "B", "D", "bottomRight");

    // 変更されない
    expect(result).toEqual(tree);
  });

  it("removeNode によって activeNode が消失しないこと", () => {
    const tree = createInitialTree();

    const result = moveCard(tree, "D", "C", "topLeft");

    const A = result[0];

    // D が移動され C の前に来る
    expect(A.children.map((n) => n.id)).toEqual(["B", "D", "C"]);
  });

  it("board にドロップした場合は無視される", () => {
    const tree = createInitialTree();

    const result = moveCard(tree, "B", "board-1", "topLeft");

    expect(result).toEqual(tree);
  });

  it("レベルが正しく更新される（B を C の子に → level 3 に上がる）", () => {
    const tree = createInitialTree();

    const result = moveCard(tree, "B", "C", "topRight");

    const A = result[0];
    const C = A.children.find((n) => n.id === "C");
    const B = C?.children[0];

    expect(B?.level).toBe(3); // C(level 2) の子なので 3
  });
});
