import { describe, it, expect } from 'vitest';
// swapBoard, swapNodes を moveBoard, moveNodes に修正
import { findNodeParent, moveBoard, moveNodes } from './moveBoard'; 
import { Item } from '@/types/item'


// --- テスト用モックデータ (変更なし) ---
const mockTree: Item[] = [
  // --- Board A (Index 0) ---
  {
    id: "board-1",
    level: 0,
    title: "Board A",
    details: "タスクボードA",
    children: [
      { id: "card-a1", level: 1, title: "Card A1", details: "詳細情報A1", children: [] },
      { id: "card-a2", level: 1, title: "Card A2", details: "詳細情報A2", children: [] },
    ],
  },

  // --- Board B (Index 1) ---
  {
    id: "board-2",
    level: 0,
    title: "Board B",
    details: "タスクボードB",
    children: [
      { id: "card-b1", level: 1, title: "Card B1", details: "詳細情報B1", children: [], useOverlay: true },
    ],
  },

  // --- Board C (Index 2) ---
  {
    id: "board-3",
    level: 0,
    title: "Board C",
    details: "空のボード",
    children: [],
  },
];


describe('moveNodes (ルート配列の移動)', () => {
  it('ルート階層内の2つのボードを正しく移動させること', () => {
    // board-1 (Index 0) を board-3 (Index 2) の位置に移動させる
    // 期待結果: [board-2, board-3, board-1]
    const result = moveNodes(mockTree, "board-1", "board-3");

    // 不変性の確認
    expect(result).not.toBe(mockTree);

    // board-2 が 0番目に移動
    expect(result[0].id).toBe("board-2");
    // board-3 が 1番目に移動
    expect(result[1].id).toBe("board-3");
    // board-1 が 2番目の位置に挿入される
    expect(result[2].id).toBe("board-1");

    expect(result.length).toBe(3);
  });

  it('存在しないIDの場合、元のツリーと等価なツリーを返すこと', () => {
    const result = moveNodes(mockTree, "board-1", "non-existent-id");

    // 参照は異なるが、中身は同じであることを確認
    expect(result).not.toBe(mockTree);
    expect(result).toEqual(mockTree);
  });
});


describe('findNodeParent (ツリー探索)', () => {
  it('指定したカードの親ボードを正しく見つけること', () => {
    const parent = findNodeParent(mockTree, "card-a1");
    expect(parent).not.toBeNull();
    expect(parent!.id).toBe("board-1");
  });

  it('深い階層のカードの親を正しく見つけること', () => {
    const parent = findNodeParent(mockTree, "card-b1");
    expect(parent).not.toBeNull();
    expect(parent!.id).toBe("board-2");
  });

  it('ルートノードの親を探した場合、nullを返すこと', () => {
    const parent = findNodeParent(mockTree, "board-1");
    expect(parent).toBeNull();
  });
});


// boardSwap -> moveBoard に修正
describe('moveBoard (メインロジック)', () => {
  
  it('ActiveがBoard、OverがCardの場合、Active Boardを親Boardの位置に移動させること', () => {
    const activeBoardId = "board-3"; // 移動元 (Index 2)
    const overCardId = "card-a2";    // 移動先カード (親は Board A, Index 0)

    // 実行される処理: moveNodes(mockTree, "board-3", "board-1")
    // 期待結果: [board-3, board-1, board-2]
    // 戻り値のアクセスを修正: .movedBoardTree を削除
    const result = moveBoard(mockTree, activeBoardId, overCardId).movedBoardTree; 

    // board-3 が 0番目の位置に移動
    expect(result[0].id).toBe("board-3");
    // board-1 が 1番目にずれる
    expect(result[1].id).toBe("board-1");
    // board-2 が 2番目にずれる
    expect(result[2].id).toBe("board-2");
  });

  it('ActiveがCardの場合、処理せず元のツリーを返すこと', () => {
    const activeCardId = "card-a1"; // ActiveがCard
    const overCardId = "card-a2";
    
    // 戻り値のアクセスを修正: .movedBoardTree を削除
    const result = moveBoard(mockTree, activeCardId, overCardId).movedBoardTree; 

    // moveBoard のガードロジックにより変更なし
    expect(result).toEqual(mockTree);
  });

  // 🚨 修正箇所: ボード同士の移動は処理すべき
  it('Active, OverともにBoardの場合、Active BoardをOver Boardの位置に移動させること', () => {
    const activeBoardId = "board-3"; // 移動元 (Index 2)
    const overBoardId = "board-2";   // 移動先 (Index 1)
    
    // 戻り値のアクセスを修正: .movedBoardTree を削除
    const result = moveBoard(mockTree, activeBoardId, overBoardId).movedBoardTree; 

    // 期待結果: [board-1, board-3, board-2] (board-3 (2) を board-2 (1) の位置に移動)
    expect(result).not.toEqual(mockTree); 
    
    // 順序の確認
    expect(result[0].id).toBe("board-1"); // 変わらず
    expect(result[1].id).toBe("board-3"); // board-3 が挿入される
    expect(result[2].id).toBe("board-2"); // board-2 がずれる
  });
});