"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardType } from "@/types/task";
import { useTaskStore } from "../../store/taskStore/taskStore";

interface CardCreateButton {
	card: CardType;
}


export default function CardCreateFromCardButton({ card }: CardCreateButton) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const addTask = useTaskStore(state => state.addTask)

	const handleSubmit = () => {
		if (!title.trim()) return;
		addTask(title, {type: "card", data: card});
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
					<Button onClick={handleSubmit} className="rounded-2xl">
						追加
					</Button>
					<Button variant="ghost" onClick={() => setOpen(false)}>
						キャンセル
					</Button>
				</div>
			) : (
				<Button onClick={() => setOpen(true)} className="rounded-2xl w-full">
					＋
				</Button>
			)}
		</div>
	);
}
