// src/app/actions/projectActions.ts
"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProject(
  title: string,
  userId: string,
  projectId: string,
) {
  try {
    const newProject = await prisma.project.create({
      data: {
        id: projectId,
        title: title,
        userId: userId, // 作成者ID
        boardOrder: [],
        members: {
          create: {
            userId: userId,
            role: "OWNER",
            status: "ACTIVE", // 作成者は即アクティブ
          },
        },
      },
      include: {
        members: true, // メンバー情報も含めて返す
      }
    });
    // ダッシュボードのデータを最新にする（キャッシュ更新）
    revalidatePath("/home");
    return { success: true, project: newProject };
  } catch (error) {
    console.error("Project creation error:", error);
    return { success: false, error: "プロジェクトの作成に失敗しました" };
  }
}

export async function getProjects(userId: string) {
  try {
    // userIdがProjectMemberに含まれているプロジェクトをすべて取得
    const memberships = await prisma.projectMember.findMany({
      where: { userId: userId },
      include: {
        project: true, // リレーション先のプロジェクト本体を取得
      },
      orderBy: {
        project: { id: "asc" },
      },
    });

    // フロントエンドで扱いやすいように「プロジェクト情報 + 自分の権限」の形に整形
    const data = memberships.map((m) => ({
      ...m.project,
      myRole: m.role,
      myStatus: m.status,
    }));

    return { success: true, data };
  } catch (error) {
    console.error("Fetch projects error:", error);
    return { success: false, error: "取得に失敗しました" };
  }
}

export async function updateProjectTitle(
  projectId: string,
  userId: string,
  newTitle: string,
) {
  try {
    // 権限チェック：そのプロジェクトのメンバーであり、かつEDITOR以上のロールを持っているか
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });

    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      return { success: false, error: "更新権限がありません" };
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { title: newTitle },
    });

    revalidatePath("/home");
    return { success: true, project: updatedProject };
  } catch (error) {
    console.error("Project update error:", error);
    return { success: false, error: "プロジェクト名の更新に失敗しました" };
  }
}

export async function deleteProject(projectId: string, userId: string) {
  try {
    // 権限チェック：OWNERのみ削除可能
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });

    if (!member || member.role !== "OWNER") {
      return { success: false, error: "プロジェクトを削除する権限がありません" };
    }

    // プロジェクトを削除（ProjectMemberもCascadeで削除されるようにスキーマを設定している前提）
    await prisma.project.delete({
      where: { id: projectId },
    });

    revalidatePath("/home");
    return { success: true };
  } catch (error) {
    console.error("Project deletion error:", error);
    return { success: false, error: "プロジェクトの削除に失敗しました" };
  }
}