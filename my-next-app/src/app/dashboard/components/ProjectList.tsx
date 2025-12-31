// src/components/ProjectList.tsx
"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getProjects } from "@/app/actions/projectActions";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
}

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 認証状態を監視して、UIDが取れたらフェッチ
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const result = await getProjects(user.uid);
        if (result.success && result.data) {
          setProjects(result.data);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p className="text-gray-500">プロジェクトを読み込み中...</p>;
  if (projects.length === 0) return <p className="text-gray-500">プロジェクトがまだありません。</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projects.map((project) => (
        <Link 
          key={project.id} 
          href={`/task/${project.id}`}
          className="block p-6 bg-white border rounded-xl shadow-sm hover:shadow-md hover:border-blue-400 transition-all"
        >
          <h3 className="font-bold text-lg text-gray-800">{project.title}</h3>
          <p className="text-sm text-blue-600 mt-2">タスクを表示 →</p>
        </Link>
      ))}
    </div>
  );
}