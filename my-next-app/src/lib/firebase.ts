// Firebase 初期化用モジュール (例: src/lib/firebase.js)
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// 環境変数から設定値を読み込む
const firebaseConfig = {
  // NEXT_PUBLIC_ をプレフィックスとして使用
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 環境変数が正しく設定されているか確認（特にサーバーサイドで重要）
if (!firebaseConfig.apiKey) {
  console.error("Firebase API Key is missing. Check your .env.local file.");
}

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
