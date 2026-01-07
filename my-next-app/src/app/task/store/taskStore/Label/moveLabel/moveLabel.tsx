import {
  AppState,
  ReturnTasks,
  CardType,
  Payload,
} from "@/app/task/store/taskStore/types/TasksType";
import { getObjectDiff } from "@/app/task/actions/getDiff";
import { emptyTasks } from "@/app/task/actions/emptyTasks";

export function moveLabelLogic(
  payload: Payload, // ドロップ先ID: "card-uuid"
  state: AppState,
): ReturnTasks {
  const { activeId, overId } = payload;
  const { cards } = state;

  // 1. 基本チェック：ドロップ先がカードであること
  if (!activeId || !overId || !overId.includes("card-")) {
    return { newState: state, diffTasks: emptyTasks };
  }

  const originalLabelId = activeId.split("_")[0];
  const targetCardId = overId;
  const targetCard = cards[targetCardId];
  if (!targetCard) return { newState: state, diffTasks: emptyTasks };

  const now = Date.now();

  // --- パターンA: マスター（サイドバー）からのドラッグ（増殖） ---
  if (activeId.includes("_master")) {
    // すでにターゲットに同じラベルがあれば重複させない
    if (targetCard.labelIds.includes(originalLabelId)) {
      return { newState: state, diffTasks: emptyTasks };
    }

    const newTargetCard: CardType = {
      ...targetCard,
      labelIds: [...targetCard.labelIds, originalLabelId],
      updatedAt: now,
    };

    return {
      newState: {
        ...state,
        cards: { ...cards, [targetCardId]: newTargetCard },
      },
      diffTasks: {
        ...emptyTasks,
        createTasks: { ...emptyTasks.createTasks },
        updateTasks: {
          ...emptyTasks.updateTasks,
          cards: [
            { id: targetCardId, ...getObjectDiff(targetCard, newTargetCard) },
          ] as Partial<CardType>[],
        },
      },
    };
  }

  // --- パターンB: カード間でのドラッグ（移動） ---
  if (activeId.includes("_card-")) {
    // "label-uuid_card-uuid" から "_" を区切り文字として移動元カードIDを抽出
    // split('_')[1] で "card-uuid" を取得
    const sourceCardId = activeId.split("_")[1];
    const sourceCard = cards[sourceCardId];

    // 同一カード内の移動、またはカードデータ不在なら何もしない
    if (!sourceCard || sourceCardId === targetCardId) {
      return { newState: state, diffTasks: emptyTasks };
    }

    const isDuplicate = targetCard.labelIds.includes(originalLabelId);

    // 移動元：ラベルを削除
    const newSourceCard: CardType = {
      ...sourceCard,
      labelIds: sourceCard.labelIds.filter((id) => id !== originalLabelId),
      updatedAt: now,
    };

    // 移動先：ラベルを追加（重複チェック済み）
    const newTargetCard: CardType = {
      ...targetCard,
      labelIds: isDuplicate
        ? targetCard.labelIds
        : [...targetCard.labelIds, originalLabelId],
      updatedAt: now,
    };

    return {
      newState: {
        ...state,
        cards: {
          ...cards,
          [sourceCardId]: newSourceCard,
          [targetCardId]: newTargetCard,
        },
      },
      diffTasks: {
        ...emptyTasks,
        updateTasks: {
          ...emptyTasks.updateTasks,
          cards: [
            { id: sourceCardId, ...getObjectDiff(sourceCard, newSourceCard) },
            { id: targetCardId, ...getObjectDiff(targetCard, newTargetCard) },
          ] as Partial<CardType>[],
        },
      },
    };
  }

  return { newState: state, diffTasks: emptyTasks };
}
