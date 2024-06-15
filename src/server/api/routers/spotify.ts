import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { PlaylistDetailed, PlaylistResponse } from "./types";

export const SpotifyRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
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
});
