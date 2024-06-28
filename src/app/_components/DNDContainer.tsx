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
    title: string;
    onTitleChange?: (title: string) => void
}
const DNDContainer: React.FC<Props> = ({ id, items, title, className, onTitleChange }) => {

    const { setNodeRef } = useDroppable({
        id
    });
    const [edit, setEdit] = React.useState(false)
    const [titleState, setTitleState] = React.useState(title)
    const changeEdit = () => {
        setEdit(true)
    }

    const changeTitleState = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitleState(e.target.value)
    }

    const onSubmit = () => {
        setEdit(false)
        if (onTitleChange) onTitleChange(titleState)
    }

    return (
        <SortableContext
            id={id}
            items={items}
            strategy={verticalListSortingStrategy}
        >
            <div className="m-2 h-full flex flex-col">
                <div className="text-black">
                    {edit ? <div className="flex">
                        <input type="text" value={titleState} onChange={changeTitleState} className="flex-1" />
                        <button onClick={onSubmit}>submit</button>
                    </div>
                        :
                        <h2 onClick={changeEdit}>{titleState}</h2>}
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