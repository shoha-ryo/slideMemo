import Dexie, { Table } from "dexie";

// Prismaのモデル構造に準拠
export interface CardEntity {
  id: string;
  title: string;
  details: string;
  projectId: string;
  boardId: string;
  parentId: string | null;
  childrenIds: string[];
  progress: "todo" | "doing" | "done";
  status: "active" | "archived";
  simpleView: boolean;
  labelIds: string[];
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
  // userId: string;
  boardOrder: string[];
  createdAt: number;
  updatedAt: number;
}
export interface ProjectMemberEntity {
  id: string;
  projectId: string;
  userId: string;
  role: MemberRole;
  status: MemberStatus;
}
export type MemberRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
export type MemberStatus = "INVITED" | "ACTIVE" | "DEACTIVATED";

export interface LabelEntity {
  id: string;
  name: string;
  color: string;
  projectId: string;
  createdAt: number;
  updatedAt: number;
}

// 各プロジェクトの同期情報を管理するメタデータ
export interface SyncMeta {
  id: string; // projectIdを入れる
  lastSyncAt: number; // 最後にサーバーと成功したUnixタイムスタンプ
}

export interface UserMeta {
  id: "current"; // 常に "current" という文字列を入れる
  uid: string;
  email: string | null;
  name?: string | null;
  photoURL?: string | null;
  updatedAt: number;
}

export class TaskFlowDB extends Dexie {
  projects!: Table<ProjectEntity>;
  projectMembers!: Table<ProjectMemberEntity>;
  boards!: Table<BoardEntity>;
  cards!: Table<CardEntity>;
  labels!: Table<LabelEntity>;
  syncMeta!: Table<SyncMeta>;
  userMeta!: Table<UserMeta>;

  constructor() {
    super("TaskFlowDB");

    // stores の定義（カンマ区切りで最初に書くのがプライマリキー）
    // 2つ目以降は「検索（Index）」対象にしたいキー
    this.version(11).stores({
      projects: "id, userId",
      projectMembers: "id, projectId, userId, [projectId+userId]",
      boards: "id, projectId",
      cards: "id, boardId, parentId, projectId", // 親子関係やボード移動の高速化
      labels: "id, projectId",
      syncMeta: "id", // プロジェクトIDをキーにして最終同期時刻を引けるようにする
      userMeta: "id, uid, email",
    });
  }
}

export const db = new TaskFlowDB();
