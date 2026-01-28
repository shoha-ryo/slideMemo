// src/app/task/components/Label/DraggableLabel.tsx
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { LabelType } from "../../store/taskStore/types/TasksType";
import { number } from "zod";

type Props = {
  label: LabelType;
  cardId: string;
	size?: {
		top: number
		bottom: number
		left: number
		right: number
	}
};

export const DraggableLabel = ({
	label,
	cardId,
	size={top: 0, bottom: 0, left: 0, right: 0} }: Props
) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${label.id}_${cardId}`,
    data: {
      originalId: label.id,
    },
  });

  const { color } = label;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    color: `${color}`,
    backgroundColor: `${color}40`,
    borderColor: `${color}`,
  };

	const beforeSize = `
		before:-top-${size.top}
		before:-bottom-${size.bottom}
		before:-left-${size.left}
		before:-right-${size.right}
	`

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
				px-1.5 py-0.5
        border rounded-4xl
        text-[9px] font-bold
        cursor-grab select-none
        whitespace-nowrap truncate
				transition-transform duration-200
        hover:ring-2 hover:shadow-color
				before:absolute
				${beforeSize}
				before:content-[''] before:bg-amer-400/10
			`}
    >
      {label.name}
    </div>
  );
};
