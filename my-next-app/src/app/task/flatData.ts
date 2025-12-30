import { AppState } from "@/types/TasksType";

// ==========================================
// 具体的なサンプルデータ
// ==========================================

export const sampleAppState: AppState = {
  // 1. ボードの表示順序（横並び）
  boardOrder: ["board-1", "board-2"],

  // 2. ボードのデータ辞書
  boards: {
    "board-1": {
      id: "board-1",
      projectId: "project-A",
      title: "未着手・開発中",
      // このボード直下のカード順序。ここに含まれないカードはネストされているか別ボードにある
      cardIds: ["card-1", "card-3"],
    },
    "board-2": {
      id: "board-2",
      projectId: "project-A",
      title: "完了",
      cardIds: ["card-4"], // まだカードがない
    },
  },

  // 3. カードのデータ辞書（フラットに全件保持）
  cards: {
    // 親カード: ログイン機能の実装
    "card-1": {
      id: "card-1",
      parentId: null, // ルートレベルなのでnull
      boardId: "board-1", // 所属ボード
      title: "ログイン機能の実装",
      details: "Auth0を使って実装する。Google認証対応。",
      status: "active",
      progress: "doing",
      startAt: 1715000000000,
      dueAt: 1715600000000,
      simpleView: false,

      // ▼ ネストされた子カードのIDリスト（順序情報）
      childrenIds: ["card-2-a", "card-2-b"],
    },

    // 子カードA: UI作成（card-1の中にいる）
    "card-2-a": {
      id: "card-2-a",
      parentId: "card-1", // 親IDを指定
      boardId: "board-1",
      title: "ログイン画面のUIコーディング",
      details: "",
      status: "active",
      progress: "done", // これは完了している
      startAt: null,
      dueAt: null,
      simpleView: true,

      childrenIds: [], // 孫はいない
    },

    // 子カードB: API実装（card-1の中にいる）
    "card-2-b": {
      id: "card-2-b",
      parentId: "card-1",
      boardId: "board-1",
      title: "認証APIの繋ぎこみ",
      details: "SWRを使ってフェッチする",
      status: "active",
      progress: "todo",
      startAt: null,
      dueAt: null,
      simpleView: true,

      childrenIds: [],
    },

    // 別の独立したカード（card-1の下にあるわけではない）
    "card-3": {
      id: "card-3",
      parentId: null,
      boardId: "board-1",
      title: "環境構築",
      details: "Dockerの設定",
      status: "active",
      progress: "done",
      startAt: 1710000000000,
      dueAt: 1710100000000,
      simpleView: false,

      childrenIds: [],
    },
    "card-4": {
      id: "card-4",
      parentId: null,
      boardId: "board-2",
      title: "デザインのメモ",
      details: "黒：neutral-800\n青：cyan-500\n灰：gray-300",
      status: "active",
      progress: "done",
      startAt: 1710000000000,
      dueAt: 1710100000000,
      simpleView: false,

      childrenIds: [],
    },
  },
};
