import {
  AppState,
  ReturnTasks,
  CardType,
} from "@/app/task/store/taskStore/types/TasksType";
import { emptyTasks } from "@/app/task/actions/emptyTasks";

/**
 * マスターラベルを削除し、すべてのカードからその紐付けを解除するロジック
 * @param labelId 削除する純粋なラベルID (例: "label-uuid")
 * @param state 現在のAppState
 */
export function deleteMasterLabelLogic(
  labelId: string,
  state: AppState,
): ReturnTasks {
  const { labels, cards } = state;

  // 1. 対象のラベルが存在しない場合は何もしない
  if (!labels[labelId]) {
    return { newState: state, diffTasks: emptyTasks };
  }

  // 2. labelsオブジェクトから該当ラベルを削除
  const { [labelId]: _, ...newLabels } = labels;

  // 3. すべてのカードをループして、labelIdsからそのIDを削除
  //    同時に、変更があったカードだけを抽出してupdateTasksに含める
  const updatedCards: { [key: string]: CardType } = {};
  const cardsToUpdateInDB: Partial<CardType>[] = [];

  Object.values(cards).forEach((card) => {
    if (card.labelIds.includes(labelId)) {
      // ラベルが含まれている場合のみ新しい配列を作成
      const newLabelIds = card.labelIds.filter((id) => id !== labelId);
      const updatedCard = {
        ...card,
        labelIds: newLabelIds,
        updatedAt: Date.now(),
      };

      updatedCards[card.id] = updatedCard;

      // DB更新用リストに追加
      cardsToUpdateInDB.push({
        id: card.id,
        labelIds: newLabelIds,
        updatedAt: updatedCard.updatedAt,
      });
    } else {
      // 変更がないカードはそのまま
      updatedCards[card.id] = card;
    }
  });

  // 4. Stateと差分を返す
  return {
    newState: {
      ...state,
      labels: newLabels,
      cards: updatedCards,
    },
    diffTasks: {
      ...emptyTasks,
      updateTasks: {
        ...emptyTasks.updateTasks,
        cards: cardsToUpdateInDB,
      },
      deleteTasks: {
        ...emptyTasks.deleteTasks,
        labelIds: [labelId], // マスターラベルの削除を通知
      },
    },
  };
}
