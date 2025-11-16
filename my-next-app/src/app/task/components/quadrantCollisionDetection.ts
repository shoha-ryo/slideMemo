type Quadrant = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export function getQuadrant(
  dragRect: ClientRect,
  dropRect: ClientRect
): Quadrant {
  const dragCenterX = dragRect.left + dragRect.width / 2;
  const dragCenterY = dragRect.top + dragRect.height / 2;

  const midX = dropRect.left + dropRect.width / 2;
  const midY = dropRect.top + dropRect.height / 2;

  if (dragCenterY < midY) {
    return dragCenterX < midX ? 'topLeft' : 'topRight';
  } else {
    return dragCenterX < midX ? 'bottomLeft' : 'bottomRight';
  }
}