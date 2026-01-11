import React from 'react';
import { useDndMonitor, useDndContext } from '@dnd-kit/core';

export function DebugCollision() {
  const [pointer, setPointer] = React.useState<{x:number; y:number} | null>(null);
  const { over, active } = useDndContext();
  const [rects, setRects] = React.useState<Array<{id:string; r:DOMRect; type: 'board' | 'card'}>>([]);

  // 1. マウス座標の追跡（ブラウザイベントを直接見ることで、ドラッグ前から動くようにする）
  React.useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPointer({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // 2. ドラッグ開始/移動/終了時に要素をスキャン
  useDndMonitor({
    onDragStart: () => updateRects(),
    onDragMove: () => updateRects(),
    onDragEnd: () => setRects([]),
  });

  const updateRects = () => {
    // 既存の属性（data-board-id と data-card-id）の両方を探す
    const boardElements = Array.from(document.querySelectorAll('[data-board-id]'));
    const cardElements = Array.from(document.querySelectorAll('[data-card-id]'));
    
    const boards = boardElements.map(el => ({
      id: el.getAttribute('data-board-id')!,
      r: el.getBoundingClientRect(),
      type: 'board' as const
    }));

    const cards = cardElements.map(el => ({
      id: el.getAttribute('data-card-id')!,
      r: el.getBoundingClientRect(),
      type: 'card' as const
    }));

    setRects([...boards, ...cards]);
  };

  // 重なり判定が動いた時も再スキャン
  React.useEffect(() => {
    if (active) updateRects();
  }, [over, active]);

  if (!active && !pointer) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99999 }}>
      {/* ピンクの点（マウス位置） */}
      {pointer && (
        <div style={{
          position: 'fixed',
          left: pointer.x - 5, top: pointer.y - 5,
          width: 10, height: 10, borderRadius: '50%',
          background: '#ff0066', boxShadow: '0 0 8px #ff0066',
        }} />
      )}

      {/* 判定エリアの表示（ドラッグ中のみ） */}
      {active && rects.map(({id, r, type}) => (
        <div key={id} style={{
          position: 'fixed',
          left: r.left, top: r.top, width: r.width, height: r.height,
          // ボードは青、カードはオレンジで色分け
          border: type === 'board' ? '3px solid #00aaff' : '2px dashed #ffaa00',
          background: over?.id === id ? 'rgba(255, 0, 102, 0.1)' : 'transparent',
          boxSizing: 'border-box'
        }}>
          <span style={{ 
            background: type === 'board' ? '#00aaff' : '#ffaa00', 
            color: '#fff', fontSize: '9px', padding: '0 2px' 
          }}>
            {id}
          </span>
        </div>
      ))}
    </div>
  );
}