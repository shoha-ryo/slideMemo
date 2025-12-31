// src/components/CreateProjectForm.tsx
"use client";

import { useState } from "react";
import { getAuth } from "firebase/auth";
import { createProject } from "@/app/actions/projectActions";

export default function CreateProjectForm() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      alert("ログインが必要です");
      return;
    }

    setLoading(true);
    const result = await createProject(title, user.uid);
    setLoading(false);

    if (result.success) {
      setTitle(""); // フォームをクリア
      alert("プロジェクトを作成しました！");
    } else {
      alert(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-xl bg-white shadow-sm">
      <h2 className="text-lg font-bold mb-4">新しいプロジェクトを開始</h2>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="プロジェクト名（例：買い物リスト）"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={loading || !title}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "作成中..." : "作成"}
        </button>
      </div>
    </form>
  );
}