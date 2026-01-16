"use client";

import { Tag, LayoutDashboard, Settings, User, Sparkles, SwatchBook } from "lucide-react";

export type SidebarType = 'label' | 'theme' | 'settings' | null;
type Props = {
	activeSidebar: SidebarType;
	onToggle: (type: SidebarType) => void;
};

export const SideToolBar = ({ // >> AppContent
	activeSidebar, onToggle
}: Props) => {

  return (
    <nav className="
			w-16 h-full flex flex-col items-center py-4 shrink-0
			bg-sidebar border-r border-sidebar-border">
      {/* メニュー項目 */}
      <div className="flex flex-col gap-4 flex-1">
        {/* ラベルマスター */}
        <ToolButton
          icon={<Tag size={22} />}
          active={activeSidebar === "label"}
          onClick={() => onToggle("label")}
          label="ラベル"
        />
				{/* ラベル切り替えボタン */}
        <ToolButton
          icon={<SwatchBook size={22} />}
          active={activeSidebar === "theme"}
          onClick={() => onToggle("theme")}
          label="テーマ"
        />

      </div>

      {/* ボトム項目 */}
      <div className="mt-auto">
        <ToolButton icon={<Settings size={22} />} label="Settings" />
      </div>
    </nav>
  );
};

// ツールチップ付きのボタン（共通パーツ）
const ToolButton = ({
  icon,
  active,
  onClick,
  label,
}: {
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  label: string;
}) => (
  <button
    onClick={onClick}
    title={label}
    className={`
      p-3 rounded-xl transition-all duration-200 group relative
      ${
        active
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      }
    `}
  >
    {icon}
    {/* シンプルなツールチップ（お好みで） */}
    <span className="absolute left-14 scale-0 group-hover:scale-100 transition-all origin-left bg-popover text-popover-foreground text-xs px-2 py-1 rounded border border-border whitespace-nowrap z-50">
      {label}
    </span>
  </button>
);
