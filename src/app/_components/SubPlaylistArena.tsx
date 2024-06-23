import { PlaylistTrack } from '~/server/api/routers/types';
import DNDArena from './DNDArena';

type Props = {
    tracks: PlaylistTrack[];
}
const SubPlaylistArena: React.FC<Props> = ({ tracks }) => {
    const items = tracks.map((track) => ({
        id: track.track.id,
        content: track.track.name,
    }));

    return (
        <div className='block'>
            <DNDArena items={items} />
        </div>
    );
}


export default SubPlaylistArena;