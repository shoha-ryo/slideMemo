'use client'

import React, { use } from 'react';
import { useDraggable, useDroppable, useDndContext } from '@dnd-kit/core';
import { Item } from '../../../types/item';




// Draggable/Droppable コンポーネント
const Card: React.FC<Item> = ({ startOffset, id, level, title, details, children, useOverlay }) => {

  // --- 1. Draggableの設定 ---
  const { attributes, listeners, setNodeRef: setDraggableRef, transform } = useDraggable({
    id: id,
  });

	const isActive = useDndContext().active?.id === id;


  // --- 2. Droppableの設定 ---
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
		id: id, // Draggableと同じIDを使用
  });

  // --- 3. スタイリングとネストレベルの決定 ---
	const draggableStyle = useOverlay ? {
		outline: '20px solid #00bcd4',
	} : {
		opacity: isActive? 0 : 1
	};

  const nestingLevel = level - 1;
  const paddingLeft = nestingLevel * 0; // 20px ずつインデント
  const droppableStyle = {
    backgroundColor: isOver ? '#e0f7fa' : 'white', // isOver のとき色を変える
    outline: isOver ? '2px solid #00bcd4' : 'none',
		// 動的に入れ替えを行なって、実際にドロップされる場所を視覚的に示す（入れ替えるよりラインが引かれる方がいいかも？）
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
		}}
			className='card' // カードの外枠要素の取得用

      {...listeners} // ドラッグイベントのリスナー
      {...attributes} // アクセシビリティ属性
    >

			{/* ⭐ 1. このアイテム自体の表示部分 */}
			<div style={{ paddingLeft: `${paddingLeft + 10}px` }}>
				<strong>{title}</strong>
				<span style={{ fontSize: '0.8em', color: '#666' }}> (階層: {level})</span>
				<p style={{ fontSize: '0.8em', color: '#666'}}>{details}</p>

			</div>
			{/* ⭐ 2. 子要素の再帰的なレンダリング */}
			{children.length > 0 && (
			<div>
				{children.map((child) => (
					// 💡 再帰的な呼び出し：自身 (Card) を再びレンダリング
					// level は次のネストレベルになっているので、そのまま渡すだけでOK
					<Card key={child.id} {...child} />
				))}
			</div>
			)}
    </div>
  );
};

export default Card;