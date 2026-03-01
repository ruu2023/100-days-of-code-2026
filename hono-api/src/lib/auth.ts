// src/lib/auth.ts
// Workers-native version: does NOT use @opennextjs/cloudflare getCloudflareContext()
// Instead, `env` is passed directly from the Hono context bindings.
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";

export type Env = {
  hono_db: D1Database;
  ANIME_STORAGE: R2Bucket;
  anime_storage: R2Bucket;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL?: string;
  REQUESTY_API_KEY: string;
  GEMINI_API_KEY?: string;
};

export const getAuth = (env: Env) => {
  return betterAuth({
    database: drizzleAdapter(drizzle(env.hono_db), {
      provider: "sqlite",
      schema: schema,
    }),
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL ?? "http://localhost:8787",
    trustedOrigins: [
      "http://localhost:3000",
      "https://hono-next-app-455056438426.asia-northeast1.run.app",
    ],
  });
};
