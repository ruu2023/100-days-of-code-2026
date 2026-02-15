// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";


export const getAuth = (env: CloudflareEnv) => {
  return betterAuth({
    database: drizzleAdapter(drizzle(env.hono_db), {
      provider: "sqlite",
      schema: schema,
    }),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  });
}

// middleware.ts で使う
export const getServerAuth = async () => {
  const { env } = await getCloudflareContext();
  return getAuth(env);
};