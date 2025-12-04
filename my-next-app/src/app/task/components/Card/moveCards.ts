import { Item } from '@/types/item'
import { Quadrant } from '@/types/quadrant'


// ツリー構造のノード移動ロジック
function getNode(rootList: Item[], targetId: string): Item | null {
  for (const node of rootList) {
    if (node.id === targetId) return node
    if (node.children && node.children.length > 0) {
      const found = getNode(node.children, targetId)
      if (found) return found
    }
  }
  return null
}


// ノードとその子孫のIDをすべて収集するヘルパー関数
function collectDescendantIds(node: Item): string[] {
  let result: string[] = [node.id]
  for (const child of node.children) {
    result = result.concat(collectDescendantIds(child))
  }
  return result
}

// ドロップ先が自身の子孫かどうか判定する
function isDroppingIntoOwnDescendant(
  rootList: Item[],
  activeId: string,
  overId: string
): boolean {
  const activeNode = getNode(rootList, activeId) // activeノード全体を取得
  if (!activeNode) return false
  const descendants = collectDescendantIds(activeNode) // activeノードの全子孫IDを収集
  return descendants.includes(overId)  // 自分の子孫に drop しようとしているかを判定
}

// ドロップ先がボードかどうか判定する
function isDroppingOnBoard(
	overId: string
): boolean {
	return overId.startsWith('board-');
}



// ノードをツリーから削除するヘルパー関数
function removeNode(tree: Item[], targetId: string) {
  let removed = null;

  const walk = (nodes: Item[]) => {
    return nodes.filter((node: Item) => {
      if (node.id === targetId) {
        removed = node;
        return false;
      }
      node.children = walk(node.children);
      return true;
    });
  };

  const newTree = walk(tree); // activeノードを削除した新しいツリー
  return { newTree, removed }; // 分離したノードも返す
}


// ノードを子要素として挿入する
function insertUnder(newTree: Item[], overId: string, activeNode: Item) {
  const walk = (nodes: Item[]) => {
    return nodes.map((node) => { // 新しいノードを展開
      if (node.id === overId) { // 挿入先を発見
        node.children = [activeNode, ...node.children]; // activeノードを一番前に追加(右側の処理)
      } else {
        node.children = walk(node.children); // overノードが見つかるまで再帰的に探索
      }
      return node;
    });
  };
  return walk(newTree);
}

// ノードを兄弟要素として挿入する
function insertSibling(newTree: Item[], targetId: string, activeNode: Item, quadrant: string) {
  const walk = (nodes: Item[]): Item[] => {
		return nodes.map((node) => {
			// ★ ここの children の中に targetId を持つ子がいれば兄弟に追加
      const hasTarget = node.children.some((child) => child.id === targetId);
			// targetId を持つ子が見つかった場合の処理
			if (hasTarget) {
				const idx = node.children.findIndex(c => c.id === targetId);
				// children のコピーを作る（stateを壊さないため）
				const newChildren = [...node.children];
				if (quadrant.includes("bottom")) {
					// target の「後ろ」に挿入
					newChildren.splice(idx + 1, 0, activeNode);
				} else {
					// target の「前」に挿入
					newChildren.splice(idx, 0, activeNode);
				}
				return { ...node, children: newChildren };
			}

      // 再帰で下を探す
      return {
        ...node,
        children: walk(node.children),
      };
    });
  };
  return walk(newTree);
}



// 親レベル情報を元に子レベルを更新するヘルパー関数
function updateLevels(node: Item, baseLevel: number) {
  node.level = baseLevel;
  node.children.forEach((child) => updateLevels(child, baseLevel + 1));
}


// ノードを移動するメイン関数 
function moveCard(tree: Item[], activeId: string, overId: string, quadrant: Quadrant) {

	// ドロップ先が自分の子孫の場合は何もしない
	if (isDroppingIntoOwnDescendant(tree, activeId, overId)) return tree
	if (isDroppingOnBoard(overId)) return tree
  // ① 「active以外のノード」と「activeノード」を分離
  const { newTree, removed: activeNode } = removeNode(tree, activeId);
  if (!activeNode) return tree; // 想定外の時は何もしない

  // ② active を over の子として挿入※象限次第で処理を分岐
	let insertedTree;
	if (quadrant.includes('Right')) {
		insertedTree = insertUnder(newTree, overId, activeNode);
	} else if (quadrant.includes('Left')) {
		insertedTree = insertSibling(newTree, overId, activeNode, quadrant);
	}

  // ③ over のレベルを取得するための検索
  const findLevel = (nodes: Item[], id: string): number | null => {
		for (const n of nodes) {
			if (n.id === id) return n.level;
      const r = findLevel(n.children, id);
      if (r !== null) return r;
    }
    return null;
  };

	if (!insertedTree) return tree
  const overLevel = findLevel(insertedTree, overId);

  // ④ active の level を “overLevel + 1” に変更
	if (!overLevel) return tree
  updateLevels(activeNode, overLevel + 1);

  return insertedTree;
}


export { moveCard };