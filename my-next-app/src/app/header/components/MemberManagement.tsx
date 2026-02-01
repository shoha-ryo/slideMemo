"use client";

import { useEffect, useState } from "react";
import { User, Settings, Trash2, UserPlus, Loader2, X } from "lucide-react";
import { MemberRole, MemberStatus } from "@prisma/client";
import { getProjectMembers } from "../actions/memberActions";
import { db } from "../../../../dexie/dexie";
import { useTaskStore } from "@/app/task/store/taskStore/taskStore";
import { InviteLinkGenerator } from "./InviteLinkGenerator";


export const getMyRoleInProject = async (projectId: string) => {
  // 複合インデックス [projectId+userId] を使用して高速検索
  const membership = await db.projectMembers
    .where({ projectId })
    .first();

  return membership ? membership.role : null;
};


interface Member {
  userId: string;
  name: string | null;
  email: string;
  role: MemberRole;
  status: MemberStatus;
}

export const MemberManagement = () => {
  // 初期値を空配列にすることで .map のエラーを回避
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
	const [showInviteGenerator, setShowInviteGenerator] = useState(false);
	const [currentUserRole, setCurrentUserRole] = useState<MemberRole>()
	const {projectId, userId} = useTaskStore.getState()

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
			if (!projectId || !userId ) return
			const currentUserRole = await getMyRoleInProject(projectId)
			if (!currentUserRole) return
			setCurrentUserRole(currentUserRole)
      const result = await getProjectMembers(projectId, userId);
      if (result.success && result.data) {
        setMembers(result.data as Member[]);
      }
      setLoading(false);
    };

    fetchMembers();
  }, [projectId, userId]);

  const canManage = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        メンバーを読み込み中...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-700 flex items-center gap-2">
          <User className="w-4 h-4" /> メンバー管理
        </h3>
        {canManage && (
          <button 
            onClick={() => setShowInviteGenerator(!showInviteGenerator)}
            className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg transition ${
              showInviteGenerator 
                ? "bg-slate-200 text-slate-600 hover:bg-slate-300" 
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {showInviteGenerator ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {showInviteGenerator ? "閉じる" : "招待"}
          </button>
        )}
      </div>
			{/* 招待URL生成エリア (条件付きレンダリング) */}
			<div 
				className={`grid transition-all duration-300 ease-in-out ${
					showInviteGenerator && projectId
						? "grid-rows-[1fr] opacity-100 border-b border-slate-100 bg-blue-50/30" 
						: "grid-rows-[0fr] opacity-0"
				}`}
			>
				<div className="overflow-hidden">
					<div className="p-4">
						{projectId && <InviteLinkGenerator />}
					</div>
				</div>
			</div>

      <table className="w-full text-left border-collapse">
        {/* ...thead部分はそのまま... */}
        <tbody className="divide-y divide-slate-100">
          {members.length > 0 ? (
            members.map((member) => (
              <tr key={member.userId} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900">{member.name || "名称未設定"}</span>
                    <span className="text-xs text-slate-500">{member.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    member.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">{member.role}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  {canManage && member.role !== "OWNER" && member.userId !== userId && (
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-500"><Settings className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-6 py-10 text-center text-slate-400">メンバーがいません</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};