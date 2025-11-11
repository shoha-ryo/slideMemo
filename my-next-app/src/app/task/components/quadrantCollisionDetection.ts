type Quadrant = '左上' | '右上' | '左下' | '右下';

export function getQuadrant(
  dragRect: ClientRect,
  dropRect: ClientRect
): Quadrant {
  const dragCenterX = dragRect.left + dragRect.width / 2;
  const dragCenterY = dragRect.top + dragRect.height / 2;

  const midX = dropRect.left + dropRect.width / 2;
  const midY = dropRect.top + dropRect.height / 2;

  if (dragCenterY < midY) {
    return dragCenterX < midX ? '左上' : '右上';
  } else {
    return dragCenterX < midX ? '左下' : '右下';
  }
}