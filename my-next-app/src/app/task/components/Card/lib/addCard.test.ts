import { describe, it, expect } from "vitest";
import { addCard } from "./addCard"; // ファイル名に合わせてパスを修正してください
import { Item } from "@/types/item";

// ---------------------------------------------
// テスト用の初期データ
// ---------------------------------------------
const initialItems: Item[] = [
  {
    id: "board-1",
    title: "Board A",
    details: "",
    level: 1,
    startOffset: { x: 0, y: 0 },
    children: [
      { id: "existing-card-1", title: "Existing Card 1", details: "", level: 2, startOffset: { x: 0, y: 0 }, children: [] },
    ],
  },
  {
    id: "board-2",
    title: "Board B",
    details: "",
    level: 1,
    startOffset: { x: 0, y: 0 },
    children: [], // 空のボード
  },
];

// 対象ボード（Board A）を抽出 (このオブジェクトが selfItem に渡されることを想定)
const selfItemBoardA: Item = initialItems[0];
const selfItemBoardB: Item = initialItems[1];

// ---------------------------------------------
// テストスイート
// ---------------------------------------------
describe("addCard function", () => {
  
  it("指定したボード (selfItem) に新しいカードがchildrenとして追加されること", () => {
    const newTitle = "New Task Card";
    
    // Board B に新しいカードを追加する
    const result = addCard(newTitle, selfItemBoardB, initialItems);

    // 1. 配列の長さが変わらないこと (新しいボードは増えない)
    expect(result.length).toBe(2);

    // 2. Board B が正しく更新されていること (targetIndex=1)
    const updatedBoardB = result[1];
    expect(updatedBoardB.id).toBe("board-2");
    
    // 3. children に新しいカードが1つ追加されていること
    expect(updatedBoardB.children.length).toBe(1);
    
    // 4. 追加されたカードの内容が正しいこと
    const newCard = updatedBoardB.children[0];
    expect(newCard.title).toBe(newTitle);
    expect(newCard.level).toBe(1); // createNewCardのロジック通り
    expect(newCard.id).toMatch(/^card-\d+$/);
  });

  it("既存のカードがあるボード (Board A) にも正しく追加され、既存のカードが保持されること", () => {
    const newTitle = "Priority Task";
    
    // Board A に新しいカードを追加する
    const result = addCard(newTitle, selfItemBoardA, initialItems);
    
    // 1. Board A が正しく更新されていること (targetIndex=0)
    const updatedBoardA = result[0];
    expect(updatedBoardA.id).toBe("board-1");

    // 2. children の数が1 (既存) から 2 (新規追加) に増えていること
    expect(updatedBoardA.children.length).toBe(2);
    
    // 3. 既存のカードが保持されていること
    expect(updatedBoardA.children[0].id).toBe("existing-card-1");
    
    // 4. 新しいカードが最後に追加されていること
    expect(updatedBoardA.children[1].title).toBe(newTitle);
  });

  it("タイトルが空白または空文字列の場合、元の配列が変更されずに返されること", () => {
    const titleEmpty = "";
    const titleSpace = "  ";

    // 空文字列
    let result = addCard(titleEmpty, selfItemBoardB, initialItems);
    expect(result).toEqual(initialItems); 
    
    // スペースのみ
    result = addCard(titleSpace, selfItemBoardB, initialItems);
    expect(result).toEqual(initialItems);
  });

  it("元の `items` 配列が変更されていないこと (不変性の確認)", () => {
    const newTitle = "Check Immutability";
    
    // 実行前の items のコピー
    const initialCopy = JSON.parse(JSON.stringify(initialItems)); 

    // Board B に追加
    const result = addCard(newTitle, selfItemBoardB, initialItems);
    
    // 実行後の initialItems が初期状態と同じであることを確認
    expect(initialItems).toEqual(initialCopy); 
    
    // 実行後の selfItemBoardB の children の長さが 0 のままであることを確認 (破壊的変更がないか)
    expect(selfItemBoardB.children.length).toBe(0); 
  });
});