import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useItemStore } from "../../ItemStore";

// BoardCreateButton: ボード追加用コンポーネント
export default function BoardCreateButton({}) {

	const { items } = useItemStore();

  const handleSubmit = () => {
		const newBoard = {
			id: `board-${Date.now()}`,
			children: [],
		}
		useItemStore.setState([...items, newBoard]);
  };

  return (
    <div className="p-2">
        <Button onClick={handleSubmit} className="rounded-2xl w-full">
          ＋ ボードを追加
        </Button>
    </div>
  );
}
