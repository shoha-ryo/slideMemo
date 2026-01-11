// DebugCollision.tsx
import React from 'react';
import { useDndMonitor, useDndContext } from '@dnd-kit/core';
 
export function DebugCollision() {
  const [pointer, setPointer] = React.useState<{x:number;y:number}|null>(null);
  const { over } = useDndContext();
  const [rects, setRects] = React.useState<Array<{id:string; r:DOMRect}>>([]);
 
  useDndMonitor({
    onDragStart: () => setRects([]),
    onDragMove: (evt) => {
      const e = evt.activatorEvent as MouseEvent | TouchEvent | undefined;
      let x: number|undefined, y: number|undefined;
      if (e instanceof MouseEvent) {
        x = e.clientX; y = e.clientY;
      } else if (e instanceof TouchEvent) {
        const t = e.touches[0]; if (t) { x = t.clientX; y = t.clientY; }
      }
      if (x != null && y != null) setPointer({ x, y });
    },
  });
 
  // 例: over や既知の droppable の rect を収集 (あなたの環境に合わせて取得)
  React.useEffect(() => {
    const ids = Array.from(document.querySelectorAll('[data-droppable-id]'))
      .map(el => el.getAttribute('data-droppable-id')!)
      .filter(Boolean);
 
    const list = ids.map(id => {
      const el = document.querySelector(`[data-droppable-id="${id}"]`) as HTMLElement | null;
      return el ? { id, r: el.getBoundingClientRect() } : null;
    }).filter(Boolean) as Array<{id:string; r:DOMRect}>;
    setRects(list);
  }, [over]);
 
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {pointer && (
        <div style={{
          position: 'fixed',
          left: pointer.x - 4, top: pointer.y - 4,
          width: 8, height: 8, borderRadius: '50%',
          background: '#ff0066', boxShadow: '0 0 4px #ff0066'
        }} title="pointer"/>
      )}
      {rects.map(({id, r}) => (
        <React.Fragment key={id}>
          {/* rect 枠線 */}
          <div style={{
            position: 'fixed',
            left: r.left, top: r.top, width: r.width, height: r.height,
            border: id.startsWith('board-') ? '2px solid #00aaff' : '2px dashed #ffaa00',
            background: 'transparent'
          }} title={id}/>
          {/* 中心点 */}
          <div style={{
            position: 'fixed',
            left: r.left + r.width/2 - 3, top: r.top + r.height/2 - 3,
            width: 6, height: 6, borderRadius: '50%',
            background: id.startsWith('board-') ? '#00aaff' : '#ffaa00'
          }}/>
        </React.Fragment>
      ))}
    </div>
  );
}