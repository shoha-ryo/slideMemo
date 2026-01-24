// src/app/(auth)/logout/page.tsx
"use client"; // クライアントサイドでのみ実行することを明示

import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase"; // initializeApp しているファイルをインポート

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    signOut(auth)
      .then(() => {
        console.log("ログアウトしました");
        router.push("/login"); // ログイン画面へ飛ばす
      })
      .catch((error) => {
        console.error("ログアウトエラー:", error);
      });
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>ログアウト中...</p>
    </div>
  );
}
