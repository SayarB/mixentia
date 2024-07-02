import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { PlaylistDetailed, PlaylistResponse } from "./types";
import { trackCategory } from "~/server/db/schema";
import { db } from "~/server/db";

export const SpotifyRouter = createTRPCRouter({
  getPlaylists: protectedProcedure.query(async ({ ctx }) => {
    const { user, token } = ctx.session;
    const res = await fetch("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
      },
    });
    if (res.status !== 200) {
      console.log(await res.text());
      return null;
    }
    const data: PlaylistResponse = await res.json();

    return { ...data, playlists: data.items, items: undefined };
  }),
  getPlaylistData: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const { token } = ctx.session;

      const res = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
        },
      });

      const data: PlaylistDetailed =
        res.status === 200 ? await res.json() : null;
      return data;
    }),

  createSubPlaylist: protectedProcedure
    .input(
      z.object({
        playlistId: z.string(),
        items: z
          .object({
            root: z.array(z.object({ id: z.string(), content: z.string() })),
          })
          .catchall(z.array(z.object({ id: z.string(), content: z.string() }))),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { playlistId, items } = input;
      const data: {
        userId: string;
        trackId: string;
        trackName: string;
        playlistId: string;
        categoryName: string;
      }[] = [];

      console.log("userId = ", ctx.session.user.id);

      Object.keys(items)
        .filter((k) => k !== "root")
        .forEach((key) => {
          const val = items[key];
          if (!val) return;

          data.push(
            ...val.map((v) => ({
              userId: ctx.session.user.id,
              trackId: v.id.split("-")[0] ?? "",
              trackName: v.content,
              playlistId: playlistId,
              categoryName: key,
            })),
          );
        });

      const result = await db.insert(trackCategory).values(data).execute();
      console.log("added " + result.rowsAffected + " rows");
    }),

  getPlaylistDataWithTags: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const data = await db.query.trackCategory.findMany({
        where: (cat, { and, eq }) =>
          and(eq(cat.userId, ctx.session.user.id), eq(cat.playlistId, id)),
      });
      return data;
    }),
});
