"use client";

import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Card from "../Card/Card";
import CardCreateButton from "../Card/CardCreateButton";
import { BoardType } from "@/types/task";

// interface BoardProps {
//   id: string;
//   selfItem: Item;
//   children: Item[];
// }

export default function Board({ board }: { board: BoardType }) {
  // const {} = useItemStore();

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: board.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: 12,
    background: "#f5f5f5",
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    width: 800,
    gap: 12,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div>{board.id}</div>
      <SortableContext
        items={board.cardIds}
        strategy={verticalListSortingStrategy}
      >
        {board.cardIds.map((cardId: string) => (
          <Card key={cardId} cardId={cardId} />
        ))}
      </SortableContext>
    </div>
  );
}
