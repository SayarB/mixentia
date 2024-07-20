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
    }),

  getPlaylistDataWithTags: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const data = await db.query.trackCategory.findMany({
        where: (cat, { and, eq }) =>
          and(eq(cat.userId, ctx.session.user.id), eq(cat.playlistId, id)),
      });
      const tags: string[] = [];
      data.forEach((d) => {
        if (!tags.includes(d.categoryName)) tags.push(d.categoryName);
      });
      return { data, tags };
    }),
  playTrack: protectedProcedure
    .input(z.object({ trackIds: z.string().array(), playlistId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { trackIds, playlistId } = input;

      if (trackIds.length === 0) {
        const res = await fetch(`https://api.spotify.com/v1/me/player/play`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${ctx.session.token.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            context_uri: `spotify:playlist:${playlistId}`,
          }),
        });

        return res.status === 204;
      } else {
        const res = await fetch(`https://api.spotify.com/v1/me/player/play`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${ctx.session.token.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: trackIds.map((id) => `spotify:track:${id}`),
          }),
        });

        return res.status === 204;
      }
    }),
});
