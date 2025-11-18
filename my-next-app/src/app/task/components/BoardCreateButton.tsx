import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// BoardCreateButton: ボード追加用コンポーネント
export default function BoardCreateButton({ boards, setBoards }) {

  const handleSubmit = () => {
		const newBoard = {
			id: `board-${Date.now()}`,
			children: [],
		}
		setBoards([...boards, newBoard]);
  };

  return (
    <div className="p-2">
        <Button onClick={handleSubmit} className="rounded-2xl w-full">
          ＋ ボードを追加
        </Button>
    </div>
  );
}
