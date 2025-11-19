import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Item } from "@/types/item";
import { useItemStore } from "../../ItemStore";

// BoardCreateButton: ボード追加用コンポーネント
export default function CardCreateButton({ selfItem }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
	const { items, setItems } = useItemStore();

  const handleSubmit = () => {
		console.log("ボードを取得：", selfItem)
    if (!title.trim()) return;
		const newCard = {
			id: `card-${Date.now()}`, // 一意のIDを生成
			level: 1,
			title: title.trim(),
			details: "",
			children: [],
		} // ここにカードの初期データを設定
		console.log("newカードを取得：", newCard)
		setItems([...selfItem.children, newCard])
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
