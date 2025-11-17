'use client';

// App.js や 親コンポーネント
import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCenter, pointerWithin } from '@dnd-kit/core';
import { getQuadrant } from './components/quadrantCollisionDetection';
import  Card  from './components/Card';
import ItemData from './data.json';
import { moveCard } from './components/moveCards';
import Dot from './components/Dot';
import { usePointer } from './components/usePointer';





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

	const [mouse, setMouse] = useState({ x: 0, y: 0 });
	const [overCenter, setOverCenter] = useState({x: 0, y: 0});
	const { x, y } = usePointer();




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
		setHoverInfo({	// ドラッグ開始時に状態をリセット
			activeId: active.id,
      droppableId: null,
      quadrant: null,
    });
  };


	const handleDragMove = (event) => {
		const { active, over } = event;
		if (!over) {
			setHoverInfo({ activeId: null, droppableId: null, quadrant: null });
			return;
		}

		// 動的に象限を判定して状態更新
		const e = event.activatorEvent;
		if (!(e instanceof MouseEvent)) return;
		const pointer = { x: x, y: y };
		const quadrant = getQuadrant(pointer, over.rect);
    
		//
		setMouse({ x: x, y: y })
		const midX = over.rect.left + over.rect.width / 2;
  	const midY = over.rect.top + over.rect.height / 2;
		setOverCenter({ x: midX, y: midY });
		//
    
		setHoverInfo({
      activeId: active.id,
      droppableId: over.id,
      quadrant: quadrant,
    });

		if (over?.data?.current) {
			over.data.current.quadrant = quadrant;
		}
		};


	const handleDragEnd = (event) => {
		const { active, over } = event;
		setItems(moveCard(items, active.id, over.id, hoverInfo.quadrant));

		setActiveId(null);

		setHoverInfo({
      activeId: null,
      droppableId: null,
      quadrant: null,
    });
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
		<div style={{ position: 'relative' }}>
			<Dot x={mouse.x} y={mouse.y} size={20} color='blue'></Dot>
			<Dot x={overCenter.x} y={overCenter.y} size={10} color='red'></Dot>
			<DndContext
				collisionDetection={pointerWithin} // ポインタが重なっている要素を検出
				onDragStart={handleDragStart}
				onDragMove={handleDragMove}
				// onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				{/* Draggable および Droppable コンポーネント */}
				<div style={{ width: '600px', margin: '20px auto' }}>
					<h2>ネスト可能なアイテムリスト</h2>
					{items.map((item) => (
						<Card
							key={item.id}
							startOffset={startOffset}
							{...item}
						/>
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
		</div>
  );
}