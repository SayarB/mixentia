import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import DiscordProvider from "next-auth/providers/discord";
import Spotify from "next-auth/providers/spotify";

import { env } from "~/env";
import { db } from "~/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "~/server/db/schema";
import { JWT } from "next-auth/jwt";
/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    token: {
      accessToken: string;
      refreshToken: string;
    };
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: "secret",
  callbacks: {
    session: async ({ session, token }) => {
      return {
        ...session,
        token: {
          id: token.id,
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
        },
        user: {
          ...session.user,
          id: token.userId,
        },
      };
    },
    jwt: async ({ token, account, user }) => {
      const updatedToken: JWT & {
        id?: string;
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpires?: number;
        userId?: string;
      } = { ...token };

      if (account && user) {
        updatedToken.accessToken = account.access_token || "";
        updatedToken.refreshToken = account.refresh_token || "";
        updatedToken.accessTokenExpires = account.expires_at || Date.now();
        updatedToken.userId = user.id;
        updatedToken.id = account.providerAccountId || "";
      }
      if (Date.now() < (updatedToken.accessTokenExpires || 0)) {
        return updatedToken;
      }
      updatedToken.accessToken = await refreshedToken(updatedToken);
      return updatedToken;
    },
  },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as Adapter,
  providers: [
    Spotify({
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
    }),

    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);

async function refreshedToken(
  updatedToken: JWT & {
    id?: string | undefined;
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
    accessTokenExpires?: number | undefined;
  },
): Promise<string> {
  const spotifyClientID = env.SPOTIFY_CLIENT_ID;
  const spotifyClientSecret = env.SPOTIFY_CLIENT_SECRET;
  if (updatedToken.refreshToken) {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + btoa(`${spotifyClientID}:${spotifyClientSecret}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: updatedToken.refreshToken || "",
      }),
    });
    const { access_token: accessToken } = await response.json();
    return accessToken;
  } else {
    return updatedToken.accessToken || "";
  }
}
