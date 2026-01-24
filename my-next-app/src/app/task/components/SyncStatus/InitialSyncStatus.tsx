import { useEffect, useState } from "react";
import { RefreshCcw, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { TaskStore } from "../../store/taskStore/types/TasksType";

type SyncStatus = TaskStore["syncStatus"];

type Props = {
  status: SyncStatus;
};

export const SyncStatusBadge = ({ status }: Props) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (status === "synced") {
      const timer = setTimeout(() => {
        setIsExiting(true); // 1.5秒後に消えるアニメーションを開始
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const config = {
    initializing: {
      icon: <Loader2 size={14} className="animate-spin" />,
      text: "初期化中...",
      className: "text-foreground bg-background",
    },
    syncing: {
      icon: <RefreshCcw size={14} className="animate-spin" />,
      text: (
        <span className="flex items-center">
          サーバー同期中
          <span className="flex ml-0.5">
            <span
              className="animate-bounce-subtle"
              style={{ animationDelay: "0ms" }}
            >
              .
            </span>
            <span
              className="animate-bounce-subtle"
              style={{ animationDelay: "200ms" }}
            >
              .
            </span>
            <span
              className="animate-bounce-subtle"
              style={{ animationDelay: "400ms" }}
            >
              .
            </span>
          </span>
        </span>
      ),
      className: "text-foreground bg-background",
    },
    synced: {
      icon: <CheckCircle2 size={14} />,
      text: "同期完了",
      className: "text-foreground bg-background",
    },
    failed: {
      icon: <AlertCircle size={14} />,
      text: "サーバー同期失敗",
      className: "text-foreground bg-background",
    },
  };

  const { icon, text, className } = config[status];

  return (
    <>
      <style>{`
        @keyframes bounce-subtle {
          0%, 40%, 100% { transform: translateY(0); }
          15% { transform: translateY(-3px); }
        }
        .animate-bounce-subtle {
          display: inline-block;
          animation: bounce-subtle 1.5s infinite;
        }

        @keyframes finish-and-slide-up {
          0% { transform: translateY(0); opacity: 1; }
          20% { transform: translateY(3px); opacity: 1; } /* 一瞬沈む */
          100% { transform: translateY(-100px); opacity: 1; } /* 上に飛ぶ */
        }
        .animate-finish-exit {
          animation: finish-and-slide-up 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>

      {/* isExiting が true の時だけアニメーションを適用 */}
      <div
        className={
          isExiting ? "animate-finish-exit" : "opacity-100 translate-y-0"
        }
      >
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs w-40 font-medium transition-colors ${className}`}
        >
          {icon}
          <div className="whitespace-nowrap">{text}</div>
        </div>
      </div>
    </>
  );
};
