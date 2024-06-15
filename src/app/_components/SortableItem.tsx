import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TrackListItem from './TrackListItem';
type Props = {
    item: { id: string; content: string };
};
const SortableItem: React.FC<Props> = ({ item }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TrackListItem item={item} />
        </div>
    );
}

export default SortableItem;