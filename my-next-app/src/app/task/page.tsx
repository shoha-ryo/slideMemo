'use client';

// App.js や 親コンポーネント
import React, {useState} from 'react';
import { useDndContext, DndContext, closestCenter, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { getQuadrant } from './components/quadrantCollisionDetection';
import  Card  from './components/Card';
import ItemData from './data.json';


// ダミーデータ
const items = ItemData;


export default function App() {
  // 表示用の状態保持
  const [hoverInfo, setHoverInfo] = useState<{
		droppableId: string | null;
		activeId: string | null;
		quadrant: string | null;
	}>({
		droppableId: null,
		activeId: null,
		quadrant: null,
	});



	const handleDragMove = (event) => {
    const { active, over } = event;
		if (!over) {
			setHoverInfo({ activeId: null, droppableId: null, quadrant: null });
			return;
		}

    const dragRect = active.rect.current.translated;
    const dropRect = over.rect;

    if (!dragRect || !dropRect) return;

    const quadrant = getQuadrant(dragRect, dropRect);
        // stateを更新
    setHoverInfo({
      activeId: active.id,
      droppableId: over.id,
      quadrant,
    });
  };


	// マウスポインタの中心との衝突位置を判定して状態更新
	// overの図形情報を使って四象限を判定


	const handleDragEnd = (event: DragEndEvent) => {};


  return (
    <DndContext
      // collisionDetection={quadrantCollisionDetection}
      collisionDetection={closestCenter}
      // onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
			onDragMove={handleDragMove}
    >
      {/* Draggable および Droppable コンポーネント */}
      <div style={{ width: '400px', margin: '20px auto' }}>
        <h2>ネスト可能なアイテムリスト</h2>
        {items.map((item) => (
          <Card key={item.id} {...item} />
        ))}
				{/* ↓ 衝突状況の表示領域 */}
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            background: '#fafafa',
            textAlign: 'center',
          }}
        >
					{hoverInfo.droppableId ? (
						<>
							<p>🟦 ドラッグ中: <strong>{hoverInfo.activeId}</strong></p>
							<p>📍 現在カード: <strong>{hoverInfo.droppableId}</strong></p>
							<p>🧭 象限: <strong>{hoverInfo.quadrant}</strong></p>
						</>
          ) : (
            <p>ドラッグ中ではありません</p>
          )}
        </div>
      </div>
    </DndContext>
  );
}