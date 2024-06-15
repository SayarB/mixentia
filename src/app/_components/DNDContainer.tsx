import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";

import SortableItem from "./SortableItem"

type Props = {
    id: string;
    items: { id: string, content: string }[];
}
const DNDContainer: React.FC<Props> = ({ id, items }) => {

    const { setNodeRef } = useDroppable({
        id
    });

    return (
        <SortableContext
            id={id}
            items={items}
            strategy={verticalListSortingStrategy}
        >
            <div ref={setNodeRef} className='bg-slate-400 m-2 w-[300px] h-[400px] overflow-scroll' >
                {items.map((item) => (
                    <SortableItem key={item.id} item={item} />
                ))}
            </div>
        </SortableContext >
    );
}

export default DNDContainer;