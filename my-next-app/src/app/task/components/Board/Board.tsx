"use client";

import { useState } from "react";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Card from "../Card/Card";
import { Button } from "@/components/ui/button";
import { BoardType } from "@/app/task/store/taskStore/types/TasksType";
import DraftTask from "../Card/DraftTask";
import { useTaskStore } from "../../store/taskStore/taskStore";
import { useShallow } from "zustand/shallow";
import { useModalStore } from "../../store/ModalStore";
import { handleKeyDown } from "../../actions/handler";

export default function Board({ board }: { board: BoardType }) {
  const { attributes, listeners, setNodeRef, isDragging, isOver } = useSortable(
    {
      id: board.id,
    },
  );

  const { activeId } = useTaskStore(
    useShallow((state) => ({
      activeId: state.activeId,
      overId: state.overId,
      cards: state.cards,
      dropPosition: state.dropPosition,
    })),
  );

  const { showModal } = useModalStore();

  const style =
    "flex flex-col self-start " +
    "w-[400px] shrink-0 " + // ★重要: shrink-0 を追加して潰れないようにする
    "max-h-[100%] " + // ★重要: ボードの最大高さを決めてスクロールを有効にする
    "w-[400px] gap-[3px] p-3 " +
    "bg-board rounded-lg ";

  const [isHovered, setIsHovered] = useState(false);
  const isActive = activeId?.includes(board.id);

  const draggableStyle = isDragging
    ? "ring-2 ring-accent-border bg-board" // 移動元
    : isActive
      ? "opacity-20 cursor-grabbing" // 掴んでいる時
      : "cursor-grab"; // 掴んでいない時
  const droppableStyle =
    isOver &&
    !isActive &&
    (activeId?.includes("-card") || activeId?.includes("-board"))
      ? "ring-2 ring-accent-border"
      : "";
  const hoveredStyle = isHovered ? "shadow-xl" : "";

  const handleBoardClick = () => {
    showModal(board.id, "board");
  };

  const [isDrafting, setIsDrafting] = useState(false);

  return (
    <div
      ref={setNodeRef}
      data-board-id={board.id}
      className={`
				board
				overflow-hidden
				${style}
				${hoveredStyle}
				${draggableStyle}
				${droppableStyle}
				focus-visible:ring-4 focus-visible:ring-accent-border focus-visible:z-10
				`}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleBoardClick}
      onKeyDown={(e) => handleKeyDown(e, showModal)}
      tabIndex={0}
    >
      <div className="font-black text-center mb-4">{board.title}</div>
      <div className="overflow-auto p-2 -m-2">
        <SortableContext
          items={board.cardIds}
          strategy={verticalListSortingStrategy}
        >
          {board.cardIds.map((cardId: string) => (
            <Card key={cardId} cardId={cardId} />
          ))}
        </SortableContext>
      </div>

      {isDrafting ? (
        <DraftTask
          source={{ type: "board", data: board }}
          onClose={() => setIsDrafting(false)}
        />
      ) : (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setIsDrafting(true);
          }} // モーダル表示をブロックする。
          variant="ghost"
          className="
						mt-2 mr-2 h-8
						rounded-full
						bg-board text-board-foreground
						hover:bg-board-foreground/10
					"
        >
          ＋カードを追加
        </Button>
      )}
    </div>
  );
}
