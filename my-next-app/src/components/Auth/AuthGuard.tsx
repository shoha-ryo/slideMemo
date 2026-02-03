// src/components/AuthGuard.tsx
"use client";

// firebaseでの認証とユーザー情報の取得を行う
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { AuthLoading } from "./AuthLoading";
import { useUserStore } from "@/store/userStore";
import { syncUserAction } from "@/app/actions/user"; // ★Server Actionをインポート
import { db } from "../../../dexie/dexie";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const { setUser, setSynced, clearUser, user } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    console.log("ガード実行");

    // dexieからstoreに反映
    const hydrateCache = async () => {
      const cached = await db.userMeta.get("current");
      if (cached && !user) {
        setUser({
          id: cached.uid,
          email: cached.email ?? "",
          name: cached.name ?? null,
          image: cached.photoURL ?? "",
        });
      }
    };
    hydrateCache();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        clearUser();
        await db.userMeta.delete("current");
        setLoading(false);
        router.push("/login");
        return;
      }

      // 1. 最初は最小限の情報（IDとメール）だけセットしてUIロック解除
      const basicInfo = {
        id: firebaseUser.uid,
        email: firebaseUser.email ?? "",
        name: user?.name ?? null, // キャッシュがあればそれを引き継ぐ
        image: firebaseUser.photoURL ?? "",
      };
      setUser(basicInfo);
      setLoading(false);

      // 2. 裏でDBから「本当の名前」を取得する
      const result = await syncUserAction({
        id: firebaseUser.uid,
        email: firebaseUser.email ?? "",
      });

      if (result.success && result.user) {
        const latestInfo = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name ?? "",
          image: "",
        };
        setUser(latestInfo);
        setSynced(true);

        // 3. 最新情報をDexieに保存（次回の0ms表示のため）
        await db.userMeta.put({
          id: "current",
          uid: latestInfo.id,
          email: latestInfo.email,
          name: latestInfo.name,
          photoURL: latestInfo.image,
          updatedAt: Date.now(),
        });
      }
    });

    return () => unsubscribe();
  }, [setUser, setSynced, clearUser, router]);
  // userを監視配列に入れると無限ループになる

  if (loading) return <AuthLoading />;

  return <>{children}</>;
}
