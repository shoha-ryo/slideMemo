import { Item } from "@/types/task";

function createNewCard(title: string) {
  return {
    id: `card-${Date.now()}`, // 一意のIDを生成
    level: 1,
    title: title.trim(),
    details: "",
    children: [],
  };
}

function findTargetIndex(items: Item[], boardId: string) {
  return items.findIndex((item) => item.id === boardId);
}

// メイン関数
export function addCard(title: string, selfItem: Item, items: Item[]) {
  if (!title.trim()) return items;

  const targetIndex = findTargetIndex(items, selfItem.id);
  if (targetIndex === -1) {
    return items; // 対象ボードが見つからない場合は元の配列を返す
  }

  const newCard = createNewCard(title);
  const updatedSelfItem: Item = {
    ...selfItem, // selfItem のプロパティをコピー
    children: [...selfItem.children, newCard], // children を新しい配列で上書き
  };

  const newItems = [
    ...items.slice(0, targetIndex),
    updatedSelfItem,
    ...items.slice(targetIndex + 1),
  ];

  return newItems;
}
