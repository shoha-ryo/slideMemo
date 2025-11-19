'use client'

import React, { use } from 'react';
import { useDraggable, useDroppable, useDndContext } from '@dnd-kit/core';
import { Item } from '../../../../types/item';




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
		transform: transform? `translate3d(${transform.x + startOffset.x}px, ${transform.y + startOffset.y}px, 0)` : undefined,
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
  const setNodeRef = (node) => {
    setDroppableRef(node);
    setDraggableRef(node);
  };

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
    >

			<div style={{ paddingLeft: `${paddingLeft + 10}px` }}>
				<strong>{title}</strong>
				<span style={{ fontSize: '0.8em', color: '#666' }}> (階層: {level})</span>
				<p style={{ fontSize: '0.8em', color: '#666'}}>{details}</p>
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