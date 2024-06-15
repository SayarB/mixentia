import { api } from "~/trpc/server";
import PlaylistButton from "../_components/PlaylistButton";
import { getServerAuthSession } from "~/server/auth";

const SubPlaylistSelect: React.FC = async () => {
    const session = await getServerAuthSession();
    if (session) {
        const data = await api.spotify.getPlaylists()

        return <main className="flex items-center justify-center min-h-screen">
            <div className="h-[80vh] min-h-[500px] overflow-scroll m-5 flex flex-col items-center w-[100%] sm:w-[400px]">
                {data?.playlists.map((playlist, i) => (<PlaylistButton path={`/sub-playlist/${playlist.id}`} key={playlist.id}>
                    <div className="flex items-center">
                        <img className="w-[50px] h-[50px] rounded-full" src={playlist.images[0]?.url} />
                        <p className="ml-3">{playlist.name}</p>
                    </div>
                </PlaylistButton>))}
            </div>
            <div></div>
        </main>
    }
}

export default SubPlaylistSelect;