'use client';

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Card from "../Card/Card";
import CardCreateButton from "../Card/CardCreateButton";
import { useItemStore } from "../../store/ItemStore";
import { Item } from '@/types/item'

interface BoardProps {
  id: string;
  selfItem: Item;
  children: Item[];
}

export default function Board({ id, selfItem, children }: BoardProps) {

	const {} = useItemStore();

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

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
      {children.map((c) => (
        <Card key={c.id} {...c} />
      ))}
			<CardCreateButton selfItem={selfItem} />
    </div>
  );
}
