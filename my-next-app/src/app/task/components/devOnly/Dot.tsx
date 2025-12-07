"use client";

import React from "react";

interface DotProps {
  x: number;
  y: number;
  size?: number; // 円の直径、デフォルト20px
  color?: string;
}

const Dot: React.FC<DotProps> = ({ x, y, size = 20, color = "red" }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2, // 中心に合わせる
        top: y - size / 2, // 中心に合わせる
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: color,
        pointerEvents: "none", // マウスイベントを透過
        zIndex: 9999,
      }}
    />
  );
};

export default Dot;
