import { getAuth, signOut } from "firebase/auth";

const auth = getAuth();

export const handleLogout = () => {
  signOut(auth)
    .then(() => {
      // ログアウト成功後の処理（例：ログイン画面へリダイレクト）
      console.log("ログアウトしました");
    })
    .catch((error) => {
      // エラーハンドリング
      console.error("ログアウトエラー:", error);
    });
};
