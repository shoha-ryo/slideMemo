// src/lib/prisma.ts (既に作っているはずですが、こちらを import してください)
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // ここをオンにすると、遅いクエリがログで見えるようになります
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
