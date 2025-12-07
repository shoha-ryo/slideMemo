import { Item } from '@/types/item'
import { arrayMove } from '@dnd-kit/sortable'
import { isItemOfKind } from '../../Card/lib/moveItem';



const moveBoard = (tree: Item[], activeId: string, overId: string): {movedBoardTree: Item[], isUpdated: boolean} => {

  const isActiveBoard = isItemOfKind(activeId, "board");
	const isOverBoard = isItemOfKind(overId, "board")
  const isOverCard = isItemOfKind(overId, "card");
  let movedBoardTree = [...tree];
	let isUpdated = false

	// Activeがボード、Overがカードなら親のボードを取得し、ボードを移動させる
  if (isActiveBoard && isOverCard) {
    // Over Card の親ボードを取得
    const overParentBoard = findNodeParent(movedBoardTree, overId);
    if (overParentBoard) {
      // Active Board を親ボードの位置に移動
      movedBoardTree = moveNodes(movedBoardTree, activeId, overParentBoard.id);
			isUpdated = true
    }
  }

	// 両方ボードならそのまま移動する
	if (isActiveBoard && isOverBoard) {
		movedBoardTree = moveNodes(movedBoardTree, activeId, overId)
		isUpdated = true
	}

  return { movedBoardTree, isUpdated };
};

// ノードを新しい位置へ移動させる (arrayMoveを使用)
const moveNodes = (tree: Item[], activeId: string, overId: string): Item[] => {

  // 移動元 (activeId) の現在のインデックスを取得
  const oldIndex = tree.findIndex(item => item.id === activeId);
  // 移動先 (overId) のインデックスを取得
  const newIndex = tree.findIndex(item => item.id === overId);

  if (oldIndex === -1 || newIndex === -1) {
    return [...tree];
  }

  // arrayMove を使用して、oldIndex から newIndex へノードを移動
  const newTree = arrayMove(tree, oldIndex, newIndex);

  return newTree;
};

// ターゲットIDのノードの親をツリー内から探す (変更なし)
const findNodeParent = (tree: Item[], targetId: string): Item | null => {
  for (const node of tree) {
    if (node.children) {
      // 子ノードの中にターゲットノードがいるか探す
      for (const child of node.children) {
        if (child.id === targetId) {
          return node; // ターゲットノードを見つけたら、その親ノードを返す
        }
      }
      // 子ノードの中にいなければ、さらに深い階層を探索する
      const parentInChild = findNodeParent(node.children, targetId);
      if (parentInChild) {
        return parentInChild;
      }
    }
  }
  return null;
};

export { moveBoard, moveNodes, findNodeParent }