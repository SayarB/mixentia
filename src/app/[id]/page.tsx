"use client"
import { api } from "~/trpc/react";
import TrackButton from "../_components/TrackButton";
import { useState } from "react";
import { set } from "zod";

type Props = {
    params: {
        id: string;
    };
}

const PlaylistPage: React.FC<Props> = ({ params: { id } }) => {
    const { data: tagsData } = api.spotify.getPlaylistDataWithTags.useQuery({ id });
    const { data: playlistData } = api.spotify.getPlaylistData.useQuery({ id });
    const getTagFromTrackId = (trackId: string) => {
        const track = tagsData?.data.find((track) => track.trackId === trackId);
        return track?.categoryName ?? "root";
    }
    const playTrackMutation = api.spotify.playTrack.useMutation()

    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const selectedTracks = selectedTags.flatMap(tag => tagsData?.data.filter(track => track.categoryName === tag).map(track => track.trackId) ?? [])

    const onTrackSelected = (trackId: string) => {
        playTrackMutation.mutateAsync({ trackIds: [trackId], playlistId: id });
    }

    const onPlaySelection = () => {

        const trackIds = new Set<string>(selectedTracks)

        playTrackMutation.mutateAsync({ trackIds: Array.from(trackIds), playlistId: id });

    }

    return <div>
        <h1>Playlist Page</h1>
        <button onClick={onPlaySelection} className="bg-black text-white p-2">Play Selection</button>
        {tagsData?.tags.map((tag) => <button onClick={() => {
            setSelectedTags(tags => {
                if (!tags.includes(tag)) {
                    return [...selectedTags, tag]
                }
                return tags.filter(t => t !== tag)
            })
        }} className={`mx-2 px-2 border-2 ${selectedTags.includes(tag) ? "bg-gray-400" : ""}`}>{tag}</button>)}
        <div className="m-3 max-w-[500px]">
            {playlistData?.tracks.items.filter(track => selectedTracks.includes(track.track.id) || selectedTags.length === 0).map((track, i) => {
                const tag = getTagFromTrackId(track.track.id);
                return <TrackButton onClick={() => onTrackSelected(track.track.id)} key={track.track.id}>
                    <div className="flex items-center">
                        <img className="w-[50px] h-[50px] rounded-full" src={track.track.album.images[0]?.url} />
                        <div className="flex items-center">
                            <p className="ml-3">{track.track.name}</p>
                            {(tag !== "root") && <p className="border-2 ml-2 px-2">{tag}</p>}
                        </div>
                    </div>
                </TrackButton>
            })}
        </div>

    </div >
}
export default PlaylistPage;