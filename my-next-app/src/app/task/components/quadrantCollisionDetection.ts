import { CollisionDetection, Collision } from '@dnd-kit/core';

// ----------------------------------------------------
// 💡 カスタム衝突判定関数(上下左右判定)
// ----------------------------------------------------
export const quadrantCollisionDetection: CollisionDetection = ({
  active,
  droppableContainers,
  overlayNodeRect,
}) => {
  const collisions: Collision[] = [];

  // ドラッグ要素（Active）の現在の位置情報
  // overlayNodeRectは、transformが適用された後の正確なドラッグ要素の矩形情報です。
  const dragRect = overlayNodeRect || active.rect.current.translated;

  if (!dragRect) {
    return collisions;
  }

  // ドラッグ要素の中心座標を計算
  const dragCenterX = dragRect.left + dragRect.width / 2;
  const dragCenterY = dragRect.top + dragRect.height / 2;
  
  // ----------------------------------------------------
  // 1. 各ドロップ可能要素との衝突をチェック
  // ----------------------------------------------------
  for (const droppable of droppableContainers) {
    const droppableId = droppable.id;
    const droppableRect = droppable.clientRect;

    if (!droppableRect) continue;

    // ----------------------------------------------------
    // 2. 基本的な衝突（中心点がドロップ要素内にあるか）
    // ----------------------------------------------------
    const isOverDroppable = (
      dragCenterX >= droppableRect.left &&
      dragCenterX <= droppableRect.right &&
      dragCenterY >= droppableRect.top &&
      dragCenterY <= droppableRect.bottom
    );

    if (isOverDroppable) {
      // ----------------------------------------------------
      // 3. 四象限の判定ロジック
      // ----------------------------------------------------
      const midX = droppableRect.left + droppableRect.width / 2;
      const midY = droppableRect.top + droppableRect.height / 2;
      
      let quadrantName = '';

      // Y軸（上下）の判定
      if (dragCenterY < midY) {
        // 上半分
        quadrantName = (dragCenterX < midX) ? '左上' : '右上';
      } else {
        // 下半分
        quadrantName = (dragCenterX < midX) ? '左下' : '右下';
      }

      // ----------------------------------------------------
      // 4. 衝突オブジェクトを作成し、カスタムデータを追加
      // ----------------------------------------------------
      collisions.push({
        id: droppableId, // 必須: 衝突したDroppableのID
        data: {
          // 衝突ロジックを区別するためのタイプ
          type: 'quadrant', 
          // 判定された象限をカスタムデータとして追加
          quadrant: quadrantName, 
        }
      });
    }
  }
  
  // 衝突した要素のリストを返す (中心点がDroppable内にない場合は空リスト)
  return collisions;
};