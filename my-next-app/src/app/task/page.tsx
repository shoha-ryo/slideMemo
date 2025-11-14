'use client';

// App.js や 親コンポーネント
import React, {useState} from 'react';
import { DndContext, closestCenter, pointerWithin } from '@dnd-kit/core';
import { getQuadrant } from './components/quadrantCollisionDetection';
import  Card  from './components/Card';
import ItemData from './data.json';
import { log } from 'node:console';


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
	const [startOffset, setStartOffset] = useState({ x: 0, y: 0 });


	// 動的に象限を判定して状態更新
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
    setHoverInfo({
      activeId: active.id,
      droppableId: over.id,
      quadrant,
    });
  };


	// マウスポインタの中心との衝突位置を判定して状態更新
	// overの図形情報を使って四象限を判定


  const handleDragStart = (event) => {
		const { active } = event;

		// ポインタと図形の左上を合わせるためのオフセット計算
    const rect = event.active?.rect?.current?.initial;
    const e = event.activatorEvent;

    if (rect && e instanceof MouseEvent) {
      setStartOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }

		// クリック下の要素とその位置情報を取得（デバッグ用）
		console.log(event);



		// ドラッグ開始時に状態をリセット
		setHoverInfo({
      activeId: active.id,
      droppableId: null,
      quadrant: null,
    });
  };


	const handleDragEnd = (event) => {
		setHoverInfo({
      activeId: null,
      droppableId: null,
      quadrant: null,
    });
	};



  return (
    <DndContext
      collisionDetection={pointerWithin} // ポインタが重なっている要素を検出
			onDragStart={handleDragStart}
			onDragMove={handleDragMove}
      // onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* Draggable および Droppable コンポーネント */}
      <div style={{ width: '400px', margin: '20px auto' }}>
        <h2>ネスト可能なアイテムリスト</h2>
        {items.map((item) => (
          <Card key={item.id} startOffset={startOffset} {...item} />
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
					{hoverInfo.activeId ? (
						<>
							<p>🟦 ドラッグ中(ID): <strong>{hoverInfo.activeId}</strong></p>
							<p>📍 現在カード(ID): <strong>{hoverInfo.droppableId}</strong></p>
							<p>🧭 象限: <strong>{hoverInfo.quadrant}</strong></p>
							<p>X座標: <strong>{startOffset.x}</strong></p>
							<p>Y座標: <strong>{startOffset.y}</strong></p>
						</>
          ) : (
            <p>ドラッグ中ではありません</p>
          )}
        </div>
      </div>
    </DndContext>
  );
}