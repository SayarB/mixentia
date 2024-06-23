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
    className?: string;
    title: string
}
const DNDContainer: React.FC<Props> = ({ id, items, title, className }) => {

    const { setNodeRef } = useDroppable({
        id
    });

    return (
        <SortableContext
            id={id}
            items={items}
            strategy={verticalListSortingStrategy}
        >
            <div className="m-2 h-full flex flex-col">
                <div className="text-black">
                    <h2>{title}</h2>
                </div>
                <div ref={setNodeRef} className={className + " flex-1"} >
                    {items.map((item) => (
                        <SortableItem key={item.id} item={item} />
                    ))}
                </div>
            </div>
        </SortableContext >
    );
}

export default DNDContainer;