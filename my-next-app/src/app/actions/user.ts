// src/app/actions/user.ts
"use server"

import { prisma } from "@/lib/prisma";

export async function syncUserAction(data: { id: string, email: string }) {
  try {
    // ユーザーが存在するか確認。いなければ作成（Upsert）。
    // 名前（name）はDB側で管理するため、更新(update)時には含めない。
    const user = await prisma.user.upsert({
      where: { id: data.id },
      update: {}, // 名前はDB側で変更するため、Firebaseからの同期時は何もしない
      create: {
        id: data.id,
        email: data.email,
        name: "新規ユーザー", // 初期値
      },
    });
    return { success: true, user };
  } catch (error) {
    console.error("Database sync error:", error);
    return { success: false, error: "Failed to sync user" };
  }
}


export async function updateUserNameAction(userId: string, newName: string) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: newName },
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, error: "更新に失敗しました" };
  }
}