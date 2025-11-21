import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom", // ブラウザ環境をシミュレート
    globals: true, // グローバル変数を有効化 (describe, it, expect など)
    setupFiles: ["./vitest.setup.ts"], // テスト前に実行するセットアップファイル
  },
});
