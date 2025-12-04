import { Item } from '@/types/item'

function createNewCard(title: string) {
	return {
		id: `card-${Date.now()}`, // 一意のIDを生成
		level: 1,
		title: title.trim(),
		details: "",
		children: [],
	}
}

function findTargetIndex(items: Item[], boardId: string) {
	return items.findIndex(item => item.id === boardId)
}


// メイン関数
export function addCard (title: string, selfItem: Item, items: Item[]) {
	if (!title.trim()) return;

	const targetIndex = findTargetIndex(items, selfItem.id)
	const newCard = createNewCard(title)
	const newChildren = [...selfItem.children, newCard]
	selfItem.children = newChildren

	const newItems = [
		...items.slice(0, targetIndex),
		selfItem,
		...items.slice(targetIndex + 1)
	]
	console.log(newItems);
	return newItems

}