"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

// SortableItemコンポーネント（ドラッグ可能なタスク）
function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

// ダッシュボード本体
export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState(["Task A", "Task B", "Task C"]);

  // Firebase認証状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {user ? (
          <div className="text-gray-700">Welcome, {user.email}</div>
        ) : (
          <div className="space-x-4">
            <Link href="/login" className="text-blue-600 font-medium">
              ログイン
            </Link>
            <Link href="/signup" className="text-blue-600 font-medium">
              新規登録
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto">
        {user ? (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {items.map((item) => (
                  <SortableItem key={item} id={item}>
                    <div className="bg-white rounded-lg p-4 shadow hover:shadow-md transition">
                      {item}
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center text-gray-600 mt-20">
            <p>ログインして自分のタスクを管理しましょう。</p>
          </div>
        )}
      </main>
    </div>
  );
}
