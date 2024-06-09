import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Home() {
  const hello = await api.spotify.hello({ text: "from tRPC" });
  const session = await getServerAuthSession();
  if (session) {
    const data = await api.spotify.getPlaylists()

    return <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      {data ? data.playlists.map((playlist) => (<li>{playlist.name} - {playlist.owner.display_name}</li>)) : 'No playlists'}
    </main>
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      {<Link href={'/api/auth/signin'}>Sign in</Link>}
    </main>
  );
}