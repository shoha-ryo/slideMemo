import { Item } from '@/types/item'



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
// 怪しい再帰関数
function collectDescendantIds(node: Item): string[] {
  let result: string[] = [node.id]

  for (const child of node.children) {
    result = result.concat(collectDescendantIds(child))
  }

  return result
}


function isDroppingIntoOwnDescendant( // ノードの探索
  rootList: Item[],
  activeId: string,
  overId: string
): boolean {
  const activeNode = getNode(rootList, activeId) // activeノード全体を取得
  if (!activeNode) return false
	console.log(activeNode);

  const descendants = collectDescendantIds(activeNode) // activeノードの全子孫IDを収集
	console.log(descendants);

  // 自分の子孫に drop しようとしている → NG（循環が起きる）
  return descendants.includes(overId)
}



// ノードをツリーから削除するヘルパー関数
function removeNode(tree, targetId) {
  let removed = null;

  const walk = (nodes) => {
    return nodes.filter((node) => {
      if (node.id === targetId) {
        removed = node;
        return false;
      }
      node.children = walk(node.children);
      return true;
    });
  };

  const newTree = walk(tree);
  return { newTree, removed };
}


// ノードを特定の親の下に挿入するヘルパー関数
function insertUnder(tree, parentId, nodeToInsert) {
  const walk = (nodes) => {
    return nodes.map((node) => {
      if (node.id === parentId) {
        node.children = [...node.children, nodeToInsert];
      } else {
        node.children = walk(node.children);
      }
      return node;
    });
  };

  return walk(tree);
}


// レベル情報を更新するヘルパー関数
function updateLevels(node, baseLevel) {
  node.level = baseLevel;
  node.children.forEach((child) => updateLevels(child, baseLevel + 1));
}


// ノードを移動するメイン関数
function moveNode(tree, activeId, overId) {

	if (isDroppingIntoOwnDescendant(tree, activeId, overId)) {return tree;} // 加工せずに返す

  // ① active をツリーから外す
  const { newTree, removed: activeNode } = removeNode(tree, activeId);
  if (!activeNode) return tree; // 想定外の時は何もしない

  // ② active を over の子として挿入
  const insertedTree = insertUnder(newTree, overId, activeNode);

  // ③ over のレベルを取得するための検索
  const findLevel = (nodes, id) => {
    for (const n of nodes) {
      if (n.id === id) return n.level;
      const r = findLevel(n.children, id);
      if (r !== null) return r;
    }
    return null;
  };

  const overLevel = findLevel(insertedTree, overId);

  // ④ active の level を “overLevel + 1” に変更
  updateLevels(activeNode, overLevel + 1);

  return insertedTree;
}


export { moveNode };