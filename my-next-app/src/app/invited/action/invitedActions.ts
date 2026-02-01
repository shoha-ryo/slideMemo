"use server"


import { SignJWT, jwtVerify } from "jose";
import { MemberRole } from "@prisma/client";
// import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const SECRET_KEY = new TextEncoder().encode(
  process.env.INVITE_TOKEN_SECRET || "default_secret_key_change_me"
);

const ALGORITHM = "HS256";

// ペイロードの型定義を拡張
interface InvitePayload {
  projectId: string;
  projectTitle: string; // プロジェクト名も追加
  role: MemberRole;
  inviterName: string | null; // 招待者の名前
  inviterEmail: string;        // 招待者のメアド
}

/**
 * 1. 招待URLを生成する
 */
export async function generateInviteUrl(
  projectId: string,
  projectTitle: string,
  role: MemberRole,
  inviterName: string | null,
  inviterEmail: string,
  expiresIn: string = "24h"
) {
  // ペイロードに必要な情報をすべて詰め込む
  const token = await new SignJWT({ 
    projectId, 
    projectTitle, 
    role, 
    inviterName, 
    inviterEmail 
  })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(SECRET_KEY);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/invited?token=${token}`;
}

/**
 * 2. トークンをデコード・検証する
 */
export async function verifyInviteToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: [ALGORITHM],
    });

    return {
      success: true,
      data: payload as unknown as InvitePayload,
    };
  } catch (error) {
    console.error("JWT Verification failed:", error);
    return {
      success: false,
      error: "トークンが無効であるか、有効期限が切れています。",
    };
  }
}


export async function acceptInvitation(token: string, userId: string) {
	// 1. トークンの検証
  const verification = await verifyInviteToken(token);
  if (!verification.success || !verification.data) {
		return { success: false, error: verification.error };
  }
	
  const { projectId, role } = verification.data;
	
  try {
		// 2. ProjectMember レコードの作成または更新
    // upsert を使うことで、既に招待(INVITED)レコードがあっても上書きできる
    const member = await prisma.projectMember.upsert({
			where: {
				projectId_userId: {
					projectId: projectId,
          userId: userId,
        },
      },
      update: {
				status: "ACTIVE", // 参加中に更新
        role: role,      // 招待時のロールを適用
      },
      create: {
				projectId: projectId,
        userId: userId,
        role: role,
        status: "ACTIVE",
      },
    });
		
    // 3. キャッシュのクリア（プロジェクト一覧や設定画面を最新にする）
    // revalidatePath("/home");
    // revalidatePath(`/task/${projectId}`);

    return { success: true, projectId: member.projectId };
  } catch (error) {
    console.error("Failed to accept invitation:", error);
    return { success: false, error: "プロジェクトへの参加に失敗しました。" };
  }
}