// import type { Context, Next } from "hono";
// import { getAuth } from "@/lib/auth";

// export const authMiddleware = async (
//   ctx: Context,
//   next: Next,
// ) => {
//   try {
//     const auth = getAuth(ctx.env);
//     const session = await auth.api.getSession({
//       headers: ctx.req.raw.headers,
//     });
//     if (!session?.user) {
//       return ctx.json({ error: "unauthorized" }, 401);
//     }

//     const userId = session.user.id;
//     ctx.set("userId", userId);
//     await next();
//   } catch (e) {
//     console.error("auth middleware error:", e);
//     return ctx.json({ error: "unauthorized" }, 401);
//   }
// };