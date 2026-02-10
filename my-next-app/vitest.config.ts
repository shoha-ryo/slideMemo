import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom", // ブラウザ環境をシミュレート
    globals: true, // グローバル変数を有効化 (describe, it, expect など)
    setupFiles: ["./vitest.setup.ts"], // テスト前に実行するセットアップファイル
    coverage: {
      provider: "v8",
      all: false, // これを追加
      exclude: [
        "**/node_modules/**",
        "**/components/ui/**", // ライブラリのUIはテストしない
        "next.config.ts",
        "**/*.d.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
