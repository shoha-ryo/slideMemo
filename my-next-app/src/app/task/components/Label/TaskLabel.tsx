import { useDraggable } from '@dnd-kit/core';
import { isDragging } from 'framer-motion';

interface LabelType {
	id: string,
	color: string,
	name: string,
}

export function TaskLabel({ id, color, name }: LabelType) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
    data: { type: 'LABEL', color, name } // ドロップ時に参照するデータ
  });

	const draggingStyle = isDragging ? "opacity-20" : null

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className="label-chip">
			<div
				className={`relative p-2 bg-red-500 w-20 rounded-2xl text-center text-white font-bold ${draggingStyle}`}
			>
      	{name}
			</div>
    </div>
  );
}