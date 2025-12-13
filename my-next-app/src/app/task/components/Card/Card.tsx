"Card.tsx"
"use client";

import { useDraggable, useDroppable, useDndContext } from "@dnd-kit/core";
import { useModalStore } from "../../store/ModalStore";
import FormattedText from "./FormattedText";
import { useTaskStore } from "../../store/taskStore/taskStore"; 

// Draggable/Droppable コンポーネント
const Card = ({ cardId }: { cardId: string }) => {
  // --- 1. Draggableの設定 ---
  const {
		isDragging,
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
  } = useDraggable({
    id: cardId,
    data: {
      quadrant: null, // 象限情報をここで保持
    },
  });
  const { active, over } = useDndContext();
  const isActive = active?.id === cardId;
  const quadrant = over?.id === cardId ? over?.data?.current?.quadrant : null;

  const cards = useTaskStore(state => state.cards);
  const card = cards[cardId];

  // --- 2. Droppableの設定 ---
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: cardId, // Draggableと同じIDを使用
    data: {
      quadrant: null, // 象限情報をここで保持
    },
  });

  // --- 3. スタイリングとネストレベルの決定 ---
  const draggableStyle = isDragging
    ? {
        outline: "2px solid #00bcd4",
        cursor: "grabbing",
      }
    : {
        opacity: isActive ? 0.2 : 1,
        cursor: "grab",
      };

  const droppableStyle = {
    backgroundColor: isOver ? "#e0f7fa" : "white", // isOver のとき色を変える
  };

  // DraggableとDroppableのrefを両方設定
  const setNodeRef = (node: HTMLElement | null) => {
    setDroppableRef(node);
    setDraggableRef(node);
  };

  // クリックされた時にモーダルを呼び出す
  const { showModal } = useModalStore();
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 回帰されていても最前面の1回しかイベントを呼び出さないようにする
    showModal(cardId);
  };

  return (
    <div
      ref={setNodeRef} // 両方のrefを設定
      style={{
        padding: "10px",
        paddingLeft: `$10px`,
        marginBottom: "4px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        transition: "background-color 0.2s, outline 0.2s",
        position: "relative", // transformがなくても常にrelative固定
        ...draggableStyle,
        ...droppableStyle,
        marginLeft: "50px",
      }}
      className={`card ${isOver ? `q-${quadrant}` : ""}`}
      {...listeners} // ドラッグイベントのリスナー
      {...attributes} // アクセシビリティ属性
      onClick={handleCardClick}
    >
			{/* 表示アシスト */}
				{/* ホバーされた時だけ点線で３分割の表示 */}
				{isOver && (
					<div className="absolute inset-0 flex justify-around bg-cyan-100">
						<div className="flex-1 flex flex-col ">
							<div className="flex-1 border border-cyan-300">
								<span className="text-xs text-cyan-500 ">
                このカードの上に移動
            		</span>
							</div>
							<div className="flex-1 border border-cyan-300">
								<span className="text-xs text-cyan-500 ">
                このカードの下に移動
            		</span>
							</div>
						</div>
						<div className="flex-1 border border-cyan-300">
							<span className="text-xs text-cyan-500 ">
                このカードの中に移動
            	</span>
						</div>
					</div>
				)}

			{/* カードの内容を表示 */}
      <div style={{ paddingLeft: `10px`, paddingBottom: "15px" }}>
        <strong>
          <FormattedText text={card.title}></FormattedText>
        </strong>
        <div>{card.id}</div>
        <FormattedText
          text={card.details}
          style={{ fontSize: "0.8em", color: "#666" }}
        ></FormattedText>
      </div>

			{/* カードの子孫を表示 */}
      {card.childrenIds.length > 0 && (
        <div>
          {card.childrenIds.map((childId) => (
            <Card key={childId} cardId={childId} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Card;
