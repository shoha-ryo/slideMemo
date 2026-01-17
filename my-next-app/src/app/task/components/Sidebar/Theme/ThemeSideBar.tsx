import { useState, useEffect } from "react"; // useStateを追加
import { SidebarType } from "../SaidToolMenu";
import { useTheme } from "next-themes";
import { Check, X } from "lucide-react";

// サンプル
export const themes = [
  { id: "light", name: "Light", primary: "#3b82f6", bg: "#ffffff" },
  { id: "dark", name: "Dark", primary: "#3b82f6", bg: "#09090b" },
  { id: "rose", name: "Rose", primary: "#e11d48", bg: "#fff1f2" },
  { id: "ocean", name: "Ocean", primary: "#0ea5e9", bg: "#f0f9ff" },
  { id: "zinc", name: "Zinc", primary: "#18181b", bg: "#f4f4f5" },
];

type Props = {
  activeSidebar: SidebarType;
  onToggle: (type: SidebarType) => void;
};

export const ThemeSidebar = ({ onToggle }: Props) => {
  const { theme: currentTheme, setTheme } = useTheme();

  // ハイドレーション対策としてマウントされるまで描画しない
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // ハイドレーションエラーを防ぐためのガード
  if (!mounted) {
    // null ではなく、ガタつき防止のために同じ幅の空の div を返すとより良いです
    return <div className="w-[280px] h-full bg-sidebar shrink-0" />;
  }

  return (
    <>
      <div className="w-72 h-full flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-5 border-b border-border/5">
          <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">
            Theme
          </h2>
          <button
            onClick={() => onToggle("theme")}
            className="p-1 hover:bg-sidebar-primary-foreground/5 rounded-md hover:text-sidebar-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* テーマリスト */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`
									w-full group relative flex items-center gap-3 p-3 rounded-xl border transition-all
									${
                    currentTheme === t.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border/50 hover:border-border bg-card/50 hover:bg-card"
                  }
								`}
            >
              {/* プレビューアイコン */}
              <div
                className="h-10 w-10 rounded-lg shrink-0 flex items-center justify-center shadow-inner"
                style={{ backgroundColor: t.bg }}
              >
                <div
                  className="h-4 w-4 rounded-full shadow-sm"
                  style={{ backgroundColor: t.primary }}
                />
              </div>

              {/* ラベル */}
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase">
                  {t.id}
                </p>
              </div>

              {/* 選択中マーク */}
              {currentTheme === t.id && (
                <Check size={16} className="text-primary" />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
