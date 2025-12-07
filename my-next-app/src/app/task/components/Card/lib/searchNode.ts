import { Item } from "@/types/item";
import { useItemStore } from "@/app/task/store/ItemStore";
import { useModalStore } from "@/app/task/store/ModalStore";

export const findNodeById = (id: string | null, items: Item[]): Item | null => {
  if (!id) return null; // IDがない場合は検索しない

  for (const item of items) {
    // 1. 現在のノードのIDをチェック
    if (item.id === id) {
      return item;
    }

    // 2. children があれば、再帰的に検索
    if (item.children && item.children.length > 0) {
      const foundInChildren = findNodeById(id, item.children);
      if (foundInChildren) {
        return foundInChildren; // 子孫ノードで見つかったら即座に返す
      }
    }
  }

  return null; // 見つからなかった場合
};

export const useSearchNode = (): Item | null => {
  const { items } = useItemStore(); // 全てのアイテムを取得
  const { clickedActiveId } = useModalStore(); // 現在モーダルで表示すべきIDを取得

  // 検索を実行
  const activeNode = findNodeById(clickedActiveId, items);

  // 見つかったノードを返す
  return activeNode;
};
