'use client'

import { useEffect, useRef, useState } from "react";
import { useSearchNode } from "./lib/searchNode";
import { useModalStore } from "../../store/ModalStore";

export default function Modal({}) {
  const [title, setTitle] = useState<string>("");
	const nodeTitle = useSearchNode()?.title
  const [details, setDetails] = useState<string>("");
	const nodeDetail = useSearchNode()?.details

	const { hideModal } = useModalStore()
  const titleRef = useRef(null);

  // 開いた瞬間にフォーカス
  useEffect(() => {
    if (titleRef.current) titleRef.current.focus();
  }, []);

  useEffect(() => {
		// モーダルの内容を初期化
		if (nodeTitle) setTitle(nodeTitle)
		if (nodeDetail) setDetails(nodeDetail)

		// 背景スクロール禁止
		document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleBackgroundClick = (e) => {
    if (e.target.id === "modal-background") {
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
          width: "400px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          position: "relative",
          pointerEvents: "auto",
        }}
      >
        <button
          onClick={hideModal}
          style={{
            position: "absolute",
            right: "10px",
            top: "10px",
            border: "none",
            background: "transparent",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          ×
        </button>

        <h3>カード編集</h3>

        <div style={{ marginTop: "15px" }}>
          <label>タイトル</label>
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "4px",
              borderRadius: "4px",
              border: "1px solid #ccc",
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
          // onClick={() => onSave(title, details)}
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
