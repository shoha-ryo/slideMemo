// app/api/save-tree/route.ts

import { NextResponse, NextRequest } from "next/server";
import { treeToFlat, Item } from "@/lib/treeToFlat";
// ファイルシステム操作のために 'fs/promises' をインポート
import { writeFile } from "fs/promises";

/**
 * DB保存処理を実行する POST エンドポイント (Route Handler)
 */
export async function POST(request: NextRequest) {
  console.log("ー".repeat(100));

  // 🚨 開発環境でのファイルパス（本番環境では動作しない）
  const TARGET_PATH =
    "/Users/shoharyo/Desktop/dev/slideMemo/my-next-app/src/app/task/treeData.json";

  try {
    // 1. リクエストボディからツリー構造データを受信
    const body = await request.json();
    const treeData: Item[] = body.items;

    if (!treeData || treeData.length === 0) {
      return NextResponse.json(
        { message: "No tree data provided." },
        { status: 400 },
      );
    }

    // 2. 変換処理の実行 (ワーカーが実行すべき処理をここで実行し flatData を生成)
    const flatData = treeToFlat(treeData);

    // 3. ★ 受信/変換後のデータを指定パスに保存する処理 ★
    const jsonContent = JSON.stringify(flatData, null, 2); // 整形してJSON文字列化

    // Node.jsのwriteFile関数でデータをファイルに書き込む
    await writeFile(TARGET_PATH, jsonContent);

    // 4. ジョブキューへの登録シミュレーション
    // production code: await jobQueue.add('saveToDB', flatData);

    console.log(`[API Route] Data saved successfully to: ${TARGET_PATH}`);

    // クライアントに成功を返す
    return NextResponse.json({
      message: "Data successfully saved to file and job registered.",
    });
  } catch (error) {
    console.error("API processing error or File writing failed:", error);
    // ファイル書き込みエラーもここでキャッチされる
    return NextResponse.json(
      { message: "Internal server error. (Check file path and permissions)" },
      { status: 500 },
    );
  }
}
