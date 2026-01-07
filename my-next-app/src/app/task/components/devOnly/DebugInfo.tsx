import React, { useRef } from 'react';
import { useDndContext } from '@dnd-kit/core';
import Draggable from 'react-draggable';
import { useTaskStore } from '../../store/taskStore/taskStore';

export const DebugInfo = () => {
  const { active, over } = useDndContext();
  const nodeRef = useRef(null);
  const state = useTaskStore();
  const activeOriginalLabelId = state.activeOriginalLabelId;

  return (
    <Draggable nodeRef={nodeRef} handle=".drag-handle">
      <div ref={nodeRef} style={containerStyle}>
        {/* ヘッダー */}
        <div className="drag-handle" style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: active ? '#3b82f6' : '#9ca3af' }}>●</span>
            <span>DND DEBUGGER</span>
          </div>
          <div style={badgeStyle(!!active)}>
            {active ? 'DRAGGING' : 'IDLE'}
          </div>
        </div>

        {/* メイングリッド情報 */}
        <div style={contentStyle}>
          <div style={gridStyle}>
            <div style={itemStyle}>
              <div style={labelStyle}>ACTIVE ID</div>
              <div style={valueStyle('#3b82f6')}>{String(active?.id ?? '—')}</div>
            </div>
            <div style={itemStyle}>
              <div style={labelStyle}>OVER ID</div>
              <div style={valueStyle('#10b981')}>{String(over?.id ?? '—')}</div>
            </div>
            <div style={itemStyle}>
              <div style={labelStyle}>ORIGINAL LABEL ID</div>
              <div style={valueStyle('#f59e0b')}>{String(activeOriginalLabelId ?? '—')}</div>
            </div>
            <div style={itemStyle}>
              <div style={labelStyle}>COORDINATES</div>
              <div style={valueStyle('#9ca3af')}>
                {active?.rect.current.translated 
                  ? `X: ${Math.round(active.rect.current.translated.left)} Y: ${Math.round(active.rect.current.translated.top)}`
                  : '—'}
              </div>
            </div>
          </div>

          {/* Storeの状態 (JSONビュー) */}
          <div style={jsonHeaderStyle}>STORE STATE</div>
          <div style={scrollAreaStyle}>
            <pre style={preStyle}>
              {JSON.stringify(state, (key, value) => 
                typeof value === 'function' ? '[Function]' : value, 2
              )}
            </pre>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

// --- Styles ---

const containerStyle: React.CSSProperties = {
  position: 'fixed',
  top: '80px', // Headerの下あたりに初期配置
  right: '20px',
  width: '520px',
  backgroundColor: '#1a1a1a',
  color: '#e5e7eb',
  borderRadius: '12px',
  zIndex: 9999,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: '11px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
  border: '1px solid #333',
  backdropFilter: 'blur(8px)',
};

const headerStyle: React.CSSProperties = {
  padding: '10px 12px',
  backgroundColor: '#262626',
  cursor: 'grab',
  borderTopLeftRadius: '12px',
  borderTopRightRadius: '12px',
  borderBottom: '1px solid #333',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '10px',
  letterSpacing: '0.05em',
  fontWeight: 700,
};

const badgeStyle = (isActive: boolean): React.CSSProperties => ({
  backgroundColor: isActive ? '#1e3a8a' : '#3f3f46',
  color: isActive ? '#bfdbfe' : '#d4d4d8',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '9px',
});

const contentStyle: React.CSSProperties = {
  padding: '12px',
};

const gridStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  marginBottom: '12px',
};

const itemStyle: React.CSSProperties = {
  borderLeft: '2px solid #333',
  paddingLeft: '8px',
};

const labelStyle: React.CSSProperties = {
  color: '#737373',
  fontSize: '9px',
  marginBottom: '2px',
};

const valueStyle = (color: string): React.CSSProperties => ({
  color: color,
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const jsonHeaderStyle: React.CSSProperties = {
  fontSize: '9px',
  color: '#737373',
  marginBottom: '6px',
  borderTop: '1px solid #333',
  paddingTop: '10px',
};

const scrollAreaStyle: React.CSSProperties = {
  maxHeight: '200px',
  overflowY: 'auto',
  backgroundColor: '#0a0a0a',
  borderRadius: '6px',
  padding: '8px',
  border: '1px solid #262626',
};

const preStyle: React.CSSProperties = {
  margin: 0,
  color: '#10b981',
  lineHeight: '1.4',
};