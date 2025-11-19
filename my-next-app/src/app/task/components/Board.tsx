'use client';

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Card from "./Card";
import CardCreateButton from "./CardCreateButton";

export default function Board({ id, selfItem, children, setItems }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: 12,
    background: "#f5f5f5",
    borderRadius: 8,
    display: "flex",
		flexDirection: "column",
		width: '800px',
    gap: 12,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children.map((c) => (
        <Card key={c.id} {...c} />
      ))}
			<CardCreateButton selfItem={selfItem} setItems={setItems} />
    </div>
  );
}
