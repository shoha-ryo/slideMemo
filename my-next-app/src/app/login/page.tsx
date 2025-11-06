"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SignUpPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault(); // 再読み込みを停止させる（状態リセットや非同期処理の中断を防ぐため）
		setError(null); // エラーメッセージをリセット（前回のエラーを表示させない）
		setLoading(true);
		try {
			await signInWithEmailAndPassword(auth, email, password);
			router.push("/dashboard");
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-center h-screen bg-gray-50">
			<form
				onSubmit={handleSubmit} // このフォーム内にある「ボタンを押した時」や「inputでEnterキーを押した時」に発火
				className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm"
			>
				<h1 className="text-2xl font-bold mb-6 text-center">ログイン画面</h1>

				<input
					type="email"
					placeholder="メールアドレス"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
				/>

				<input
					type="password"
					placeholder="パスワード（6文字以上）"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
				/>

				{error && <p className="text-red-500 text-sm mb-3">{error}</p>}

				<button
					type="submit"
					disabled={loading}
					className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
				>
					{loading ? "ログイン中..." : "ログイン"}
				</button>
			</form>
		</div>
	);
}
