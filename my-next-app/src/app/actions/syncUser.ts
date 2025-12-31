// app/actions/syncUser.ts
"use server";
import { prisma } from "@/lib/prisma";

export async function syncUser(firebaseUser: {
  uid: string;
  email: string;
  displayName?: string;
}) {
  if (!prisma) {
    console.error("Prisma client is not initialized");
    throw new Error("Database client missing");
  }

  // upsert (あれば更新、なければ作成)
  const user = await prisma.user.upsert({
    where: { id: firebaseUser.uid }, // FirebaseのUIDで検索
    update: {
      email: firebaseUser.email,
      name: firebaseUser.displayName,
    },
    create: {
      id: firebaseUser.uid, // なければFirebaseのUIDをIDとして作成
      email: firebaseUser.email,
      name: firebaseUser.displayName,
    },
  });
  return user;
}
