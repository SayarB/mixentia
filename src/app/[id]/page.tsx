import { api } from "~/trpc/server";

type Props = {
    params: {
        id: string;
    };
}

const PlaylistPage: React.FC<Props> = async ({ params: { id } }) => {

    const tagsData = await api.spotify.getPlaylistDataWithTags({ id });
    const playlistData = await api.spotify.getPlaylistData({ id });


    return <div>
        <h1>Playlist Page</h1>
        <ul>
            {tagsData.map(tag => <li key={tag.id}>{playlistData.tracks.items.find(({ track }) => track.id === tag.trackId)?.track.name} - {tag.categoryName}</li>)}
        </ul>
    </div>
}

export default PlaylistPage;