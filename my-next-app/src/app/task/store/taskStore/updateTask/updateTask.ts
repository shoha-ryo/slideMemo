import { AppState, CardType } from "@/types/task";
import { emptyTasks } from "@/app/task/actions/emptyTasks";
import { getObjectDiff } from "@/app/task/actions/getDiff";
import { ReturnTasks } from "@/types/task";

/**
 * カードの情報を更新し、newStateとdiffTasksを返す
 */
export const updateCardLogic = (
  cardId: string,
  updates: Partial<CardType>, // 変更があった差分だけ受け取る
  state: AppState
): ReturnTasks => {
  const targetCard = state.cards[cardId];

  // 1. 存在チェック
  if (!targetCard) {
    return { newState: state, diffTasks: emptyTasks };
  }

  // 2. 新しいカードオブジェクトを作成 (イミュータブル)
  const updatedCard: CardType = {
    ...targetCard,
    ...updates,
  };

  // 3. 全体のcardsを更新
  const newCards = {
    ...state.cards,
    [cardId]: updatedCard,
  };

  // 4. getObjectDiff を使ってAPI送信用の差分を計算
  const diff = getObjectDiff(targetCard, updatedCard);

  // 5. 差分がない場合は何もしない
  if (Object.keys(diff).length === 0) {
    return { newState: state, diffTasks: emptyTasks };
  }

  return {
    newState: {
      ...state,
      cards: newCards,
    },
    diffTasks: {
      ...emptyTasks,
      updateTasks: {
        ...emptyTasks.updateTasks,
        cards: [{ id: cardId, ...diff }],
      },
    },
  };
};