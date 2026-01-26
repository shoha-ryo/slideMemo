// src/components/MagneticLabel.tsx
import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface MagneticLabelProps {
  children: React.ReactNode;
  magnetStrength?: number; // マグネットの吸着力 (0-1の範囲、大きいほど強く吸い付く)
  magnetThreshold?: number;     // 吸着を開始する距離 (px)
  springStiffness?: number; // バネの強さ
  springDamping?: number;   // バネの減衰
}

export const MagneticLabel: React.FC<MagneticLabelProps> = ({
  children,
  magnetThreshold = 50,       // デフォルトの吸着距離
  springStiffness = 500, // デフォルトのバネの強さ(吸いつきの速さ)
  springDamping = 100,    // デフォルトのバネの減衰
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	// 高めの剛性と適切な減衰で、レスポンスを確保
	const springConfig = { stiffness: springStiffness, damping: springDamping };
	const springX = useSpring(mouseX, springConfig);
	const springY = useSpring(mouseY, springConfig);

	// useTransformを使用して、移動量に「上限」または「カーブ」を設ける
	// 例：マウスが50px動いても、ラベルは30px程度で減速して追従するように設定
	const x = useTransform(springX, (latest) => {
		return latest * 0.5; // 横軸は移動早め
	});
	const y = useTransform(springY, (latest) => latest * 0.1); // 縦軸は移動遅め

	const handleMouseMove = useCallback((e: React.MouseEvent) => {
		if (!ref.current) return;
		const rect = ref.current.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		const distanceX = e.clientX - centerX;
		const distanceY = e.clientY - centerY;

		// 1. 素早い検知のために閾値を少し広げる
		const threshold = magnetThreshold;
		const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

  if (distance < threshold) {
    // 2. マウス位置をそのままセット。springの stiffness が高ければ素早く反応し、
    // damping が適切であれば手元でスッと収まります。
    mouseX.set(distanceX);
    mouseY.set(distanceY);
  } else {
    mouseX.set(0);
    mouseY.set(0);
  }
}, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    // マウスが要素から離れたら、位置をリセット
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <motion.span
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'inline-block', // inline要素でもtransformが効くように
        x, // framer-motionのMotionValueを直接transformプロパティに渡す
        y, // `transform: translate()` を自動で適用してくれる
        willChange: 'transform', // アニメーションパフォーマンス最適化
      }}
    >
      {children}
    </motion.span>
  );
};

export default MagneticLabel;