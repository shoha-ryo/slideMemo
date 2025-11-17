type Quadrant = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export function getQuadrant(
  pointer: { x: number; y: number },
  dropRect: ClientRect
): Quadrant {
  const midX = dropRect.left + dropRect.width / 2;
  const midY = dropRect.top + dropRect.height / 2;

	//console.log(`ポインターX：${pointer.x}, BOX横：${midX}, ポインターY：${pointer.y}, BOX縦：${midY}`);

  if (pointer.y < midY) {
		return pointer.x < midX ? 'topLeft' : 'topRight';
  } else if  (pointer.y > midY) {
    return pointer.x < midX ? 'bottomLeft' : 'bottomRight';
  } else {
		return 'topLeft'; // デフォルト値
	}
		}