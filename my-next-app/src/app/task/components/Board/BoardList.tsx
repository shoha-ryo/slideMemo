"use client";

import { useShallow } from "zustand/shallow";
import { SortableContext } from "@dnd-kit/sortable";
import BoardCreateButton from "./BoardCreateButton";
import Board from "./Board";
import { useTaskStore } from "../../store/taskStore/taskStore";

function BoardList({}) {
	// シャローコピーしないと「代入＞再レンダー＞再代入...」が無限ループする
  const { boardOrder, boards } = useTaskStore(
		useShallow((state) => ({
			boardOrder: state.boardOrder,
			boards: state.boards
	})));

  return (
    <SortableContext items={boardOrder}>
      <div
        style={{
          display: "inline-flex",
          // background: "#bbb",
          padding: 12,
          margin: 20,
          borderRadius: 8,
          gap: 12,
          flexShrink: 0,
          // outline: '1px solid #ccc',
        }}
      >
        {boardOrder.map((boardId) => (
          <Board key={boardId} board={boards[boardId]} />
        ))}
        <BoardCreateButton />
      </div>
    </SortableContext>
  );
}

export default BoardList;
