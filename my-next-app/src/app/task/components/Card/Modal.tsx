"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchNode } from "./lib/searchNode";
import { replaceNodeById } from "./lib/replaceNode";
import { useModalStore } from "../../store/ModalStore";
import { useItemStore } from "../../store/ItemStore";
import { Item } from "@/types/item";
import { sendTreeDataToApi } from "@/lib/sendTreeDataToApi"

export default function Modal({}) {
  // --- 状態とストアからのデータ取得 ---
  // フック呼び出しをトップレベルで1回に整理
  const activeNode = useSearchNode();

  // 更新に必要なストアのアクション/データを取得
  const { hideModal, clickedActiveId } = useModalStore();
  const { items, setItems } = useItemStore();

  // UIの状態
  const [title, setTitle] = useState<string>(activeNode?.title || "");
  const [details, setDetails] = useState<string>(activeNode?.details || "");
  const titleRef = useRef<HTMLInputElement>(null);

  const resizeTitleHeight = () => {
    // DOM要素の現在値を取得（refを使用）
    const textarea = titleRef.current;
    const MAX_HEIGHT_FOR_ONE_LINE = 64;

    if (textarea) {
      textarea.style.height = "auto"; // 高さをリセットして、入力内容に合わせた正確なscrollHeightを取得する
      textarea.style.height = `${textarea.scrollHeight}px`; // 一回挟まないと何故かできない。要検証。
      if (textarea.scrollHeight < MAX_HEIGHT_FOR_ONE_LINE)
        textarea.style.height = `40px`; // 1行の時には40pxで固定する
      else textarea.style.height = `${textarea.scrollHeight}px`; // scrollHeight（コンテンツ全体を表示するために必要な高さ）をセットする
    }
  };

  // --- useEffect: 初期化とスクロール禁止 ---
  useEffect(() => {
    // モーダルの内容を初期化

    // 背景スクロール禁止
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activeNode]); // ★ activeNode に依存させることで、IDが変わるたびに初期化される

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus();
      resizeTitleHeight();
    }
  }, [title]);

  // --- 保存処理 ---
  const onSave = async () => {
		if (!activeNode || !clickedActiveId) return;

		// 1. 新しいノード（変更部分のみ）を作成
		const updatedNode: Item = {
			...activeNode,
			title: title,
			details: details,
		};

		// 2. ツリーの中から古いノードを新しいノードに置き換える
		const newItems = replaceNodeById(items, clickedActiveId, updatedNode);

		// 3. ストアの状態を更新 (PC側で即時画面反映)
		setItems(newItems);

		// 4. ★ 抽出したAPI関数を呼び出す ★
		try {
			await sendTreeDataToApi(newItems); // API送信の完了を待つ
			
			// 5. モーダルを非表示にする (API送信後に閉じる)
			hideModal();

		} catch (error) {
			// sendTreeDataToApi 内で再スローされたエラーをここでキャッチ
			// ユーザーへの通知などを行う
			console.log("エラーによりモーダルを閉じません。");
		}
	};

	const handleBackgroundClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
		if (e.target.id === "modal-background") {
			hideModal();
		}
  };

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
            lineHeight: "1", // 中央揃えを改善
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
            // 変更点：新しいハンドラを呼び出す
            onChange={(e) => {
              setTitle(e.target.value);
            }}
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
            }}
          />
        </div>

        <div style={{ marginTop: "15px" }}>
          <label>詳細</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            style={{
              width: "100%",
              height: "100px",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              resize: "vertical",
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
