// replaceNodeById.test.ts
import { describe, it, expect } from "vitest";
import { Item } from "@/types/item";
import { replaceNodeById } from "./replaceNode";
import { findNodeById } from "./searchNode";

// --- テスト用のユーティリティとデータ ---

// Item 型の簡略化されたモック関数
const createMockItem = (
  id: string,
  title: string,
  level: number,
  children: Item[] = [],
): Item => ({
  id,
  title,
  level,
  details: "initial details",
  useOverlay: false,
  children,
  startOffset: { x: 0, y: 0 },
});

// 階層構造を持つテストデータ
const initialItems: Item[] = [
  createMockItem("A", "Node A", 1, [
    createMockItem("B", "Node B", 2, [createMockItem("C", "Node C", 3)]),
    createMockItem("D", "Node D", 2),
  ]),
  createMockItem("E", "Node E", 1),
];

// --- 新しいノードの定義 ---
const newNode: Item = {
  ...initialItems[0].children[0], // Bの構造をベースに
  id: "B",
  title: "Updated Node B",
  details: "New details for B",
  level: 2,
  children: [], // childrenはreplaceNodeById内で元データから引き継ぐ
  useOverlay: false,
  startOffset: { x: 0, y: 0 },
};

// ----------------------------------------------------
// replaceNodeById のテストスイート
// ----------------------------------------------------
describe("replaceNodeById (不変性と再帰的置換のテスト)", () => {
  // ----------------------------------------
  // A. ロジックと階層的な置換の検証
  // ----------------------------------------

  it("深層ノード（C）が正しく置き換えられるべき", () => {
    const newDeepNode = { ...newNode, id: "C", title: "Updated C" };
    const newTree = replaceNodeById(initialItems, "C", newDeepNode);

    const replacedNode = findNodeById("C", newTree);
    expect(replacedNode?.title).toBe("Updated C");
  });

  it("ルートノード（E）が正しく置き換えられるべき", () => {
    const newRootNode = { ...newNode, id: "E", title: "Updated E" };
    const newTree = replaceNodeById(initialItems, "E", newRootNode);

    const replacedNode = findNodeById("E", newTree);
    expect(replacedNode?.title).toBe("Updated E");

    // 他のルートノードAのタイトルが変わっていないか
    expect(findNodeById("A", newTree)?.title).toBe("Node A");
  });

  it("置き換えIDがnullの場合、元の配列の参照を返す", () => {
    const result = replaceNodeById(initialItems, null, newNode);
    expect(result).toBe(initialItems); // 参照が同じであることを確認
  });

  it("IDが見つからなかった場合、元の配列の参照を返す", () => {
    const result = replaceNodeById(initialItems, "Z", newNode);
    expect(result).toBe(initialItems); // 参照が同じであることを確認
  });

  // ----------------------------------------
  // B. 不変性の検証 (最も重要)
  // ----------------------------------------

  it("元の配列の参照および変更されていないオブジェクトの不変性が維持されるべき", () => {
    const newTree = replaceNodeById(initialItems, "B", newNode);

    // 1. 元の配列と新しい配列の参照は異なるべき
    expect(newTree).not.toBe(initialItems);

    // 2. 変更されていないルートノード(E)の参照は維持されるべき (効率性)
    expect(newTree[1]).toBe(initialItems[1]); // ノード E

    // 3. 変更されていない兄弟ノード(D)の参照は維持されるべき (効率性)
    const nodeA_Original = initialItems[0];
    const nodeA_New = newTree[0];

    expect(nodeA_New.children[1]).toBe(nodeA_Original.children[1]); // ノード D (兄弟)
  });

  it("置き換えパス上のオブジェクトは正しくクローン（複製）されるべき", () => {
    const newTree = replaceNodeById(initialItems, "C", newNode);

    const nodeA_Original = initialItems[0];
    const nodeA_New = newTree[0];

    // 1. ノードCの親 (B) は置き換えパス上にあるため、新しいオブジェクトであるべき
    const nodeB_Original = nodeA_Original.children[0];
    const nodeB_New = nodeA_New.children[0];
    expect(nodeB_New).not.toBe(nodeB_Original);

    // 2. ルートノードAもパス上にあるため、新しいオブジェクトであるべき
    expect(nodeA_New).not.toBe(nodeA_Original);

    // 3. ルートノードAの children 配列は新しい配列であるべき
    expect(nodeA_New.children).not.toBe(nodeA_Original.children);
  });
});
