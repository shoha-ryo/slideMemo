"use client";

import React, { useState, useEffect } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// --- 型定義と管理ロジック ---
export type ToastType = "success" | "error" | "info";
interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

let toastCount = 0;
let setExternalToasts: React.Dispatch<React.SetStateAction<ToastItem[]>>;

export const showToast = (
  type: ToastType,
  title: string,
  description?: string,
) => {
  const id = String(toastCount++);
  if (setExternalToasts) {
    setExternalToasts((prev) => [...prev, { id, title, description, type }]);
  }
};

export function CustomToaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // レンダリング完了後に実行する
  useEffect(() => {
    setExternalToasts = setToasts; // 外部変数を更新するのはレンダリング完了後にすること！
    return () => {
      setExternalToasts = () => {}; // 不要になったらクリーンアップ
    };
  }, []);

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map(({ id, title, description, type }) => {
        const gradientMap = {
          success: "linear-gradient(135deg, #10b981, #ffeb66)",
          error: "linear-gradient(135deg, #f43f5e, #8b5cf6)",
          info: "linear-gradient(135deg, #0ea5e9, #2dd4bf)",
        };

        return (
          <ToastPrimitive.Root
            key={id}
            duration={5000}
            onOpenChange={(open) => {
              if (!open) {
                setTimeout(() => {
                  setToasts((prev) => prev.filter((t) => t.id !== id));
                }, 500); // アニメーションを待ってから配列を掃除
              }
            }}
            className={cn(
              "relative flex items-center gap-4 p-3 min-w-[250px] outline-none overflow-visible",
              "transition-all duration-300 ease-out",
              "custom-toast-animation",
            )}
            style={
              {
                isolation: "isolate",
                "--current-gradient": gradientMap[type],
              } as React.CSSProperties
            }
          >
            {/* 層1：背後のグラデーション */}
            <div
              className="absolute inset-0 z-[-2] rounded-sm opacity-80 blur-[5px]"
              style={{ background: "var(--current-gradient)" }}
            />
            {/* 層2：本体背景＋テキスト */}
            <div className="absolute inset-0 z-[-1] rounded-md bg-background shadow-xl" />

            <div className="shrink-0">
              {type === "success" && (
                <CheckCircle2 className="w-5" color="#10b981" />
              )}
              {type === "error" && (
                <AlertCircle className="w-5" color="#ef4444" />
              )}
              {type === "info" && <Info className="w-5" color="#3b82f6" />}
            </div>

            <div className="flex-1 min-w-0">
              <ToastPrimitive.Title className="text-sm text-foreground leading-tight">
                {title}
              </ToastPrimitive.Title>
              {description && (
                <ToastPrimitive.Description className="text-xs text-muted-foreground opacity-90 line-clamp-2 mt-1">
                  {description}
                </ToastPrimitive.Description>
              )}
            </div>

            <ToastPrimitive.Close className="shrink-0 p-1 text-foreground opacity-30 hover:opacity-100 transition-opacity">
              <X size={18} />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        );
      })}

      {/* 通知の並び順や配置を制御する */}
      <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] m-6 flex flex-col gap-4 w-full max-w-[350px] outline-none overflow-visible" />
    </ToastPrimitive.Provider>
  );
}
