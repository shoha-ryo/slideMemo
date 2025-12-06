'use client'

import { useDraggable, useDroppable, useDndContext } from '@dnd-kit/core';
import { Item } from '@/types/item';
import { useModalStore } from '../../store/ModalStore';
import FormattedText from './FormattedText';

// Draggable/Droppable コンポーネント
const Card: React.FC<Item> = ({ startOffset, id, level, title, details, children, useOverlay}) => {

  // --- 1. Draggableの設定 ---
  const { attributes, listeners, setNodeRef: setDraggableRef, transform } = useDraggable({
    id: id,
		data: {
			quadrant: null, // 象限情報をここで保持
		},
  });
	const { active, over } = useDndContext();
	const isActive = active?.id === id;
	const quadrant = over?.id === id ? over?.data?.current?.quadrant : null;



  // --- 2. Droppableの設定 ---
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
		id: id, // Draggableと同じIDを使用
			data: {
		quadrant: null, // 象限情報をここで保持
		},
  });


  // --- 3. スタイリングとネストレベルの決定 ---
	const draggableStyle = useOverlay ? {
		outline: '2px solid #00bcd4',
		cursor: 'grabbing',
	} : {
		opacity: isActive? 0.2 : 1,
		cursor: 'grab',
	};
  const nestingLevel = level - 1;
  const paddingLeft = nestingLevel * 0; // 20px ずつインデント
  const droppableStyle = {
    backgroundColor: isOver ? '#e0f7fa' : 'white', // isOver のとき色を変える
  };


  // DraggableとDroppableのrefを両方設定
  const setNodeRef = (node: HTMLElement | null) => {
    setDroppableRef(node);
    setDraggableRef(node);
  };

	// クリックされた時にモーダルを呼び出す
	const {showModal} = useModalStore()
	const handleCardClick = (e: React.MouseEvent) => {
		e.stopPropagation() // 回帰されていても最前面の1回しかイベントを呼び出さないようにする
		showModal(id)
	}



  return (
    <div
      ref={setNodeRef} // 両方のrefを設定
			style={{
				padding: '10px',
				paddingLeft: `${paddingLeft + 10}px`,
				marginBottom: '4px',
				border: '1px solid #ccc',
				borderRadius: '4px',
				transition: 'background-color 0.2s, outline 0.2s',
				position: 'relative', // transformがなくても常にrelative固定
				...draggableStyle,
				...droppableStyle,
				marginLeft: '50px',
		}}
			className={`card ${isOver ? `q-${quadrant}` : ""}`}
      {...listeners} // ドラッグイベントのリスナー
      {...attributes} // アクセシビリティ属性
			onClick={handleCardClick}
    >

			<div style={{ paddingLeft: `${paddingLeft + 10}px`, paddingBottom:"15px" }}>

				<strong>
					<FormattedText text={title}></FormattedText>
				</strong>
				<FormattedText
					text={details}
					style={{ fontSize: '0.8em', color: '#666'}}
				>
				</FormattedText>
			</div>

			{children.length > 0 && (
			<div>
				{children.map((child) => (
					<Card key={child.id} {...child} />
				))}
			</div>
			)}

    </div>
  );
};

export default Card;