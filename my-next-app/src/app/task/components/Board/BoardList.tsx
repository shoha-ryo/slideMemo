"use client";

import { useState } from "react";
import { useShallow } from "zustand/shallow";
import { SortableContext } from "@dnd-kit/sortable";
import { useTaskStore } from "../../store/taskStore/taskStore";
import Board from "./Board";
import { Button } from "@/components/ui/button";
import DraftTask from "../Card/DraftTask";

import { SkeletonCard } from "./BoardSkeleton";

function BoardList({}) {
  const { boardOrder, boards, syncStatus } = useTaskStore(
    useShallow((state) => ({
      boardOrder: state.boardOrder,
      boards: state.boards,
      syncStatus: state.syncStatus,
    })),
  );

  const [isDrafting, setIsDrafting] = useState(false);

  // 1. スケルトンを表示する条件の定義
  const showSkeleton = boardOrder.length === 0 && syncStatus !== "synced";
  // const showSkeleton = false

  return (
    <SortableContext items={boardOrder}>
      <div className="h-full flex items-start gap-3 p-5 shrink-0">
        {showSkeleton ? (
          /* スケルトン表示モード */
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          /* 通常表示モード（ボード ＋ 追加ボタン） */
          <>
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
                }}
                className="mt-2 mr-2 h-8 w-40 rounded-full bg-board text-board-foreground hover:bg-board-foreground/20"
              >
                ＋ボードを追加
              </Button>
            )}
          </>
        )}
        <div className="pr-100 pb-10" />
      </div>
    </SortableContext>
  );
}

export default BoardList;
