// src/app/task/components/Label/DraggableLabel.tsx
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { LabelType } from "../../../store/taskStore/types/TasksType";

type Props = {
  label: LabelType;
  cardId: string;
};

export const DraggableLabel = ({ label, cardId }: Props) => {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
				px-2.5 py-1
        border rounded-4xl
        text-xs font-bold
        cursor-grab select-none
        whitespace-nowrap truncate
				transition-transform duration-200
        hover:ring-2
			`}
    >
      {label.name}
    </div>
  );
};
