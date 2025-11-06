'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Firebaseのログイン状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        読み込み中...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800">Task Manager</h1>

        <div>
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
            >
              ログアウト
            </button>
          ) : (
            <>
              <button
                onClick={() => router.push("/login")}
                className="text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 mr-3 transition"
              >
                ログイン
              </button>
              <button
                onClick={() => router.push("/register")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                新規登録
              </button>
            </>
          )}
        </div>
      </header>

      {/* メイン部分 */}
      <main className="flex flex-col items-center justify-center flex-grow">
        {user ? (
          <div className="bg-white p-8 rounded-2xl shadow-md text-center w-96">
            <h2 className="text-2xl font-bold mb-4">ようこそ！</h2>
            <p className="mb-6">{user.email} でログイン中です。</p>
            <p className="text-gray-600 mb-4">
              あなたのタスクをここで管理しましょう。
            </p>
						{/* ここに/taskにルーティングさせるボタンを作成 */}
						<button
              onClick={() => router.push("/task")}
              className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition shadow-lg mt-4"
            >
              タスク管理を始める
            </button>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl shadow-md text-center w-96">
            <h2 className="text-2xl font-bold mb-4">ゲストモード</h2>
            <p className="text-gray-600 mb-6">
              ログインするとタスク管理機能が利用できます。
            </p>
            <div>
              <button
                onClick={() => router.push("/login")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                ログインして始める
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
