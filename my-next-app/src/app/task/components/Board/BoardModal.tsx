// src/app/task/BoardModal.tsx (または components/modals/BoardModal.tsx など)

"use client";

import { useEffect, useRef, useState } from "react";
import { useModalStore } from "../../store/ModalStore";
import { useTaskStore } from "../../store/taskStore/taskStore";
import { updateBoardLogic } from "../../store/taskStore/updateBoard/updateBoard"; 
import { emptyTasks } from "@/app/task/actions/emptyTasks"; // emptyTasksも必要に応じてインポート

import { BoardType } from "@/types/task";

export default function BoardModal() {
  // --- 状態とストアからのデータ取得 ---
  
  // モーダルとタスクの状態を取得
  const { hideModal, clickedActiveId } = useModalStore(); // clickedActiveId がボードIDを指す想定
  const { boards, updateBoard } = useTaskStore(); // setDiffTasks も取得

  // フラット構造なので、IDを使って直接ボードを特定
  const activeBoard: BoardType | null = clickedActiveId ? boards[clickedActiveId] : null;

  // UIの状態
  const [title, setTitle] = useState<string>("");
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // --- 高さ調整ロジック (タイトル用) ---
  const resizeTitleHeight = () => {
    const textarea = titleRef.current;
    const MAX_HEIGHT_FOR_ONE_LINE = 64; // 必要に応じて調整

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
    // モーダルの内容を初期化
    if (activeBoard?.title) {
      setTitle(activeBoard.title);
    }

    // 背景スクロール禁止
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [clickedActiveId, boards]); // IDまたはboardsデータ自体が変わった時に再同期

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
    if (!activeBoard || !clickedActiveId) return;

 		// 更新内容が増えたらキーを追加
		updateBoard(
			clickedActiveId,
			{
				title: title,
			}
		)

		hideModal()
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).id === "modal-background") {
      hideModal();
    }
  };

  // 編集対象がない場合は何も表示しない（安全策）
  if (!activeBoard) return null;

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
          width: "400px", // ボードなので少し小さめに
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

        <h3>ボード編集</h3>

        <div style={{ marginTop: "15px" }}>
          <label>タイトル</label>
          <textarea
            ref={titleRef}
            value={title}
            placeholder="ボード名を入力してください"
            onChange={(e) => setTitle(e.target.value)}
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
              fontFamily: "inherit"
            }}
          />
        </div>
        
        {/* ボードには詳細欄はない想定 */}
        {/* <div style={{ marginTop: "15px" }}>
          <label>詳細</label>
          <textarea ... />
        </div> */}

        <button
          onClick={onSave}
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