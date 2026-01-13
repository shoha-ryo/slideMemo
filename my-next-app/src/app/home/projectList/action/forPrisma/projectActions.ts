// src/app/actions/projectActions.ts
"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProject(title: string, userId: string, projectId: string) {
  try {
    const newProject = await prisma.project.create({
      data: {
				id: projectId,
        title: title,
        userId: userId,
        boardOrder: [], // 初期状態は空
      },
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
    const projects = await prisma.project.findMany({
      where: { userId: userId },
      orderBy: { id: "asc" }, // 取得順を安定させる
    });
    return { success: true, data: projects };
  } catch (error) {
    console.error("Fetch projects error:", error);
    return { success: false, error: "取得に失敗しました" };
  }
}

export async function updateProjectTitle(projectId: string, userId: string, newTitle: string) {
  try {
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
        userId: userId, // 権限チェック（本人のプロジェクトのみ更新可能）
      },
      data: {
        title: newTitle,
      },
    });

    // 画面のデータを最新にする
    revalidatePath("/home");

    return { success: true, project: updatedProject };
  } catch (error) {
    console.error("Project update error:", error);
    return { success: false, error: "プロジェクト名の更新に失敗しました" };
  }
}

export async function deleteProject(projectId: string) {
  try {
    // 1. プロジェクトを削除
    // カード・ボードのCascadeは有効
    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    // 2. キャッシュを更新して画面を最新状態にする
    revalidatePath("/home");

    return { success: true };
  } catch (error) {
    console.error("Project deletion error:", error);
    return { success: false, error: "プロジェクトの削除に失敗しました" };
  }
}