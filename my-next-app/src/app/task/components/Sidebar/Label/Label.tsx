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

  // 明るさ補正(0~100で設定)
  const lightenColor = (hex: string, percent: number) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  };

  // const style: React.CSSProperties = {
  //   transform: CSS.Transform.toString(transform),
  //   transition,
  //   opacity: isDragging ? 0.5 : 1,
  //   color: lightenColor(color, 80),
  //   backgroundColor: color,
  //   borderColor: lightenColor(color, 80),
  // };
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
				px-2 py-0.5
        border rounded-4xl
        text-xs font-bold
        cursor-grab select-none
        whitespace-nowrap
			`}
    >
      {label.name}
    </div>
  );
};
