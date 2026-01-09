import React, { useState } from 'react';
import { useTaskStore } from '@/app/task/store/taskStore/taskStore';

const presetColors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#a855f7', '#71717a'];

export const CreateLabelModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');

	const { createLabel } = useTaskStore.getState()

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100">
      <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
        <h2 className="text-xl font-bold mb-4">新規ラベル追加</h2>

        {/* プレビュー */}
        <div className="mb-6 flex justify-center">
          <span 
            className="px-3 py-1 rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: color }}
          >
            {name || 'ラベルプレビュー'}
          </span>
        </div>

        {/* ラベル名入力 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">ラベル名称</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 重要"
          />
        </div>

        {/* カラー選択 */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">ラベルカラー</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {presetColors.map((c) => (
              <button
                key={c}
                className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-black' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
            {/* カラーピッカー呼び出し */}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded-full cursor-pointer overflow-hidden border border-gray-300"
            />
          </div>
          <p className="text-xs text-gray-500">16進数: <span className="font-mono uppercase">{color}</span></p>
        </div>

        {/* アクションボタン */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">キャンセル</button>
          <button
            onClick={() => createLabel( name, color )}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            保存する
          </button>
        </div>
      </div>
    </div>
  );
};