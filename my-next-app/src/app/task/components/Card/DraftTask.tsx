"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Source } from "@/types/task";
import { useTaskStore } from "../../store/taskStore/taskStore";
import { useShallow } from "zustand/shallow";

interface DraftTaskProps {
  source: Source;
  onClose: () => void;
}

export default function DraftTask({ source, onClose }: DraftTaskProps) {
  const { addTask, addBoard } = useTaskStore(
    useShallow((state) => ({
      addTask: state.addTask,
			addBoard: state.addBoard,
    }))
  );

  const [draftTitle, setDraftTitle] = useState("");

  const handleSubmit = () => {
    if (!draftTitle.trim()) {
      return;
    }
		if (source.type === "boardList") {
			addBoard(draftTitle)
		} else {
	    addTask(draftTitle, source);
		}
    setDraftTitle("");
  };

  const handleCancel = () => {
    setDraftTitle("");
    onClose();
  };

	const addBoradStyle = source.type === "boardList"
		? "w-100 bg-neutral-300 self-start"
		: "bg-white"

  return (
    <>
      {/* 1. 画面全体の操作をブロックする透明なオーバーレイ */}
      <div 
        className="fixed inset-0 z-40 cursor-default bg-black/10"
        onClick={(e) => {
					e.stopPropagation()
					handleCancel()
				}} // 外側クリックで閉じる挙動をここで担保
      />

      {/* 2. 入力フォーム本体 (z-indexを上げてオーバーレイより前に出す) */}
      <div
        className={`
					relative z-50 p-4
					border-2 rounded-lg	border-gray-300 shadow-xl
					${addBoradStyle}
					`}
        onClick={(e) => e.stopPropagation()} // フォーム内クリックで閉じないようにする
      >
        <Input
          autoFocus
          placeholder="タイトルを入力..."
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onKeyDown={(e) => {
						if (e.nativeEvent.isComposing) return
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") handleCancel();
          }}
          className="mb-4 bg-white"
        />
        <div className="flex gap-2">
          <Button onClick={handleSubmit} className="shrink-0 rounded-2xl">
            追加
          </Button>
          <Button variant="ghost" onClick={handleCancel} className="shrink-0">
            キャンセル
          </Button>
        </div>
      </div>
    </>
  );
}