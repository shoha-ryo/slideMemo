"use client";

import { useEffect, useState } from "react";
import { useDraggable, useDroppable, useDndContext } from "@dnd-kit/core";
import { useTaskStore } from "../../store/taskStore/taskStore";
import { useModalStore } from "../../store/ModalStore";
import FormattedText from "./FormattedText";
import { Button } from "@/components/ui/button";
import { useShallow } from "zustand/shallow";
import DraftCard from "./DraftCard";

// Draggable/Droppable コンポーネント
const Card = ({ cardId }: { cardId: string }) => {

  const [isNew, setIsNew] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  // ★追加: 下書きモードかどうかを管理するステート
  const [isDrafting, setIsDrafting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNew(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

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

  const { activeId, overId, cards, dropPosition } = useTaskStore(
    useShallow(state => ({
      activeId: state.activeId,
      overId: state.overId,
      cards: state.cards,
			dropPosition: state.dropPosition,
    }))
  );
  const card = cards[cardId];

  const { active, over } = useDndContext();

  const isActive = active?.id === cardId;
  const quadrant = over?.id === cardId ? over?.data?.current?.quadrant : null;

	const draggableStyle = isDragging
		? "ring-2 ring-gray-300 bg-gray-100" // 移動元
		: isActive
			? "opacity-20 cursor-grabbing" // 掴んでいる時
			: "cursor-grab" // 掴んでいない時
	const droppableStyle = isOver && !isActive
		? dropPosition === "top"
			? "border-t-10 border-t-cyan-500 bg-cyan-50" // 上部に青線
			: dropPosition === "bottom"
				? "border-b-10 border-b-cyan-500 bg-cyan-50" // 下部に青線
				: "ring-3 ring-cyan-300 bg-cyan-50"        // center（真ん中）
		: "bg-white border-gray-300"; // ホバーしていない、または自分が動いている時

  const setNodeRef = (node: HTMLElement | null) => {
    setDroppableRef(node);
    setDraggableRef(node);
  };

  const { showModal } = useModalStore();
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    showModal(cardId);
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
      className={`card relative
				p-[10px] pl-[10px] mb-[5px]
				border rounded-lg
				transition-all duration-200
				${isOver ? `q-${quadrant}` : ""}
				${isNew ? 'animate-highlight' : ''}
				${draggableStyle}
				${droppableStyle}
			`}
      {...listeners}
      {...attributes}
      onClick={handleCardClick}
    >
        <>
          <div
            className="relative" // ボタンのabsoluteの基準点にする
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex justify-between p-2">
              <div className="min-w-0 flex-1">
                <strong className="block"><FormattedText text={card.title}/></strong>
                {/* <div className="text-xs text-gray-400">{card.id}</div> */}
                <div className="text-sm text-gray-500">
                  <FormattedText text={card.details} />
                </div>
              </div>
              <div className="w-12 shrink-0" />
            </div>

            {/* 自身にホバー時のみ表示 */}
            {isHovered && (
              <div
                className="absolute inset-y-0 right-0 flex ml-auto items-start
                  pl-15
                  bg-linear-to-r from-transparent from-0% via-white via-20% to-white to-100%"
              >
                {/* ★追加: カード追加ボタン */}
                <Button
									onClick={(e) => {e.stopPropagation(); setIsDrafting(true)}} // モーダル表示をブロックする。
                  variant="ghost"
                  className="mt-2 mr-2 h-8 w-8 rounded-full border bg-white"
                >
                  ＋
                </Button>
              </div>
            )}
          </div>

          {/* ★追加: isDrafting=trueになると<DraftCard>が表示される */}
          {isDrafting && (
            <DraftCard
              source={{ type: "card", data: card }}
              onClose={() => setIsDrafting(false)}
            />
          )}

          {/* 子カードのレンダリングエリア */}
          {card.childrenIds.length > 0 && (
            <div>
              <div className="h-3"></div>
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