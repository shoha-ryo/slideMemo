import { Item } from "@/types/item";

// 新しいノードに置換したツリーを返す
export const replaceNodeById = (
  items: Item[],
  idToReplace: string | null,
  newNode: Item,
): Item[] => {
  if (!idToReplace) return items;

  let isReplaced: boolean = false;

  // 1. .map() を使って新しい配列を生成する（不変性の確保）
  const newTree = items.map((item) => {
    if (item.id === idToReplace) {
      // IDが一致した場合: 古いノードを新しいノードに置き換える
      // 注意: childrenはそのまま引き継ぐ（Modalでは編集されないため）
      isReplaced = true;
      return { ...newNode, children: item.children };
    }

    // 2. children がある場合: 再帰的に検索
    if (item.children && item.children.length > 0) {
      // 子を検索し、更新された新しい children 配列を取得
      const newChildren = replaceNodeById(item.children, idToReplace, newNode);

      // childrenの内容が変わっていた場合のみ、親ノードも新しいオブジェクトとして返す
      if (newChildren !== item.children) {
        isReplaced = true;
        return { ...item, children: newChildren };
      }
    }
    return item;
  });

  // 置換されなかったら元のツリーを返す
  if (isReplaced) return newTree;
  else return items;
};
