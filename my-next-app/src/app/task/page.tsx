'use client';

// App.js や 親コンポーネント
import React, { useState } from 'react';
import { DndContext, DragOverlay, pointerWithin,
				 useSensor, useSensors, MouseSensor,
				 DragStartEvent, DragMoveEvent, DragEndEvent} from '@dnd-kit/core';
import { getQuadrant } from './lib/quadrantCollisionDetection';
import { moveCard } from './components/Card/lib/moveCards';
import { useMousePointer } from './components/useMousePointer';

import Modal from './components/Card/Modal';
import BoardList from './components/Board/BoardList';
import Card from './components/Card/Card';
import Dot from './components/devOnly/Dot';

import { Quadrant } from '@/types/quadrant'
import { Item } from '@/types/item'

import { useItemStore } from './store/ItemStore';
import { useModalStore } from './store/ModalStore'; 




export default function App() {
  // 表示用の状態保持
  const [hoverInfo, setHoverInfo] = useState<{
		droppableId: string | number | null;
		activeId: string | number | null;
		quadrant: Quadrant | null;
	}>({
		droppableId: null,
		activeId: null,
		quadrant: null,
	});
	const [startOffset, setStartOffset] = useState({ x: 0, y: 0 });
	const [activeId, setActiveId] = useState<string | number | null>(null);
	const {items} = useItemStore() // ダミーデータ(Zustandで管理)
	const {isShowModal} = useModalStore()

	const [mouse, setMouse] = useState({ x: 0, y: 0 });
	const [overCenter, setOverCenter] = useState({x: 0, y: 0});
	const { x, y } = useMousePointer();

	const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
			delay: 250, // 100ms ホールドでドラッグ開始
      distance: 5, // 5px以内のわずかな移動は無視
    },
  });

  const sensors = useSensors(mouseSensor, /* TouchSensorなど */);



  const handleDragStart = (event: DragStartEvent) => {
		const { active } = event;
		setActiveId(active.id);

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


	const handleDragMove = (event: DragMoveEvent) => {
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

		// マウスの座標を保存する（Dotコンポーネント専用）
		setMouse({ x: x, y: y })
		const midX = over.rect.left + over.rect.width / 2;
  	const midY = over.rect.top + over.rect.height / 2;
		setOverCenter({ x: midX, y: midY });

		setHoverInfo({
      activeId: active.id,
      droppableId: over.id,
      quadrant: quadrant,
    });

		if (over?.data?.current) {
			over.data.current.quadrant = quadrant;
		}
		};


	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		const activeId = active.id
		const overId = over?.id
		const quadrant = hoverInfo.quadrant

		// 象限に紐づいてカードの位置変更処理を実行する
		if (typeof activeId !== "string" || typeof overId !== "string") return
		if (typeof quadrant !== "string" ) return
		useItemStore.setState((prev) => ({
			...prev,
			items: moveCard(prev.items, activeId, overId, quadrant)
		}));

		setActiveId(null);

		setHoverInfo({
      activeId: null,
      droppableId: null,
      quadrant: null,
    });
	};


	  // 取得関数：ID を指定してそのアイテムだけを返す（Overlay用）
  const findItem = (id: string | number, list: Item[]):Item | null => {
    for (const item of list) {
      if (item.id === id) return item;
      if (item.children?.length) {
        const deep = findItem(id, item.children);
        if (deep) return deep;
      }
    }
    return null;
  };
	const activeItem = activeId ? findItem(activeId, items) : null;




  return (
		// console.log(Math.random(), items),
		<div style={{ position: 'relative' }}>
			{isShowModal ? <Modal/> : null }

			{/* <Dot x={mouse.x} y={mouse.y} size={20} color='blue'></Dot>
			<Dot x={overCenter.x} y={overCenter.y} size={10} color='red'></Dot> */}

			<DndContext
				collisionDetection={pointerWithin} // ポインタが重なっている要素を検出
				onDragStart={handleDragStart}
				onDragMove={handleDragMove}
				// onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
				sensors={sensors}
			>
				{/* Draggable および Droppable コンポーネント */}
				<div style={{ width: 'auto', margin: '20px auto' }}>
					<h2>ネスト可能なアイテムリスト</h2>
						<BoardList/>

					{/* Overlay */}
					<DragOverlay>
						{activeItem ? (
							// ⭐ 子は渡さない → 安定する（見た目だけ子を渡したい）
							<Card
								{...activeItem}
								startOffset={startOffset}
								useOverlay={true} // transform補正のために渡す
							/>
						) : null}
					</DragOverlay>


					{/* ↓ 衝突状況の表示領域 */}
					{/* <div
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
					</div> */}
					{/* <pre style={{
						backgroundColor: '#f4f4f4',
						padding: '15px',
						borderRadius: '5px',
						overflowX: 'auto' // 横スクロールが必要な場合に備える
					}}>
						<code>
							{JSON.stringify(items, null, 2)}
						</code>
					</pre> */}
				</div>
			</DndContext>
		</div>
  );
}