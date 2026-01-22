// src/components/AuthGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { AuthLoading } from "./AuthLoading";
import { useUserStore } from "@/store/userStore";
import { syncUserAction } from "@/app/actions/user"; // ★Server Actionをインポート

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const { setUser, setSynced, clearUser } = useUserStore();
  const router = useRouter();

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      clearUser();
      setLoading(false);
      router.push("/login");
      return;
    }

    // 1. 最初は最小限の情報（IDとメール）だけセットしてUIロック解除
    setUser({
      id: firebaseUser.uid,
      email: firebaseUser.email ?? "",
      name: null,
      image: "",
    });
    setLoading(false);

    // 2. 裏でDBから「本当の名前」を取得する
    const result = await syncUserAction({
      id: firebaseUser.uid,
      email: firebaseUser.email ?? "",
    });

    if (result.success && result.user) {
      // DBに保存されている名前を反映
      setUser({
        id: result.user.id,
        email: result.user.email,
        name: result.user.name ?? "",
        image: "", // 必要ならPrismaのモデルにimageを追加してください
      });
      setSynced(true);
    }
  });

    return () => unsubscribe();
  }, [setUser, setSynced, router]);

  if (loading) return <AuthLoading />;

  return <>{children}</>;
}