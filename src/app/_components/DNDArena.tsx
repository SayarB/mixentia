"use client"
import React, { useState } from 'react';

import { Announcements, DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import SortableItem from './SortableItem';
import DNDContainer from './DNDContainer';
import { api } from '~/trpc/react';
type Props = { defaultState: { root: Item[], [x: string]: Item[] }, items: Item[], playlistId: string }
type Item = { id: string; content: string }


const DNDArena: React.FC<Props> = ({ playlistId, items, defaultState }) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const subPlaylistMutation = api.spotify.createSubPlaylist.useMutation()


    const [itemsState, setItemsState] = useState<{ root: Item[], [x: string]: Item[] }>(defaultState)
    const [activeId, setActiveId] = useState<string | null>(null);

    const [activeContainer, setActiveContainer] = useState<string | null>(null)



    const handleAddCategory = () => {
        if (Object.keys(itemsState).length > 4) return
        let catName = "cat 1"
        for (let i = 1; i <= 4; i++) {
            catName = `cat ${i}`
            if (!Object.keys(itemsState).includes(catName)) break
        }


        setItemsState(is => {
            const arr = { ...is }
            arr[catName] = []
            return arr
        })
    }


    const onTitleChange = (key: string, title: string) => {

        setItemsState((prev) => {

            const arr: { root: Item[], [x: string]: Item[] } = { root: prev.root }
            Object.keys(prev).forEach(k => {
                const val = prev[k]
                if (val === undefined) return
                if (k === key) {
                    arr[title] = [...val]
                } else {
                    arr[k] = [...val]
                }
            })

            return arr
        })
    }

    const handleSubmit = async () => {
        await subPlaylistMutation.mutateAsync({ playlistId, items: itemsState })
    }

    return (
        <div className='flex flex-col h-[85vh] mt-[50px]'>
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}>
                <div className='max-w-[1200px] h-[100%] mx-auto flex items-center justify-center'>
                    <div className="flex items-center justify-center h-[98%] ">
                        <DNDContainer id={'root'} items={itemsState.root} title='Root' className='bg-slate-400 w-[300px] h-[100%] overflow-scroll ' />
                        <div className='h-full'>
                            <div className='grid gap-2 grid-cols-2 grid-rows-2 h-full w-full'>
                                {Object.keys(itemsState).filter(k => k !== "root").map((key) => (
                                    <DNDContainer id={key} key={key} items={itemsState[key] ?? []} title={key} onTitleChange={(title) => {
                                        onTitleChange(key, title)
                                    }} className={`bg-gray-200 border${activeContainer === key ? '-2' : ''} border-gray-400 w-[300px] h-full overflow-scroll`} />
                                ))}
                                {Object.keys(itemsState).length <= 4 && <button onClick={handleAddCategory}>Add</button>}
                            </div>
                        </div>
                    </div>
                </div>
                <DragOverlay>{activeId ? <SortableItem item={items.find(item => item.id === activeId) ?? { id: "", content: "" }} /> : null}</DragOverlay>
            </DndContext>
            <div className='w-full flex items-center justify-center'>
                <button onClick={handleSubmit}>Submit</button>
            </div>
        </div>
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

        setActiveId(id as string);
    }

    function handleDragOver(event: DragOverEvent) {
        const { over } = event
        setActiveContainer(over?.id as string)
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        const draggingRect = active.rect
        if (!over) return

        const { id } = active;
        const { id: overId } = over;

        // Find the containers
        const activeContainer = findContainer(id as string);
        const overContainer = findContainer(overId as string);

        if (!activeContainer || !overContainer) return


        const activeItems = itemsState[activeContainer];
        const overItems = itemsState[overContainer];

        if (!activeItems || !overItems) return

        if (
            activeContainer === overContainer
        ) {
            const activeIndex = activeItems.findIndex((item) => item.id === active.id);
            const overIndex = overItems.findIndex((item) => item.id === overId);

            if (activeIndex !== overIndex) {
                setItemsState((items) => ({
                    ...items,
                    [overContainer]: arrayMove(overItems, activeIndex, overIndex)
                }));
            }

            setActiveId(null);
        } else {


            setItemsState((prev) => {

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
                        ...overItems.slice(0, newIndex),
                        activeItems[activeIndex]!,
                        ...overItems.slice(newIndex, overItems.length)
                    ]
                };
            });

        }


    }
}


export default DNDArena;