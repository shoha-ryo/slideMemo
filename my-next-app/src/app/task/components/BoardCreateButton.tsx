import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// BoardCreateButton: ボード追加用コンポーネント
export default function BoardCreateButton({ items, setItems }) {

  const handleSubmit = () => {
		const newBoard = {
			id: `board-${Date.now()}`,
			children: [],
		}
		setItems([...items, newBoard]);
  };

  return (
    <div className="p-2">
        <Button onClick={handleSubmit} className="rounded-2xl w-full">
          ＋ ボードを追加
        </Button>
    </div>
  );
}
