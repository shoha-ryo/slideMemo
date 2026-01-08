import { LabelType } from "../../store/taskStore/types/TasksType";
import { DraggableLabel } from "../Label/Label"; // 作成済みのもの
import { Plus, X } from "lucide-react"; // アイコンライブラリ

type Props = {
  isOpen: boolean;
  onClose: () => void;
  labels: Record<string, LabelType>; // Storeから渡すか、コンポーネント内で参照
};

export const LabelSidebar = ({ isOpen, onClose, labels }: Props) => {
  return (
    <>
      {/* サイドバー本体 */}
      <aside
        className={`
					relative bg-[#1a1a1a] border-r border-white/10 shadow-2xl
					transition-all duration-300 ease-in-out overflow-hidden shrink-0
				`}
        style={{
          width: isOpen ? "288px" : "0px", // widthを直接変えることで隣を押し出す
          opacity: isOpen ? 1 : 0, // 閉じている時は透明にする
          height: "calc(100vh - 65px)",
        }}
      >
        <div className="w-72 h-full flex flex-col">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">
              Label Master
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/5 rounded-md text-gray-500 hover:text-white transition-colors"
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
                  No labels created yet.
                </p>
              )}
            </div>
          </div>

          {/* ボトム：追加ボタン */}
          <div className="p-4 border-t border-white/5 bg-[#1e1e1e]">
            <button
              onClick={() => {
                /* ラベル作成モーダルを開く処理 */
              }}
              className="group flex items-center justify-center gap-2 p-3 w-full rounded-xl border-2 border-dashed border-white/10 text-gray-500 hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-blue-400 transition-all active:scale-[0.98]"
            >
              <Plus
                size={16}
                className="group-hover:rotate-90 transition-transform"
              />
              <span className="text-sm font-medium">Create New Label</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
