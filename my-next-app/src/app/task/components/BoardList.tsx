'use client';

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DndContext } from "@dnd-kit/core";

import Board from "./Board";

function BoardList({ boards }) {
  return (

      <SortableContext items={boards}>
        <div style={{ gap: 12 }}>
          {boards.map((board) => (
            <Board key={board.id} {...board} />
          ))}
        </div>
      </SortableContext>
  );
}

export default BoardList;