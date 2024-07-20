import SubPlaylistArena from "~/app/_components/SubPlaylistArena";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

type Props = {
    params: {
        id: string;
    };
}
const SubPlaylistPage: React.FC<Props> = async ({ params: { id } }) => {
    const session = await getServerAuthSession();

    const playlistData = await api.spotify.getPlaylistData({ id });

    if (session && playlistData) {
        return <main>
            <div>
                <SubPlaylistArena tracks={playlistData.tracks.items} playlistId={id} />
            </div>
        </main>
    }
}

export default SubPlaylistPage;