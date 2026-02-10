import {
  AppState,
  ReturnTasks,
  CardType,
} from "@/app/task/store/taskStore/types/TasksType";
import { getObjectDiff } from "@/app/task/actions/getDiff";
import { emptyTasks } from "@/app/task/actions/emptyTasks";

/**
 * カードからラベルを削除（紐付け解除）するロジック
 * @param activeId 削除対象の合成ID (例: "label-uuid_card-uuid")
 * @param originalLabelId 純粋なラベルID (例: "label-uuid")
 * @param state 現在のAppState
 */
export function deleteLabelFromCardLogic(
  activeId: string,
  state: AppState,
): ReturnTasks {
  const { cards } = state;

  // 1. 合成IDからカードIDとラベルIDを抽出 ("label-uuid_card-uuid")
  const [originalLabelId, cardId] = activeId.split("_");

  // マスター(サイドバー)のものを消そうとしている場合は何もしない
  if (!cardId || cardId === "master") {
    return { newState: state, diffTasks: emptyTasks };
  }

  const targetCard = cards[cardId];
  if (!targetCard) return { newState: state, diffTasks: emptyTasks };

  // 2. ラベルを配列から除外した新しいカードオブジェクトを作成
  const newTargetCard: CardType = {
    ...targetCard,
    labelIds: targetCard.labelIds.filter((id) => id !== originalLabelId),
    updatedAt: Date.now(),
  };

  // 3. 差分の抽出
  const updateTasks = [
    {
      id: cardId,
      ...getObjectDiff(targetCard, newTargetCard),
    },
  ];

  return {
    newState: {
      ...state,
      cards: {
        ...cards,
        [cardId]: newTargetCard,
      },
    },
    diffTasks: {
      ...emptyTasks,
      updateTasks: {
        ...emptyTasks.updateTasks,
        cards: updateTasks as Partial<CardType>[],
      },
    },
  };
}
