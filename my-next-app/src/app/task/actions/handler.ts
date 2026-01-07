"use client";

import { ModalStore } from "../store/ModalStore";

export const handleKeyDown = (
  e: React.KeyboardEvent,
  showModal: Pick<ModalStore, "showModal">["showModal"],
) => {
  const current = document.activeElement as HTMLElement;
  const isInput =
    current.tagName === "INPUT" ||
    current.tagName === "TEXTAREA" ||
    current.isContentEditable;
  if (isInput) return;

  e.stopPropagation();

  const isNothingFocused = !current || current === document.body;
  if (isNothingFocused) {
    const isArrowKey = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
    ].includes(e.key);
    if (isArrowKey) {
      e.preventDefault();
      (document.querySelector(".board") as HTMLElement)?.focus();
    }
    return; // ここで終了させる（下の switch を実行させない）
  }

  switch (e.key) {
    case "ArrowDown": {
      e.preventDefault();

      // --- 1. ボードを選択している場合 ---
      if (current.classList.contains("board")) {
        const firstCard = current.querySelector<HTMLElement>(".card");
        firstCard?.focus();
        break;
      }

      // --- 2. カードを選択している場合 ---
      if (current.classList.contains("card")) {
        // A. まず子要素（ネストされたカード）があれば、最初の子へ
        const firstChild = current.querySelector<HTMLElement>(".card");
        if (firstChild) {
          firstChild.focus();
          break;
        }

        // B. 子がいなければ、次の兄弟要素へ
        const nextSibling = current.nextElementSibling as HTMLElement;
        if (nextSibling && nextSibling.classList.contains("card")) {
          nextSibling.focus();
          break;
        }

        // C. 兄弟もいなければ、親を遡って「親の兄弟」を探す
        let parent = current.parentElement?.closest(
          ".card",
        ) as HTMLElement | null;
        while (parent) {
          const parentNextSibling = parent.nextElementSibling as HTMLElement;
          if (
            parentNextSibling &&
            parentNextSibling.classList.contains("card")
          ) {
            parentNextSibling.focus();
            return; // 見つかったら終了
          }
          // さらに上の親の兄弟を探しに行く
          parent = parent.parentElement?.closest(".card") as HTMLElement | null;
        }
      }
      break;
    }
    case "ArrowUp": {
      e.preventDefault();

      // --- 1. カードを選択している場合 ---
      if (current.classList.contains("card")) {
        // A. 前の兄弟がいるか確認
        const prevSibling = current.previousElementSibling as HTMLElement;

        if (prevSibling && prevSibling.classList.contains("card")) {
          // その兄弟の中に「子カード」があるなら、その「一番最後の子」まで潜る必要がある
          // (これをしないと、子カードを飛ばして兄弟の親玉にフォーカスが当たってしまう)
          const lastChild = prevSibling.querySelector(
            ".card:last-of-type",
          ) as HTMLElement;
          if (lastChild) {
            lastChild.focus();
          } else {
            prevSibling.focus();
          }
          break;
        }

        // B. 前の兄弟がいなければ、親カード（親タスク）へ戻る
        const parentCard = current.parentElement?.closest(
          ".card",
        ) as HTMLElement;
        if (parentCard) {
          parentCard.focus();
          break;
        }

        // C. 親カードもなければ、所属している「ボード」自体へ戻る
        const myBoard = current.closest(".board") as HTMLElement;
        myBoard?.focus();
      }
      break;
    }
    case "ArrowRight": {
      e.preventDefault();
      const currentBoard = current.closest(".board");
      const nextBoard = currentBoard?.nextElementSibling?.closest(
        ".board",
      ) as HTMLElement;
      nextBoard?.focus();
      break;
    }
    case "ArrowLeft": {
      e.preventDefault();
      const currentBoard = current.closest(".board");
      const prevBoard = currentBoard?.previousElementSibling?.closest(
        ".board",
      ) as HTMLElement;
      prevBoard?.focus();
      break;
    }
    case "Enter": {
      e.preventDefault();
      let currentId;
      if (current.classList.contains("card")) {
        currentId = current.dataset.cardId;
        if (!currentId) return;
        showModal(currentId, "card");
      } else {
        currentId = current.dataset.boardId;
        if (!currentId) return;
        showModal(currentId, "board");
      }
      break;
    }
    case " ":
      // dnd-kitのKeyboardSensorが反応してドラッグが始まる
      break;
  }
};

export const handleGlobalKeyDown = (e: KeyboardEvent) => {
  const current = document.activeElement;

  // body にフォーカスがある（＝何も選択されていない）時だけ処理する
  if (current === document.body || current === null) {
    const isArrowKey = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
    ].includes(e.key);

    if (isArrowKey) {
      // 最初のターゲットを探す
      const firstTarget = document.querySelector<HTMLElement>(".board, .card");
      if (firstTarget) {
        e.preventDefault();
        firstTarget.focus();
      }
    }
  }
};
