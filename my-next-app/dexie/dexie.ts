import Dexie, { Table } from 'dexie';

// Prismaのモデル構造に準拠
export interface CardEntity {
  id: string;
  title: string;
  details: string;
	projectId: string
  boardId: string;
  parentId: string | null;
  childrenIds: string[];
  progress: 'todo' | 'doing' | 'done';
  status: 'active' | 'archived';
  simpleView: boolean;
	labels: string[]
  startAt: number | null;
  dueAt: number | null;
  createdAt: number; // Dexie(IndexedDB)では数値かDateで保存
  updatedAt: number;
}

export interface BoardEntity {
  id: string;
  title: string;
  projectId: string;
  cardIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ProjectEntity {
  id: string;
  title: string;
  userId: string;
  boardOrder: string[];
  createdAt: number;
  updatedAt: number;
}

// 同期情報を管理するメタデータ
export interface SyncMeta {
  id: string;           // projectIdを入れる
  lastSyncAt: number;   // 最後にサーバーと成功したUnixタイムスタンプ
}

export class TaskFlowDB extends Dexie {
  projects!: Table<ProjectEntity>;
  boards!: Table<BoardEntity>;
  cards!: Table<CardEntity>;
  syncMeta!: Table<SyncMeta>;

  constructor() {
    super('TaskFlowDB');

    // stores の定義（カンマ区切りで最初に書くのがプライマリキー）
    // 2つ目以降は「検索（Index）」対象にしたいキー
    this.version(3).stores({
      projects: 'id, userId',
      boards: 'id, projectId',
      cards: 'id, boardId, parentId, projectId', // 親子関係やボード移動の高速化
      syncMeta: 'id' // プロジェクトIDをキーにして最終同期時刻を引けるようにする
    });
  }
}

export const db = new TaskFlowDB();