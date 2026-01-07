"use client";

import { useState } from "react";
import { useShallow } from "zustand/shallow";
import { SortableContext } from "@dnd-kit/sortable";
import { useTaskStore } from "../../store/taskStore/taskStore";
import Board from "./Board";
import { Button } from "@/components/ui/button";
import DraftTask from "../Card/DraftTask";

function BoardList({}) {
  // シャローコピーしないと「代入＞再レンダー＞再代入...」が無限ループする
  const { boardOrder, boards } = useTaskStore(
    useShallow((state) => ({
      boardOrder: state.boardOrder,
      boards: state.boards,
    })),
  );

  const [isDrafting, setIsDrafting] = useState(false);

  return (
    <SortableContext items={boardOrder}>
      <div className="flex flex-nowrap items-start gap-3 p-3 shrink-0 m-2">
        {boardOrder.map((boardId) => (
          <Board key={boardId} board={boards[boardId]} />
        ))}
        {isDrafting ? (
          <DraftTask
            source={{ type: "boardList", data: null }}
            onClose={() => setIsDrafting(false)}
          />
        ) : (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setIsDrafting(true);
            }} // モーダル表示をブロックする。
            className="mt-2 mr-2 h-8 w-40 rounded-full border bg-neutral-800"
          >
            ＋ボードを追加
          </Button>
        )}
      </div>
    </SortableContext>
  );
}

export default BoardList;
