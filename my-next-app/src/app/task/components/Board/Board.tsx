"use client";

import { useState } from "react";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Card from "../Card/Card";
import { Button } from "@/components/ui/button";
import { BoardType } from "@/types/TasksType";
import DraftTask from "../Card/DraftTask";
import { useTaskStore } from "../../store/taskStore/taskStore";
import { useShallow } from "zustand/shallow";
import { useModalStore } from "../../store/ModalStore";
import { Ghost } from "lucide-react";

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
    "w-[400px] gap-[3px] p-3 " +
    "bg-gray-100 rounded-lg ";

  const [isHovered, setIsHovered] = useState(false);
  const isActive = activeId?.includes(board.id);

  const draggableStyle = isDragging
    ? "ring-2 ring-gray-300 bg-gray-100" // 移動元
    : isActive
      ? "opacity-20 cursor-grabbing" // 掴んでいる時
      : "cursor-grab"; // 掴んでいない時
  const droppableStyle = isOver && !isActive ? "ring-2 ring-cyan-500" : "";
  const hoveredStyle = isHovered ? "shadow-xl" : "";

  const handleBoardClick = () => {
    showModal(board.id, "board");
  };

  const [isDrafting, setIsDrafting] = useState(false);

  return (
    <div
      ref={setNodeRef}
      className={`
				${style}
				${hoveredStyle}
				${draggableStyle}
				${droppableStyle}
				`}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleBoardClick}
    >
      <div className="font-black text-center">{board.title}</div>
      <SortableContext
        items={board.cardIds}
        strategy={verticalListSortingStrategy}
      >
        {board.cardIds.map((cardId: string) => (
          <Card key={cardId} cardId={cardId} />
        ))}
      </SortableContext>

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
          className="mt-2 mr-2 h-8 rounded-full"
        >
          ＋カードを追加
        </Button>
      )}
    </div>
  );
}
