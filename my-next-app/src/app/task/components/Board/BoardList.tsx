'use client';

import { SortableContext } from "@dnd-kit/sortable";
import BoardCreateButton from "./BoardCreateButton";
import Board from "./Board";
import { useItemStore } from "../../ItemStore";

function itemList({}) {

	const {items} = useItemStore();

  return (

      <SortableContext items={items}>
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
          {items.map((item) => (
            <Board key={item.id} selfItem={item} {...item} />
          ))}
					<BoardCreateButton/>
        </div>
      </SortableContext>
  );
}

export default itemList;