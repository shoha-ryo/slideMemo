"use client";

import { useState, useRef } from "react";
import { useDraggable, useDroppable, useDndContext } from "@dnd-kit/core";
import { MagneticLabel } from "../Label/MagneticLabel";

import { useTaskStore } from "../../store/taskStore/taskStore";
import { useModalStore } from "../../store/ModalStore";
import FormattedText from "./FormattedText";
import { Button } from "@/components/ui/button";
import { useShallow } from "zustand/shallow";
import DraftTask from "./DraftTask";
import { handleKeyDown } from "../../actions/handler";
import { DraggableLabel } from "../Label/Label";
import { ToolTip } from "@/components/ui/ToolTip";

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

  const { cards, dropPosition, labels, activeId } = useTaskStore(
    useShallow((state) => ({
      cards: state.cards,
      labels: state.labels,
      dropPosition: state.dropPosition,
      activeId: state.activeId,
    })),
  );
  const card = cards[cardId];

  const { active } = useDndContext();
  const isActive = active?.id === cardId;
  const buttonRef = useRef(null);

  const draggableStyle = isDragging
    ? "ring-4 ring-accent/50 bg-card opacity-50" // 移動元
    : isActive
      ? "opacity-20 cursor-grabbing" // 掴んでいる時
      : "cursor-grab"; // 掴んでいない時

	const isActiveLabel = activeId?.includes("label-");
	const isActiveCard = activeId?.includes("card-");
	const droppableStyle =
		isOver && !isActive && (isActiveCard || isActiveLabel)
			? (isActiveLabel || dropPosition === "center") // ラベル中、またはカードで中央の時
				? "bg-accent/30"
				: "bg-accent/30"   // カードで上部・下部の時
			: "bg-card border";

  // 1. 各状態の影を個別に定義
  const isTarget = isOver && !isActive && activeId?.startsWith("card-");
  // A: ドラッグ挿入位置のインジケーター (内側の線)
  let indicatorShadow = "inset 0 0 0 0 transparent";
  if (isTarget && activeId?.startsWith("card-")) {
    if (dropPosition === "top")
      indicatorShadow = "inset 0 15px 0 -2px var(--accent-border)";
    else if (dropPosition === "bottom")
      indicatorShadow = "inset 0 -15px 0 -2px var(--accent-border)";
    else if (dropPosition === "center")
      indicatorShadow = "inset 0 0 0 4px var(--accent-border)";
  }
  // B: 枠線 (ホバー時またはターゲット時に表示)
  const ringShadow =
  isHovered || (isOver && !isActive)
    ? (isActiveLabel || (isTarget && dropPosition === "center"))
      ? "inset 0 0 0 3px var(--accent-border)" // ラベルなら太く
      : "inset 0 0 0 2px var(--accent-border)" // それ以外（ホバーなど）は2px
    : "inset 0 0 0 0 transparent";
  // C: ホバー時の浮遊感 (外側の影)
  const hoverGlow =
    isHovered && !isDragging
      ? "0 0 15px var(--accent-shadow)"
      : "0 0 0 transparent";
  // 2. すべてを合体 (カンマ区切り)
  const finalBoxShadow = `${indicatorShadow}, ${ringShadow}, ${hoverGlow}`;
  // 3. クラスからは影関連を削除
  const hoveredStyle = isHovered ? "z-100 relative" : "";
  const translateY = isHovered && !isDragging ? "-4px" : "0px";

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
      style={{
        boxShadow: finalBoxShadow,
        transform: `translateY(${translateY})`,
        transition:
          "box-shadow 0.3s ease-in-out, transform 0.2s, background-color 0.2s",
      }}
      className={`card relative
				p-1.5 pl-2.5 mb-1.25 ml-1 mr-1
				border rounded-lg
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
              <div className="flex flex-wrap space-x-2">
                {card.labelIds.map((labelId) => (
                  <MagneticLabel key={labelId}>
                    <div
                      className="
												relative origin-left mt-2 max-w-full hover:scale-120"
                      key={`${labelId}_${cardId}`}
                    >
                      <DraggableLabel
                        label={labels[labelId]}
                        cardId={cardId}
                        size={{ top: 5, bottom: 5, left: 2, right: 2 }}
                      ></DraggableLabel>
                    </div>
                  </MagneticLabel>
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
              <ToolTip content={"カードを追加"}>
                <Button
                  ref={buttonRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDrafting(true);
                  }} // モーダル表示をブロックする。
                  variant="ghost"
                  className="group mr-2 h-8 w-8 rounded-full border"
                >
                  ＋
                </Button>
              </ToolTip>
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
