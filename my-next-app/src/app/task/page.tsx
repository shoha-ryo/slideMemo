'use client';

// App.js や 親コンポーネント
import React from 'react';
import { DndContext } from '@dnd-kit/core';
import { quadrantCollisionDetection } from './components/quadrantCollisionDetection';
import  Card  from './components/Card';
import ItemData from './data.json';


// ダミーデータ
const items = ItemData;


export default function App() {
  // ... state, droppables, etc.

  const handleDragOver = (event) => {
    // 衝突情報（Collision）は event.collisions に格納されます
    if (event.collisions && event.collisions.length > 0) {
      const firstCollision = event.collisions[0];

      // カスタムデータ（quadrant）を取得
      const quadrant = firstCollision.data?.quadrant;

      if (quadrant) {
        console.log(`衝突した Droppable ID: ${firstCollision.id} の ${quadrant} 領域にいます。`);
        // ここで、例えばドロップ要素に特定のスタイルを適用するなどのロジックを実行できます。
      }
    }
  };

  return (
    <DndContext
      // ⭐ カスタム衝突判定をここで設定
      collisionDetection={quadrantCollisionDetection} // 検出できてなくない？
      onDragOver={handleDragOver}
			// onDragEnd={handleDragEnd}
      // ... その他のイベントハンドラ
		>
      {/* Draggable および Droppable コンポーネント */}
      <div style={{ width: '400px', margin: '20px auto' }}>
        <h2>ネスト可能なアイテムリスト</h2>
        {items.map((item) => (
          <Card key={item.id} {...item} />
        ))}
      </div>
    </DndContext>
  );
}