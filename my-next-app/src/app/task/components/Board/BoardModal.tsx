// src/app/task/BoardModal.tsx (または components/modals/BoardModal.tsx など)

"use client";

import { useEffect, useRef, useState } from "react";
import { useModalStore } from "../../store/ModalStore";
import { useTaskStore } from "../../store/taskStore/taskStore";
import { BoardType } from "@/app/task/store/taskStore/types/TasksType";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function BoardModal() {
  // --- 状態とストアからのデータ取得 ---

  // モーダルとタスクの状態を取得
  const { hideModal, clickedActiveId } = useModalStore(); // clickedActiveId がボードIDを指す想定
  const { boards, updateBoard } = useTaskStore(); // setDiffTasks も取得

  // フラット構造なので、IDを使って直接ボードを特定
  const activeBoard: BoardType | null = clickedActiveId
    ? boards[clickedActiveId]
    : null;

  // UIの状態
  const [title, setTitle] = useState<string>(activeBoard?.title || "");
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // --- 高さ調整ロジック (タイトル用) ---
  const resizeTitleHeight = () => {
    const textarea = titleRef.current;
    const MAX_HEIGHT_FOR_ONE_LINE = 55; // 必要に応じて調整

    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
      if (textarea.scrollHeight < MAX_HEIGHT_FOR_ONE_LINE)
        textarea.style.height = `40px`;
      else textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // --- useEffect: 初期化とスクロール禁止 ---
  useEffect(() => {
    // 初期状態のセッティング
    if (titleRef.current) {
      const el = titleRef.current;
      el.focus();
      el.setSelectionRange(0, el.value.length);
    }

    // スクロール禁止
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [clickedActiveId, boards]); // 依存配列は空でOK（マウント・アンマウント時のみ）

  useEffect(() => {
    if (titleRef.current) {
      resizeTitleHeight();
    }
  }, [title]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 日本語入力中の確定（IME）の Enter で送信されないようにチェック
    if (e.nativeEvent.isComposing) return;

    // Enter だけが押された場合（Shift は押されていない）
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // 改行を防ぐ
      onSave(); // 保存実行
    }
    if (e.key === "Escape") {
      hideModal();
    }
  };

  // --- 保存処理 ---
  const onSave = async () => {
    if (!title.trim()) {
      setTitle("");
      return;
    }
    if (!activeBoard || !clickedActiveId) return;

    updateBoard(clickedActiveId, { title: title });
    hideModal();
  };

  // --- グローバルキーイベント（Escで閉じる、Enterで保存） ---
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        hideModal();
      }

      // 2. カーソルがどこにもない状態での Enter 保存
      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl?.tagName === "INPUT" || activeEl?.tagName === "TEXTAREA";
      if (e.key === "Enter" && !e.shiftKey && !isInputFocused) {
        e.preventDefault();
        onSave();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [hideModal, onSave]); // 関数の参照が変わった時に再登録

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).id === "modal-background") {
      hideModal();
    }
  };

  // 編集対象がない場合は何も表示しない
  if (!activeBoard) return null;

  return (
    <div
      id="modal-background"
      onClick={handleBackgroundClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-xl bg-card p-8 shadow-2xl ring-1 ring-border animate-in zoom-in-95 duration-200"
      >
        {/* 閉じるボタン */}
        <button
          onClick={hideModal}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold leading-none tracking-tight text-foreground">
            ボード編集
          </h3>
        </div>

        <div className="space-y-6">
          {/* タイトルセクション */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-muted-foreground">
              タイトル
            </label>
            <textarea
              ref={titleRef}
              value={title}
              placeholder="タイトルを入力してください"
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ minHeight: 40 }}
              className="
								flex w-full
								rounded-md border border-input
								bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background
								placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2
								focus-visible:ring-ring focus-visible:border-accent resize-none font-medium"
            />
          </div>
        </div>

        {/* アクションボタン */}
        <div className="mt-8 flex gap-3">
          <Button variant="outline" onClick={hideModal} className="flex-1">
            キャンセル
          </Button>
          <Button
            onClick={() => onSave()}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow"
          >
            保存する
          </Button>
        </div>
      </div>
    </div>
  );
}
