import React, { useState } from "react"; // useStateを追加
import { LabelType } from "../../../store/taskStore/types/TasksType";
import { DraggableLabel } from "./Label";
import { Plus, X } from "lucide-react";
import { CreateLabelModal } from "./CreateLabelModal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  labels: Record<string, LabelType>;
};

export const LabelSidebar = ({ isOpen, onClose, labels }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // モーダル管理用のステート

  return (
    <>
      <aside
        className={`
          relative
					border-r border-border/10 shadow-2xl
					bg-sidebar text-sidebar-accent-foreground
          transition-all duration-300 ease-in-out overflow-hidden shrink-0
        `}
        style={{
          width: isOpen ? "288px" : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="w-72 h-full flex flex-col">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-5 border-b border-border/5">
            <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">
              Label Master
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-sidebar-primary-foreground/5 rounded-md hover:text-sidebar-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* ラベルリストエリア */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="flex flex-col gap-2">
              {Object.values(labels).map((label) => (
                <DraggableLabel key={label.id} label={label} cardId="master" />
              ))}
              {Object.values(labels).length === 0 && (
                <p className="text-center text-gray-600 text-xs py-10">
                  まだラベルが作成されていません。
                </p>
              )}
            </div>
          </div>

          {/* ボトム：追加ボタン */}
          <div className="p-4 border-t border-sidebar-border">
            <button
              onClick={() => setIsModalOpen(true)} // ここでモーダルを開く
              className="
								group flex items-center justify-center gap-2
								p-3 w-full
								rounded-xl border-2 border-dashed border-white/10
								text-sidebar-primary-foreground bg-sidebar-primary
								hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-blue-400
								transition-all active:scale-[0.98]"
            >
              <Plus
                size={16}
                className="group-hover:rotate-90 transition-transform"
              />
              <span
								className="text-sm font-medium pr-4"
							>ラベルを作成</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ラベル作成モーダル */}
      <CreateLabelModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};