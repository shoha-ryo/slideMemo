"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Source } from "@/types/task";
import { useTaskStore } from "../../store/taskStore/taskStore";

interface CardCreateButtonProps {
  source: Source;
}

export default function CardCreateButton({ source }: CardCreateButtonProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const addTask = useTaskStore((state) => state.addTask);
  
  // コンポーネント全体を包む要素への参照
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. フォーカス制御
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // 2. 外側クリック検知ロジック
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // containerRef（このコンポーネント）の中にクリックされた要素が含まれていない場合
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setTitle(""); // 入力中だったものもリセット
      }
    };

    if (open) {
      // 開いている時だけイベントリスナーを登録
      document.addEventListener("mousedown", handleClickOutside);
    }

    // クリーンアップ関数：コンポーネントが消える時や閉じる時にリスナーを削除
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    addTask(title, source);
    setTitle("");
    inputRef.current?.focus();
  };

  return (
    // 外側判定のために一番外側のdivにrefを付ける
    <div className="p-2" ref={containerRef}>
      {open ? (
        <div className="flex gap-2 items-center">
          <Input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タスク名を入力..."
            className="w-full bg-white text-black"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") setOpen(false);
            }}
          />
          <Button onClick={handleSubmit} className="shrink-0 rounded-2xl">
            追加
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)} className="shrink-0">
            キャンセル
          </Button>
        </div>
      ) : (
        <Button 
          variant={source.type === "card" ? "ghost" : "default"} 
          onClick={() => setOpen(true)} 
          className="rounded-2xl w-full"
        >
          {source.type === "card" ? "＋ サブタスクを追加" : "+ カードを追加"}
        </Button>
      )}
    </div>
  );
}