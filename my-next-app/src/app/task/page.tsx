'use client';

// App.js や 親コンポーネント
import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCenter, pointerWithin } from '@dnd-kit/core';
import { getQuadrant } from './components/quadrantCollisionDetection';
import  Card  from './components/Card';
import ItemData from './data.json';
import { moveNode } from './components/moveCards';





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
	const [activeId, setActiveId] = useState(null);
	const [items, setItems] = useState(ItemData); // ダミーデータ

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
		setActiveId(event.active.id);

		// ポインタと図形の左上を合わせるためのオフセット計算
    const e = event.activatorEvent;
		if (e instanceof MouseEvent) {
		const el = document.elementFromPoint(e.clientX, e.clientY);
		const cardEl = el?.closest('.card');
		const rect = cardEl?.getBoundingClientRect();
		if (rect) {
			setStartOffset({
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			});
		}
  }


		// ドラッグ開始時に状態をリセット
		setHoverInfo({
      activeId: active.id,
      droppableId: null,
      quadrant: null,
    });
  };


	const handleDragEnd = (event) => {
		const { active, over } = event;
		setActiveId(null);

		setHoverInfo({
      activeId: null,
      droppableId: null,
      quadrant: null,
    });
		setItems(moveNode(items, active.id, over.id));
	};


	  // 取得関数：ID を指定してそのアイテムだけを返す（Overlay用）
  const findItem = (id, list = items) => {
    for (const item of list) {
      if (item.id === id) return item;
      if (item.children?.length) {
        const deep = findItem(id, item.children);
        if (deep) return deep;
      }
    }
    return null;
  };
	const activeItem = activeId ? findItem(activeId) : null;




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

        {/* Overlay */}
        <DragOverlay>
          {activeItem ? (
            // ⭐ 子は渡さない → 安定する（見た目だけ子を渡したい）
            <Card
              {...activeItem}
              startOffset={startOffset}
              children={[]}
              useOverlay={true} // transform補正のために渡す
            />
          ) : null}
        </DragOverlay>


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