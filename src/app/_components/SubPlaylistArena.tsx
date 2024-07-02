import { PlaylistTrack } from '~/server/api/routers/types';
import DNDArena from './DNDArena';
import { api } from '~/trpc/server';

type Item = { id: string; content: string }
type Props = {
    tracks: PlaylistTrack[];
    playlistId: string;
}

const SubPlaylistArena: React.FC<Props> = async ({ tracks, playlistId }) => {

    const taggedItems = await api.spotify.getPlaylistDataWithTags({ id: playlistId })

    const taggedItemsIds = taggedItems.map(t => t.trackId)

    const unCategorizedData = tracks.map((track, i) => ({
        id: track.track.id,
        index: i,
        content: track.track.name,
    }))

    const items: { root: Item[], [x: string]: Item[] } = {
        root: unCategorizedData.filter(t => !taggedItemsIds.includes(t.id)).map(t => ({ id: t.id + "-" + t.index, content: t.content }))
    }

    const tags = taggedItems.map(taggedItem => taggedItem.categoryName)

    tags.forEach(tag => {
        items[tag] = []
    })

    taggedItems.forEach(taggedItem => {
        items[taggedItem.categoryName]?.push({ id: taggedItem.trackId, content: taggedItem.trackName })
    })


    return (
        <div className='block' >
            <DNDArena items={unCategorizedData.map(item => ({ id: item.id + '-' + item.index, content: item.content }))} defaultState={items} playlistId={playlistId} />
        </div >
    );
}


export default SubPlaylistArena;