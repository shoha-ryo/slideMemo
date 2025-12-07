// アイテムデータの型定義
export interface Item {
  id: string;
  level: number;
  title?: string;
  details?: string;
  children: Item[];
  useOverlay?: boolean;
  startOffset?: { x: number; y: number };
}
