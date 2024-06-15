import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import PlaylistButton from "./_components/PlaylistButton";

export default async function Home() {
  const session = await getServerAuthSession();

  return <div className="w-[100vw] min-h-[100vh]">
    
  </div>


}