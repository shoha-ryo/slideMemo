'use client';

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DndContext } from "@dnd-kit/core";

import Board from "./Board";

function BoardList({ boards }) {
  return (

      <SortableContext items={boards}>
        <div
					style={{
						display: "inline-flex",
						background: "#bbb",
						padding: 12,
						margin: 20,
						borderRadius: 8,
						gap: 12,
						flexShrink: 0,
						outline: '1px solid #ccc',
					}}
				>
          {boards.map((board) => (
            <Board key={board.id} {...board} />
          ))}
        </div>
      </SortableContext>
  );
}

export default BoardList;