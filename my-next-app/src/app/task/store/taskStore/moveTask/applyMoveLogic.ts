import { Payload } from "@/types/task";
import { AppState, CardType, BoardType } from "@/types/task";

export const applyMoveLogic = (payload: Payload, state: AppState) => {
  // 必要なデータの読み込み
  const { activeId, overId, dropPosition } = payload;
  const { boardOrder, boards, cards } = state;

  if (!activeId || !overId || activeId === overId) return state;

	// --- 【追加】循環参照（自分自身の子孫への移動）防止チェック ---
  // overIdがボードではなく、かつactiveIdの子孫である場合は無効な操作として無視する
  const isOverBoardToCheck = !!boards[overId];
  if (!isOverBoardToCheck) {
    if (isAncestor(activeId, overId, cards)) {
      return state;
    }
  }
  // -------------------------------------------------------


  // 1. 状態のコピー (イミュータブルな操作のため)
  const newBoardOrder = [...boardOrder];
  const newBoards = { ...boards };
  const newCards = { ...cards };

  // 2. 変更箇所の追跡用リスト
  const dirtyCardIds = new Set<string>();
  const dirtyBoardIds = new Set<string>();

  // --- 移動ロジック開始 ---

  const activeCard = newCards[activeId];
  // overIdがボードIDかカードIDか判定（boards辞書にあるかどうか）
  const isOverBoard = !!newBoards[overId];

  // 移動先のボードIDを特定
  let destinationBoardId: string;
  if (isOverBoard) {
    destinationBoardId = overId;
  } else {
    // overがカードなら、そのカードが所属するボード
    destinationBoardId = newCards[overId].boardId;
  }

  // ■ Step 0: 元の親/ボードから「切り離し」処理
  // 移動処理をする前に、必ず現在の場所から削除する必要があります
  removeCardFromSource(
    activeId,
    newCards,
    newBoards,
    dirtyCardIds,
    dirtyBoardIds,
  ); // activeが削除されていること

  // ■ Step 1: ボード間移動の処理
  // 所属するボードが異なる場合は、自分と子孫のboardIdを全て更新する
  if (activeCard.boardId !== destinationBoardId) {
    recursivelyUpdateBoardId(
      activeId,
      destinationBoardId,
      newCards,
      dirtyCardIds,
    );
  }

  // ■ Step 2: 配置処理 (Drop先によって分岐)

  if (isOverBoard) {
    // A. ボード自体にドロップした場合 -> ボード直下の末尾に追加
    moveToBoardRoot(
      activeId,
      destinationBoardId,
      newBoards,
      newCards,
      dirtyCardIds,
      dirtyBoardIds,
    );
  } else {
    // B. 他のカードの上にドロップした場合

    // center -> 「子要素」としてネスト (nestCard)
    if (dropPosition === "center") {
      nestCard(activeId, overId, newCards, newBoards, dirtyCardIds, dirtyBoardIds);
    }
    // top, botoom -> 「兄弟要素」として並び替え (reorderSibling)
    else {
      reorderSibling(
        activeId,
        overId,
        dropPosition,
        newCards,
        newBoards,
        dirtyCardIds,
        dirtyBoardIds,
      );
    }
  }

  // --- 移動ロジック終了 ---

  // 3. APIへの送信準備 (オブジェクトの配列化など)
  const cardsToUpdate = Array.from(dirtyCardIds).map((id) => newCards[id]);
  const boardsToUpdate = Array.from(dirtyBoardIds).map((id) => newBoards[id]);

  // updateApi(cardsToUpdate, boardsToUpdate);

  // 4. Zustandへの返却
  return {
    cards: newCards,
    boards: newBoards,
    boardOrder: newBoardOrder,
  };
};

// =================================================================
// ヘルパー関数群
// =================================================================

/**
 * targetId (overId) の祖先に activeId が含まれるかをチェックする
 */
const isAncestor = (
  potentialAncestorId: string, // activeId
  targetId: string,          // overId
  cards: { [id: string]: CardType }
): boolean => {
  let currentId: string | null = cards[targetId]?.parentId;

  // targetId の親から順に、ツリーのルート(parentId: null)まで遡る
  while (currentId !== null && currentId !== undefined) {
    if (currentId === potentialAncestorId) {
      // 祖先に activeId が見つかった場合（循環参照になる）
      return true;
    }
    // さらに親へ遡る
    currentId = cards[currentId]?.parentId;
  }

  return false;
};


/**
 * 元の場所からカードIDを削除する
 */
const removeCardFromSource = (
  activeId: string,
  newCards: { [id: string]: CardType },
  newBoards: { [id: string]: BoardType },
  dirtyCardIds: Set<string>,
  dirtyBoardIds: Set<string>,
) => {
  const activeCard = newCards[activeId];
  const parentId = activeCard.parentId;

  if (parentId) {
    // 親カードがいる場合: 親のchildrenIdsから削除
    const parentCard = newCards[parentId];
    newCards[parentId] = {
      ...parentCard,
      childrenIds: parentCard.childrenIds.filter((id) => id !== activeId),
    };
    dirtyCardIds.add(parentId);
  } else {
    // 親がいない(ルート)場合: ボードのcardIdsから削除
    const boardId = activeCard.boardId;
    const board = newBoards[boardId];
    newBoards[boardId] = {
      ...board,
      cardIds: board.cardIds.filter((id) => id !== activeId),
    };
    dirtyBoardIds.add(boardId);
  }
};

/**
 * ボードIDを再帰的に更新する
 */
const recursivelyUpdateBoardId = (
  cardId: string,
  newBoardId: string,
  newCards: { [id: string]: CardType },
  dirtyCardIds: Set<string>,
) => {
  const card = newCards[cardId];

  // 自分のboardIdを更新
  if (card.boardId !== newBoardId) {
    newCards[cardId] = { ...card, boardId: newBoardId };
    dirtyCardIds.add(cardId);
  }

  // 子孫も更新
  card.childrenIds.forEach((childId) => {
    recursivelyUpdateBoardId(childId, newBoardId, newCards, dirtyCardIds);
  });
};

/**
 * カードを子要素として配置する (Nest)
 */
const nestCard = (
  activeId: string,
  overId: string, // 新しい親
  newCards: { [id: string]: CardType },
	newBoards: { [id: string]: BoardType },
  dirtyCardIds: Set<string>,
	dirtyBoardIds: Set<string>
) => {
  // 1. activeのparentを更新
  newCards[activeId] = { ...newCards[activeId], parentId: overId };
  dirtyCardIds.add(activeId);

  // 2. over(新しい親)のchildrenの末尾に追加
  const overCard = newCards[overId];
  newCards[overId] = {
    ...overCard,
    childrenIds: [...overCard.childrenIds, activeId],
  };
  dirtyCardIds.add(overId);
}

/**
 * カードを兄弟要素として並び替える (Reorder)
 */
const reorderSibling = (
  activeId: string,
  overId: string, // 兄弟となるカード
  dropPosition: "top" | "bottom", // 上に入れるか下に入れるか
  newCards: { [id: string]: CardType },
  newBoards: { [id: string]: BoardType },
  dirtyCardIds: Set<string>,
  dirtyBoardIds: Set<string>,
) => {
  const overCard = newCards[overId];
  const parentId = overCard.parentId;

  // 1. activeの親IDを、兄弟(over)と同じものに更新
  newCards[activeId] = { ...newCards[activeId], parentId: parentId };
  dirtyCardIds.add(activeId);

  // 2. 親のリスト(childrenIds または cardIds)内の順序を変更
  if (parentId) {
    // 親がカードの場合
    const parentCard = newCards[parentId];
    const newChildren = insertIntoArray(
      parentCard.childrenIds,
      activeId,
      overId,
      dropPosition,
    );

    newCards[parentId] = { ...parentCard, childrenIds: newChildren };
    dirtyCardIds.add(parentId);
  } else {
    // 親がボードの場合(ルートレベルでの並び替え)
    const boardId = overCard.boardId;
    const board = newBoards[boardId];
    const newCardIds = insertIntoArray(
      board.cardIds,
      activeId,
      overId,
      dropPosition,
    );

    newBoards[boardId] = { ...board, cardIds: newCardIds };
    dirtyBoardIds.add(boardId);
  }
};

/**
 * ボードのルート(直下)に配置する
 */
const moveToBoardRoot = (
  activeId: string,
  destinationBoardId: string,
  newBoards: { [id: string]: BoardType },
  newCards: { [id: string]: CardType },
  dirtyCardIds: Set<string>,
  dirtyBoardIds: Set<string>,
) => {
  // 1. activeのparentをnullにする
  newCards[activeId] = { ...newCards[activeId], parentId: null };
  dirtyCardIds.add(activeId);

  // 2. ボードのcardIdsの末尾に追加
  const board = newBoards[destinationBoardId];
  newBoards[destinationBoardId] = {
    ...board,
    cardIds: [...board.cardIds, activeId],
  };
  dirtyBoardIds.add(destinationBoardId);
};

/**
 * 配列の特定の位置にIDを挿入するユーティリティ
 */
const insertIntoArray = (
  array: string[],
  activeId: string,
  overId: string,
  dropPosition: "top" | "bottom",
): string[] => {
  const newArray = [...array];
  const overIndex = newArray.indexOf(overId);

  if (overIndex === -1) return [...newArray, activeId]; // 万が一見つからない場合

  if (dropPosition === "top") {
    newArray.splice(overIndex, 0, activeId);
  } else {
    newArray.splice(overIndex + 1, 0, activeId);
  }

  return newArray;
};
