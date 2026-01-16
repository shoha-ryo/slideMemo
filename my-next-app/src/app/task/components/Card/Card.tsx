"use client";

import { useState } from "react";
import { useDraggable, useDroppable, useDndContext } from "@dnd-kit/core";
import { useTaskStore } from "../../store/taskStore/taskStore";
import { useModalStore } from "../../store/ModalStore";
import FormattedText from "./FormattedText";
import { Button } from "@/components/ui/button";
import { useShallow } from "zustand/shallow";
import DraftTask from "./DraftTask";
import { handleKeyDown } from "../../actions/handler";
import { DraggableLabel } from "../Sidebar/Label/Label";

// Draggable/Droppable コンポーネント
const Card = ({ cardId }: { cardId: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
  } = useDraggable({
    id: cardId,
  });

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: cardId,
  });

  const { cards, dropPosition, labels } = useTaskStore(
    useShallow((state) => ({
      cards: state.cards,
      labels: state.labels,
      dropPosition: state.dropPosition,
    })),
  );
  const card = cards[cardId];

  const { active } = useDndContext();
  const isActive = active?.id === cardId;

  const draggableStyle = isDragging
    ? "ring-20 ring-accent/50 bg-card" // 移動元
    : isActive
      ? "opacity-20 cursor-grabbing" // 掴んでいる時
      : "cursor-grab"; // 掴んでいない時
  const droppableStyle =
    isOver && !isActive
      ? dropPosition === "top"
        ? "ring-2 ring-accent-border border-t-10 border-t-accent-border bg-accent/30" // 上部
        : dropPosition === "bottom"
          ? "ring-2 ring-accent-border border-b-10 border-b-accent-border bg-accent/30" // 下部
          : "ring-4 ring-accent-border bg-accent/30" // 真ん中
      : "bg-card border"; // ホバーしていない、または自分が動いている時
  const hoveredStyle = isHovered
    ? "-translate-y-1 ring-2 ring-accent-border shadow-lg shadow-accent-shadow z-100 relative"
    : "transition-all duration-200";

  const setNodeRef = (node: HTMLElement | null) => {
    setDroppableRef(node);
    setDraggableRef(node);
  };

  const { showModal } = useModalStore();
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    showModal(cardId, "card");
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (!card) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      data-card-id={cardId}
      className={`card relative
				p-2.5 pl-2.5 mb-1.25 ml-1 mr-1
				border rounded-lg
				transition-all duration-200
				${hoveredStyle}
				${draggableStyle}
				${droppableStyle}
				focus-visible:ring-3 focus-visible:ring-accent-border focus-visible:z-100 active:scale-95
			`}
      {...listeners}
      {...attributes}
      onClick={handleCardClick}
      tabIndex={0}
      onKeyDown={(e) => handleKeyDown(e, showModal)}
    >
      <>
        <div
          className="relative" // ボタンのabsoluteの基準点にする
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex justify-between p-2">
            <div className="min-w-0 flex-1">
              {/* タイトル */}
              <strong className="block text-sm text-foreground/80">
                <FormattedText text={card.title} />
              </strong>

              {/* 詳細 */}
              {card.details ? (
                <div className="text-xs text-card-foreground/50 mt-1">
                  <FormattedText text={card.details} />
                </div>
              ) : null}

              {/* ラベル */}
              <div className="flex flex-wrap -space-x-2">
                {card.labelIds.map((labelId) => (
                  <div
                    className="scale-75 origin-left max-w-full"
                    key={`${labelId}_${cardId}`}
                  >
                    <DraggableLabel
                      label={labels[labelId]}
                      cardId={cardId}
                    ></DraggableLabel>
                  </div>
                ))}
              </div>
            </div>
            {/* ホバー時のボタンチラつき防止 */}
          </div>

          {/* 自身にホバー時のみ表示 */}
          {isHovered && (
            <div
              // グラデーション配置
              className="absolute inset-y-0 right-0 flex ml-auto items-start
                  pl-15
                  bg-linear-to-r from-transparent from-0%
									via-card via-20% to-card to-100%"
            >
              {/* カード追加ボタン */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDrafting(true);
                }} // モーダル表示をブロックする。
                variant="ghost"
                className="mt-2 mr-2 h-8 w-8 rounded-full border"
              >
                ＋
              </Button>
            </div>
          )}
        </div>

        {isDrafting && (
          <DraftTask
            source={{ type: "card", data: card }}
            onClose={() => setIsDrafting(false)}
          />
        )}

        {/* 子カードのレンダリングエリア */}
        {card.childrenIds.length > 0 && (
          <div>
            <div className="h-3" />
            {card.childrenIds.map((childId) => (
              <Card key={childId} cardId={childId} />
            ))}
          </div>
        )}
      </>
    </div>
  );
};

export default Card;
