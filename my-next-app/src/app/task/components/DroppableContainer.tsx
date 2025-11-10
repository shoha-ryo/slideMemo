'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';

/**
 * ドロップ可能なタスクリストのコンテナ
 * @param {object} props - プロパティ
 * @param {string} props.id - DndContextで使用する一意のID
 * @param {string} props.title - リストのタイトル
 * @param {React.ReactNode} props.children - DraggableItemのリスト
 */
export default function DroppableContainer({ id, title, children }) {
  // useDroppableフックを呼び出し、ドロップ状態とノード参照を取得
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  // ドロップ候補時の背景色を決定
  const containerStyle = {
    backgroundColor: isOver ? '#e0f7fa' : '#f0f4f8',
    padding: '16px',
    margin: '10px',
    minWidth: '280px',
    minHeight: '300px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'background-color 0.2s ease-in-out',
  };

  const titleStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#00796b',
    marginBottom: '10px',
    paddingBottom: '5px',
    borderBottom: '2px solid #00796b',
    textAlign: 'center',
  };

  return (
    <div ref={setNodeRef} style={containerStyle}>
      <h3 style={titleStyle}>{title}</h3>
      {children}
    </div>
  );
}