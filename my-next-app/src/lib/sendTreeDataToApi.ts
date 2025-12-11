import { Item } from "@/types/item"

/**
 * 変更されたツリー構造データをバックエンドAPIに送信する関数
 * @param data - 送信するツリー構造全体 (Item[] の配列)
 * @returns 成功した場合は true、失敗した場合は Error をスロー
 */
export const sendTreeDataToApi = async (data: Item[]): Promise<boolean> => {
  try {
    const response = await fetch('/api/save-tree', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // 送信するデータは、ローカルで最新のツリー構造全体です
      body: JSON.stringify({ items: data }),
    });

    if (!response.ok) {
      // API側でエラーが発生した場合（例: 500 Internal Server Error）
      throw new Error(`API save failed: ${response.status} ${response.statusText}`);
    }

    console.log("保存処理のリクエストに成功しました");
    return true;

  } catch (error) {
    console.error('保存処理に失敗しました：', error);
    // 呼び出し元でキャッチできるようにエラーを再スローします
    throw error;
  }
};