"use client";

import { useEffect, useRef, useState } from "react";
import { useModalStore } from "../../store/ModalStore";
import { useTaskStore } from "../../store/taskStore/taskStore";
import { CardType } from "@/app/task/store/taskStore/types/TasksType";

export default function CardModal() {
  // --- 状態とストアからのデータ取得 ---

  // モーダルとタスクの状態を取得
  const { hideModal, clickedActiveId } = useModalStore();
  const { cards, updateTask } = useTaskStore();

  // フラット構造なので、IDを使って直接カードを特定
  const activeNode: CardType | null = clickedActiveId
    ? cards[clickedActiveId]
    : null;

  // UIの状態
  const [title, setTitle] = useState<string>(activeNode?.title || "");
  const [details, setDetails] = useState<string>(activeNode?.details || "");
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // --- 高さ調整ロジック ---
  const resizeTitleHeight = () => {
    const textarea = titleRef.current;
    const MAX_HEIGHT_FOR_ONE_LINE = 64;

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
  }, [clickedActiveId, cards]); // IDまたはcardsデータ自体が変わった時に再同期

  useEffect(() => {
    if (titleRef.current) {
      resizeTitleHeight();
    }
  }, [title]);

  // --- 保存処理 ---
  const onSave = async () => {
    if (!title.trim()) {
      setTitle("");
      return;
    }
    if (!activeNode || !clickedActiveId) return;
    // 更新内容が増えたらキーを追加
    updateTask(clickedActiveId, {
      title: title,
      details: details,
    });
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

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // e.targetの型チェック
    if ((e.target as HTMLElement).id === "modal-background") {
      hideModal();
    }
  };

  // 編集対象がない場合は何も表示しない（安全策）
  if (!activeNode) return null;

  return (
    <div
      id="modal-background"
      onClick={handleBackgroundClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          width: "600px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          position: "relative",
          pointerEvents: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={hideModal}
          style={{
            position: "absolute",
            right: "10px",
            top: "10px",
            border: "none",
            background: "transparent",
            fontSize: "36px",
            fontWeight: "bold",
            cursor: "pointer",
            lineHeight: "1",
            color: "#666",
          }}
        >
          ×
        </button>

        <h3>カード編集</h3>

        <div style={{ marginTop: "15px" }}>
          <label>タイトル</label>
          <textarea
            ref={titleRef}
            value={title}
            placeholder="タイトルを入力してください"
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              minHeight: "40px",
              padding: "8px",
              marginTop: "4px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              resize: "none",
              height: "40px",
              overflowY: "hidden",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ marginTop: "15px" }}>
          <label>詳細</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              height: "500px",
              padding: "8px",
              marginTop: "4px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        </div>

        <button
          onClick={() => onSave()}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "10px",
            background: "#0070f3",
            color: "#fff",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
          }}
        >
          保存
        </button>
      </div>
    </div>
  );
}
