'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useItemStore } from "../../store/ItemStore";
import { Item } from "@/types/item"
import { addCard } from "./lib/addCard";

interface CardCreateButton {
	selfItem: Item
}

// BoardCreateButton: ボード追加用コンポーネント
export default function CardCreateButton({ selfItem }: CardCreateButton) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
	const {items} = useItemStore();

  const handleSubmit = () => {
		if (!title.trim()) return;
		const newItems = addCard(title, selfItem, items)
			useItemStore.setState((prev) => ({
		...prev,
		items: newItems
	}))

    setTitle("");
    setOpen(false);
  };

  return (
    <div className="p-2">
      {open ? (
        <div className="flex gap-2 items-center">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="カード名"
            className="w-40"
          />
          <Button onClick={handleSubmit} className="rounded-2xl">追加</Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>キャンセル</Button>
        </div>
      ) : (
        <Button onClick={() => setOpen(true)} className="rounded-2xl w-full">
          ＋ カードを追加
        </Button>
      )}
    </div>
  );
}
