import { CardType, ReturnTasks, TaskStore } from "@/types/TasksType";
import { emptyTasks } from "@/app/task/actions/emptyTasks";

/**
 * 指定されたカードIDとその子孫を全て削除し、親の参照を更新する
 */
export const deleteCardLogic = (
  cardId: string,
  state: TaskStore,
): ReturnTasks => {
  const newCards = { ...state.cards };
  const newBoards = { ...state.boards };
  const targetCard = newCards[cardId];

  // 存在しない場合は何もしない
  if (!targetCard)
    return {
      newState: state,
      diffTasks: emptyTasks,
    };

  // -------------------------------------------------
  // 1. 親（Board または ParentCard）からの参照を削除
  // -------------------------------------------------
  if (targetCard.parentId) {
    // 親がカードの場合
    const parentCard = newCards[targetCard.parentId];
    if (parentCard) {
      // 親カードのデータを更新 (イミュータブルに)
      newCards[targetCard.parentId] = {
        ...parentCard,
        childrenIds: parentCard.childrenIds.filter((id) => id !== cardId),
      };
    }
  } else {
    // 親がボードの場合 (ルートカード)
    const parentBoard = newBoards[targetCard.boardId];
    if (parentBoard) {
      // ボードのデータを更新
      newBoards[targetCard.boardId] = {
        ...parentBoard,
        cardIds: parentBoard.cardIds.filter((id) => id !== cardId),
      };
    }
  }

  // -------------------------------------------------
  // 2. 削除対象のIDリストを収集 (再帰的に子孫も含む)
  // -------------------------------------------------
  const idsToDelete = getDescendantIds(cardId, newCards);
  idsToDelete.push(cardId); // 自分自身も追加

  // -------------------------------------------------
  // 3. カードオブジェクト自体を削除
  // -------------------------------------------------
  idsToDelete.forEach((id) => {
    delete newCards[id];
  });

  // 更新された state を返す
  return {
    newState: {
      ...state,
      cards: newCards,
      boards: newBoards,
    },
    diffTasks: {
      ...emptyTasks,
      deleteTasks: {
        ...emptyTasks.deleteTasks,
        cardIds: idsToDelete,
      },
    },
  };
};

/**
 * ヘルパー関数: 指定されたカードの子孫IDを再帰的に全て取得する
 */
const getDescendantIds = (
  parentId: string,
  cards: Record<string, CardType>,
): string[] => {
  let ids: string[] = [];
  const card = cards[parentId];

  if (!card) return ids;

  if (card.childrenIds && card.childrenIds.length > 0) {
    card.childrenIds.forEach((childId) => {
      ids.push(childId);
      // 再帰呼び出し
      ids = [...ids, ...getDescendantIds(childId, cards)];
    });
  }

  return ids;
};
