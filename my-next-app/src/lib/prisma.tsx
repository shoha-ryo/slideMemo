// src/lib/prisma.ts (既に作っているはずですが、こちらを import してください)
// import { PrismaClient } from "@prisma/client";

// const globalForPrisma = global as unknown as { prisma: PrismaClient };

// export const prisma =
//   globalForPrisma.prisma ||
//   new PrismaClient({
//     log: ["query"], // ここをオンにすると、遅いクエリがログで見えるようになります
//   });

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


//todo:案A:SQLクエリごとに詳細な時刻を表示する。
import { PrismaClient } from "@prisma/client";
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const createPrismaClient = () => {
  const client = new PrismaClient({
    // queryを'event'として出すように設定
    log: [
      { emit: "event", level: "query" },
      { emit: "stdout", level: "info" },
      { emit: "stdout", level: "warn" },
      { emit: "stdout", level: "error" },
    ],
  });
  // クエリイベントをフックして時刻を付けて出力
  // @ts-ignore
  client.$on("query", (e: any) => {
    const now = new Date().toLocaleString("ja-JP");
    console.log(`\x1b[36m[${now}]\x1b[0m \x1b[34mQuery:\x1b[0m ${e.query}`);
    console.log(`\x1b[36m[${now}]\x1b[0m \x1b[33mParams:\x1b[0m ${e.params}`);
  });
  return client;
};
export const prisma = globalForPrisma.prisma || createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;