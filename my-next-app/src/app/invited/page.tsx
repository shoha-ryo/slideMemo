"use client";

import { useEffect, useState, Suspense } from "react";
import { useUserStore } from "@/store/userStore";
import { acceptInvitation } from "./action/invitedActions";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyInviteToken } from "./action/invitedActions";
import { InvitePayload } from "./action/invitedActions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ShieldCheck,
  UserPlus,
  XCircle,
  ChevronRight,
  UserCircle,
} from "lucide-react";
import { AuthGuard } from "@/components/Auth/AuthGuard";

export default function InvitedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <InviteContent />
    </Suspense>
  );
}

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState<InvitePayload | undefined>(
    undefined,
  );
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserStore();

  const handleJoin = async () => {
    if (!user || !token || !user.id) return;

    try {
      const res = await acceptInvitation(token, user.id);
      if (res.success) {
        // 成功したらプロジェクト画面へ
        router.push(`/task/${res.projectId}`);
      } else {
        setError(res.error || "エラーが発生しました");
      }
    } catch (err: unknown) {
      setError("通信に失敗しました");
    } finally {
    }
  };

  useEffect(() => {
    async function validate() {
      if (!token) {
        setError("招待リンクが正しくありません。");
        setLoading(false);
        return;
      }
      const res = await verifyInviteToken(token);
      if (res.success) {
        setInviteData(res.data);
      } else {
        setError(res.error || "トークンの検証に失敗しました。");
      }
      setLoading(false);
    }
    validate();
  }, [token]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4 bg-slate-50">
        <Card className="w-full max-w-md border-red-100 shadow-lg">
          <CardHeader className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-red-600">招待エラー</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/")} className="w-full">
              トップページへ
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-2xl border-none">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold">
              プロジェクトへの招待
            </CardTitle>
            <CardDescription>
              新しいチームがあなたの参加を待っています
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* 1. 招待元の情報セクション（プロジェクトと招待者のみ） */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                招待元
              </label>
              <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col">
                  <span className="text-xl font-black text-slate-900 leading-tight">
                    {inviteData?.projectTitle || "読み込み中..."}
                  </span>
                  <span className="text-xs text-slate-400 font-medium mt-1">
                    プロジェクトに招待されました
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-50">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                    {(inviteData?.inviterName?.[0] || "M").toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      招待者
                    </span>
                    <span className="text-sm font-semibold text-slate-700 truncate">
                      {inviteData?.inviterName || "管理者"}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {inviteData?.inviterEmail}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 自分のアカウント情報 ＋ 権限 セクション */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                参加するあなたのアカウント
              </label>
              <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
                    <UserCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-amber-800 uppercase">
                      ログイン中
                    </p>
                    <p className="text-sm text-amber-900/70 truncate font-bold">
                      {user?.name}
                    </p>
                    <p className="text-sm text-amber-900/70 truncate font-medium">
                      {user?.email}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-7 px-2 bg-white border-amber-200 text-amber-700 hover:bg-amber-100"
                  >
                    切替
                  </Button>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white/60 rounded-xl border border-amber-100/50">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-900/80">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    付与される権限
                  </div>
                  <Badge className="bg-amber-600 hover:bg-amber-600 text-white border-none px-3">
                    {inviteData?.role || "---"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pb-8">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
              onClick={handleJoin}
            >
              参加する <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
            <div className="grid grid-cols-2 gap-3 w-full">
              {/* 案2: 辞退・スキップの分離 */}
              <Button
                variant="outline"
                onClick={() =>
                  //todo:INVITEDでDBに追加する処理を追加
                  router.push("/home")
                }
              >
                後で（スキップ）
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push("/home")}
                className="text-slate-400 hover:text-red-600 hover:bg-red-50"
              >
                辞退する
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </AuthGuard>
  );
}
