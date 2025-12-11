// treeToFlat.ts

/**
 * ノードの基本型定義 (ツリー構造とフラット構造の両方で使用)
 * IDと、子ノードを持つ可能性があることを示す Item[]
 */
export interface Item {
  id: string;
  parentId?: string | null;
  title: string;
  details: string;
  children?: Item[]; // ツリー構造でのみ使用
  // DB保存時のフラット構造に必要なメタデータ (例: level, order)
  level?: number;
  order?: number;
}

/**
 * ツリー構造のデータをフラットな配列構造に変換する関数
 * @param treeItems - 変換するツリー構造の Item[]
 * @returns フラット構造に変換された Item[]
 */
export const treeToFlat = (treeItems: Item[]): Item[] => {
  const flatList: Item[] = [];
  let globalOrder = 0; // すべてのノードのグローバルな順序を追跡

  /**
   * 再帰的にツリーを辿り、ノードをフラットリストに追加する関数
   * @param items - 現在のレベルのノード配列
   * @param parentId - 親ノードのID (ルートノードの場合は null)
   * @param level - 現在のノードの階層レベル
   */
  const traverse = (
    items: Item[],
    parentId: string | null = null,
    level: number = 0,
  ) => {
    items.forEach((node, index) => {
      // 1. ノードのコピーを作成し、DB保存に必要なメタデータを追加
      const flatNode: Item = {
        id: node.id,
        parentId: parentId, // 親IDを追加
        title: node.title,
        details: node.details,
        level: level, // 階層レベルを追加
        order: globalOrder++, // グローバル順序を追加
        // children プロパティはフラット構造では不要なので、コピーしないか削除する
        // 厳密にはTypeScriptの型定義によっては明示的に削除する必要がある
      };

      // childrenプロパティを削除したバージョンをflatListに追加
      const { children, ...rest } = flatNode;
      flatList.push(rest as Item);

      // 2. 子ノードが存在する場合、再帰的に処理を続ける
      if (node.children && node.children.length > 0) {
        traverse(node.children, node.id, level + 1);
      }
    });
  };

  // 処理の開始
  traverse(treeItems, null, 0);

  return flatList;
};

// --- 使用例 ---
/*
const sampleTree: Item[] = [
  {
    id: "a",
    title: "Root A",
    details: "Detail A",
    children: [
      {
        id: "a1",
        title: "Child A1",
        details: "Detail A1",
        children: [{ id: "a1i", title: "Grandchild", details: "" }],
      },
    ],
  },
  { id: "b", title: "Root B", details: "Detail B" },
];

const flatResult = treeToFlat(sampleTree);
// console.log(flatResult);
*/
