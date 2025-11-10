'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';

/**
 * ドラッグ可能なタスクカード
 * @param {object} props - プロパティ
 * @param {string} props.id - DndContextで使用する一意のID
 * @param {string} props.content - カードに表示する内容
 */
export default function DraggableItem({ id, content }) {
  // useDraggableフックを呼び出し、必要なプロパティとリスナーを取得
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    isDragging 
  } = useDraggable({
    id,
  });

  // ドラッグ中のスタイルを適用
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.7 : 1, // ドラッグ中は透明度を下げる
    zIndex: isDragging ? 10 : 1, // ドラッグ中は前面に表示
    transition: isDragging ? 'none' : 'transform 0.2s ease', // ドラッグ終了後のアニメーション
    padding: '12px',
    margin: '8px 0',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: isDragging ? '0 6px 12px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
    cursor: 'grab',
    textAlign: 'center',
    fontSize: '14px',
    border: '1px solid #ddd',
  };

  return (
    <div
      ref={setNodeRef} // DOMノード参照を設定
      style={style}
      {...listeners} // イベントリスナー（mousedown, touchstartなど）を設定
      {...attributes} // aria属性などを設定
    >
      {content}
    </div>
  );
}