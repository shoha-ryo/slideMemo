"use client";

import { useState } from "react";
import { Check, Copy, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MemberRole } from "@prisma/client";
import { generateInviteUrl } from "@/app/invited/action/invitedActions";
import { useUserStore } from "@/store/userStore";
import { useTaskStore } from "@/app/task/store/taskStore/taskStore";

export const InviteLinkGenerator = () => {
  const [role, setRole] = useState<MemberRole>("VIEWER");
  const [inviteUrl, setInviteUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const { user } = useUserStore.getState();
  const { projectId, projectTitle } = useTaskStore.getState();

  const handleGenerate = async () => {
    if (!user || !projectId || !projectTitle) return;
    const inviterName = user.name;
    const inviterEmail = user.email;

    const url = await generateInviteUrl(
      projectId,
      projectTitle,
      role,
      inviterName,
      inviterEmail,
      "24h",
    );
    setInviteUrl(url);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
        <Link className="w-4 h-4" />
        招待リンクの新規作成
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Select
            value={role}
            onValueChange={(value) => setRole(value as MemberRole)}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="権限を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VIEWER">閲覧者 (表示のみ)</SelectItem>
              <SelectItem value="EDITOR">編集者 (カード操作可能)</SelectItem>
              <SelectItem value="ADMIN">管理者 (メンバー管理可能)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleGenerate}
          className="bg-blue-600 hover:bg-blue-700"
        >
          リンクを生成
        </Button>
      </div>

      {inviteUrl && (
        <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg animate-in fade-in slide-in-from-top-1">
          <input
            readOnly
            value={inviteUrl}
            className="flex-1 text-xs text-slate-500 bg-transparent outline-none truncate"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={copyToClipboard}
            className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="ml-1 text-xs">
              {copied ? "コピー済" : "コピー"}
            </span>
          </Button>
        </div>
      )}

      <p className="text-[10px] text-slate-400">
        ※ リンクの有効期限は24時間です。URLを知っている全員が参加可能です。
      </p>
    </div>
  );
};
