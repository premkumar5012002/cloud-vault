import superjson from "superjson";
import * as context from "next/headers";
import { TRPCError, initTRPC } from "@trpc/server";

import { auth } from "@/lib/auth/lucia";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return { ...opts };
};

const t = initTRPC
  .context<typeof createTRPCContext>()
  .create({ transformer: superjson });

export const router = t.router;

export const publicProcedure = t.procedure;

export const privateProcedure = t.procedure.use(async ({ next, ctx }) => {
  const authRequest = auth.handleRequest(
    ctx.headers.get("method") ?? "GET",
    context
  );

  const session = await authRequest.validate();

  if (session === null) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (session.user.isVerified === false) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return next({ ctx: { user: session.user, sessionId: session.sessionId } });
});
