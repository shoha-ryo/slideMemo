// アイテムデータの型定義
export interface Item {
	startOffset: { x: number; y: number }; // 開始位置のオフセット
	id: string; // 一意のID (dnd-kitで使用)
	level: 1 | 2 | 3 | 4 | 5; // 役割 (1=親, 2=子, 3=孫, ...)
	title: string;
	details: string;
	children: Item[]; // ⭐ 再帰的に子要素を持つ
	useOverlay?: boolean; // DragOverlayで使用するかどうかのフラグ
}