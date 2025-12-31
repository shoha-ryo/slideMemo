// src/app/actions/projectActions.ts
"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProject(title: string, userId: string) {
  try {
    const newProject = await prisma.project.create({
      data: {
        title: title,
        userId: userId,
        boardOrder: [], // 初期状態は空
      },
    });

    // ダッシュボードのデータを最新にする（キャッシュ更新）
    revalidatePath("/dashboard");
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
