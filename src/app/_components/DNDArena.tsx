"use client"
import React, { useState } from 'react';

import { Announcements, DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import SortableItem from './SortableItem';
import DNDContainer from './DNDContainer';
type Props = { items: Item[] }
type Item = { id: string; content: string }


const DNDArena: React.FC<Props> = ({ items }) => {

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );
    const [itemsState, setItemsState] = useState<{ root: Item[], [x: string]: Item[] }>({ root: items, pop: [], rock: [] })
    const [activeId, setActiveId] = useState<string | null>(null);
    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}>
            <div className='grid gap-2 grid-cols-3'>
                {Object.keys(itemsState).map((key) => (
                    <DNDContainer id={key} items={itemsState[key] ?? []} />
                ))}
            </div>
            <DragOverlay>{activeId ? <SortableItem item={items.find(item => item.id === activeId) ?? { id: "", content: "" }} /> : null}</DragOverlay>
        </DndContext>
    );


    function findContainer(id: string) {
        if (id in itemsState) {
            return id;
        }

        return Object.keys(itemsState).find((key: string) => itemsState[key]!.findIndex(item => item.id === id) > -1);
    }

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        const { id } = active;
        console.log(id)
        setActiveId(id as string);
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;
        const draggingRect = active.rect
        if (!over) return
        console.log("over", active.rect, over.rect)
        const { id } = active;
        const { id: overId } = over;

        // Find the containers
        const activeContainer = findContainer(id as string);
        const overContainer = findContainer(overId as string);

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer === overContainer
        ) {
            return;
        }

        setItemsState((prev) => {
            const activeItems = prev[activeContainer];
            const overItems = prev[overContainer];


            if (!overItems) return prev;
            if (!activeItems) return prev;

            // Find the indexes for the items
            const activeIndex = activeItems.findIndex((item) => item.id === id);
            const overIndex = overItems.findIndex((item) => item.id === overId);

            let newIndex;

            if (overId in prev) {
                // We're at the root droppable of a container
                newIndex = overItems.length + 1;
            } else {
                const isBelowLastItem =
                    over &&
                    overIndex === overItems.length - 1 &&
                    draggingRect.current.initial!.top > over.rect.top + over.rect.height;
                const modifier = isBelowLastItem ? 1 : 0;

                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }


            return {
                ...prev,
                [activeContainer]: [
                    ...activeItems.filter((item) => item.id !== active.id)
                ],
                [overContainer]: [
                    ...overItems!.slice(0, newIndex),
                    activeItems[activeIndex] as Item,
                    ...overItems.slice(newIndex, overItems.length)
                ]
            };
        });
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over) return
        console.log("end", active.id, over.id)
        const { id } = active;
        const { id: overId } = over;

        const activeContainer = findContainer(id as string);
        const overContainer = findContainer(overId as string);
        console.log("end", active.id, over.id, activeContainer, overContainer)

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer !== overContainer
        ) {
            return;
        }
        const activeItems = itemsState[activeContainer];
        const overItems = itemsState[overContainer];
        if (!activeItems || !overItems) return;

        const activeIndex = activeItems.findIndex((item) => item.id === active.id);
        const overIndex = overItems.findIndex((item) => item.id === overId);

        if (activeIndex !== overIndex) {
            setItemsState((items) => ({
                ...items,
                [overContainer]: arrayMove(overItems, activeIndex, overIndex)
            }));
        }

        setActiveId(null);
    }
}


export default DNDArena;