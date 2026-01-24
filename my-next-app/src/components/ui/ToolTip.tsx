// components/ui/PortalTooltip.tsx
"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";

type PortalTooltipProps = {
  content: string;
  children: React.ReactNode;
};

export const ToolTip = ({ content, children }: PortalTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        // ボタンの右隣、中央揃えの位置を計算
        top: rect.top + rect.height / 2,
        left: rect.left + rect.width + 8, // 8pxのマージン
      });
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      {/* 1. トリガーとなる要素（ボタンなど）をラップする */}
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block" // レイアウトを崩さない設定
      >
        {children}
      </div>

      {/* 2. 本体はPortalでbodyに飛ばす（overflow完全無視） */}
      {isVisible &&
        createPortal(
          <div
            className="
              fixed z-999 -translate-y-1/2
              px-2 py-1 
              bg-popover text-popover-foreground text-xs 
              rounded border shadow-md 
              pointer-events-none select-none
              animate-in fade-in zoom-in duration-150
            "
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
};
