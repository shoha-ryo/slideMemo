import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// BoardCreateButton: ボード追加用コンポーネント
export default function CardCreateButton({ items, setItems }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;
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
            placeholder="ボード名"
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
