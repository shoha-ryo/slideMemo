"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { MemberRole } from "@prisma/client";

// プロジェクトに所属するメンバー一覧を取得する
export async function getProjectMembers(projectId: string, userId: string) {
  try {
    // 1. 閲覧権限チェック（実行者がそのプロジェクトのメンバーであること）
    const requester = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });
    if (!requester) {
      return { success: false, error: "プロジェクトへのアクセス権がありません" };
    }
    // 2. メンバーとユーザー情報を結合して取得
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            // パスワードなどの機密情報は含めない
          }
        }
      },
      orderBy: {
        role: 'asc' // OWNER -> ADMIN -> EDITOR の順に並びやすくなる
      }
    });
    // フロントエンドで扱いやすい形に整形
    const formattedMembers = members.map(m => ({
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      status: m.status,
    }));

    return { success: true, data: formattedMembers };
  } catch (error) {
    console.error("Fetch members error:", error);
    return { success: false, error: "メンバー情報の取得に失敗しました" };
  }
}

// メンバーの権限を変更する
export async function updateMemberRole(projectId: string, targetUserId: string, newRole: MemberRole, adminUserId: string) {
  // 実行者がADMIN以上かチェック
  const admin = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: adminUserId } }
  });

  if (!admin || (admin.role !== "OWNER" && admin.role !== "ADMIN")) {
    throw new Error("権限がありません");
  }

  await prisma.projectMember.update({
    where: { projectId_userId: { projectId, userId: targetUserId } },
    data: { role: newRole }
  });

  revalidatePath(`/project/${projectId}/settings`);
}

// メンバーを削除（追放）する
export async function removeMember(projectId: string, targetUserId: string, adminUserId: string) {
  // 実行者チェック（略）
  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId: targetUserId } }
  });
  revalidatePath(`/project/${projectId}/settings`);
}