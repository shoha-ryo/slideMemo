'use client'

import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';

// アイテムデータの型定義
interface ItemProps {
  id: string; // 一意のID (dnd-kitで使用)
  level: 1 | 2 | 3 | 4 | 5; // 役割 (1=親, 2=子, 3=孫, ...)
  title: string;
  details: string;
  // その他のprops (例えば、ネストされた子要素など)
}



// Draggable/Droppable コンポーネント
const Card: React.FC<ItemProps> = ({ id, level, title, details, children }) => {

  // --- 1. Draggableの設定 ---
  const { attributes, listeners, setNodeRef: setDraggableRef, transform } = useDraggable({
    id: id,
  });

  // ドラッグ時の位置変換スタイル
  const draggableStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
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
  };

  // DraggableとDroppableのrefを両方設定
  const setNodeRef = (node) => {
    setDraggableRef(node);
    setDroppableRef(node);
  };


  return (
    <div
      ref={setNodeRef} // 両方のrefを設定
      style={{
        ...draggableStyle, // ドラッグ時の移動スタイル
        ...activeStyle,     // ドロップ時のフィードバックスタイル
        padding: '10px',
        paddingLeft: `${paddingLeft + 10}px`, // 基本padding + インデント
        marginBottom: '4px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        transition: 'background-color 0.2s, outline 0.2s',
        // ドラッグ中でない場合はtransformをクリア（重要）
        ...(transform && { position: 'relative' }),
      }}
      {...listeners} // ドラッグイベントのリスナー
      {...attributes} // アクセシビリティ属性
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>{title}</strong>
        <span style={{ fontSize: '0.8em', color: '#666' }}>深さ: {level}</span>
      </div>
      <p style={{ margin: '4px 0 0', fontSize: '0.9em', color: '#333' }}>
        {details}
      </p>
    </div>
  );
};

export default Card;