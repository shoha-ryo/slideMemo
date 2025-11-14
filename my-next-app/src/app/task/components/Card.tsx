'use client'

import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';

// アイテムデータの型定義
interface ItemProps {
	startOffset: { x: number; y: number }; // 開始位置のオフセット
  id: string; // 一意のID (dnd-kitで使用)
  level: 1 | 2 | 3 | 4 | 5; // 役割 (1=親, 2=子, 3=孫, ...)
  title: string;
  details: string;
	children: ItemProps[]; // ⭐ 再帰的に子要素を持つ
}



// Draggable/Droppable コンポーネント
const Card: React.FC<ItemProps> = ({ startOffset, id, level, title, details, children }) => {

  // --- 1. Draggableの設定 ---
  const { attributes, listeners, setNodeRef: setDraggableRef, transform } = useDraggable({
    id: id,
  });

  // ドラッグ時の位置変換スタイル
  const draggableStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    // transform: `translate3d(${transform.x - startOffset.x}px, ${transform.y - startOffset.y}px, 0)`,
    // ドラッグ中は手前に表示するためz-indexを高くする
    zIndex: 100,
    cursor: 'grabbing',
  } : {
    cursor: 'grab',
  };

  // --- 2. Droppableの設定 ---
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: id, // Draggableと同じIDを使用
  });

  // --- 3. スタイリングとネストレベルの決定 ---

  // role (1~5) を元にネストレベル (インデント) を計算
  // 例: role 1 -> 0px, role 2 -> 20px, role 3 -> 40px, ...
  const nestingLevel = level - 1;
  const paddingLeft = nestingLevel * 20; // 20px ずつインデント

  // ドロップ時の視覚的なフィードバック
  const activeStyle = {
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
				...draggableStyle,
				...activeStyle,
				padding: '10px',
				paddingLeft: `${paddingLeft + 10}px`,
				marginBottom: '4px',
				border: '1px solid #ccc',
				borderRadius: '4px',
				transition: 'background-color 0.2s, outline 0.2s',
				position: 'relative', // transformがなくても常にrelative固定
			}}
			className='card'

      {...listeners} // ドラッグイベントのリスナー
      {...attributes} // アクセシビリティ属性
    >

			{/* ⭐ 1. このアイテム自体の表示部分 */}
			<div style={{ paddingLeft: `${paddingLeft + 10}px` }}>
				<strong>{title}</strong>
				<span style={{ fontSize: '0.8em', color: '#666' }}> (Level: {level})</span>
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