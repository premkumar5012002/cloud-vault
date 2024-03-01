import { z } from "zod";
import * as context from "next/headers";
import { LuciaError, User } from "lucia";
import { TRPCError } from "@trpc/server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth/lucia";
import { TokenManager } from "@/lib/auth/token";
import { TimeoutManager } from "@/lib/auth/timeout";
import { privateProcedure, publicProcedure, router } from "@/trpc";

export const authRouter = router({
  signIn: publicProcedure
    .input(
      z.object({
        email: z.string().email("Please provide a valid email address"),
        password: z.string().min(1, { message: "Password cannot be empty" }),
      })
    )
    .mutation(async ({ input }) => {
      const { email, password } = input;

      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email),
      });

      if (user === undefined) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account does not exist",
        });
      }

      const cookies = context.cookies();

      const deviceToken = cookies.get("device_token");

      const isValidToken = await TokenManager.validateDeviceToken(
        deviceToken?.value
      );

      if (isValidToken === false) {
        const isTimeout = await TimeoutManager.manageLoginTimeout(email);

        if (isTimeout) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message:
              "Account is locked for 5 minutues due to too many login attempts",
          });
        }
      }

      let userId: string;

      try {
        const key = await auth.useKey("email", email, password);
        userId = key.userId;
      } catch (e) {
        if (e instanceof LuciaError) {
          switch (e.message) {
            case "AUTH_INVALID_PASSWORD": {
              throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Invalid password, please try again.",
              });
            }
          }
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      const session = await auth.createSession({
        userId: userId,
        attributes: {},
      });

      const authRequest = auth.handleRequest("POST", context);

      authRequest.setSession(session);

      const newDeviceToken = await TokenManager.generateDeviceToken(email);

      cookies.set("device_token", newDeviceToken, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });

      return {
        result: session.user.isVerified ? "SUCCESS" : "EMAIL_NOT_VERIFIED",
      };
    }),

  signUp: publicProcedure
    .input(
      z.object({
        firstName: z.string().min(1, "First name can't be empty"),
        lastName: z.string().min(1, "Last name can't be empty"),
        email: z.string().email("Please provide a valid email address"),
        password: z
          .string()
          .min(8, { message: "Password must be mininum 8 characters" })
          .max(256, { message: "Password should not exceed 256 characters" }),
      })
    )
    .mutation(async ({ input }) => {
      const { firstName, lastName, email, password } = input;

      let user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email),
      });

      if (user) {
        throw new TRPCError({ code: "CONFLICT" });
      }

      let newUser: User;

      try {
        newUser = await auth.createUser({
          key: {
            providerId: "email",
            providerUserId: email,
            password: password,
          },
          attributes: {
            first_name: firstName,
            last_name: lastName,
            email: email,
            is_verified: false,
          },
        });
      } catch (e) {
        if (e instanceof LuciaError) {
          switch (e.message) {
            case "AUTH_DUPLICATE_KEY_ID": {
              throw new TRPCError({ code: "CONFLICT" });
            }
          }
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      const session = await auth.createSession({
        userId: newUser.userId,
        attributes: {},
      });

      const authRequest = auth.handleRequest("POST", context);

      authRequest.setSession(session);

      const emailVerificationToken =
        await TokenManager.generateEmailVerificationToken(newUser.userId);

      console.log(
        "Verfication Url",
        `http://localhost:3000/email-verification/${emailVerificationToken}`
      );
    }),

  resendVerificationEmail: publicProcedure.mutation(async ({ ctx }) => {
    const authRequest = auth.handleRequest(
      ctx.headers.get("method") ?? "GET",
      context
    );

    const session = await authRequest.validate();

    if (session === null) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    if (session.user.isVerified) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }

    const { userId } = session.user;

    const isTimeout = await TimeoutManager.manageEmailVerificationTimeout(
      userId
    );

    if (isTimeout) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
    }

    const emailVerificationToken =
      await TokenManager.generateEmailVerificationToken(userId);

    console.log(
      "Verfication Url",
      `http://localhost:3000/email-verification/${emailVerificationToken}`
    );
  }),

  verifyEmail: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { token } = input;

      const userId = await TokenManager.validateEmailVerificationToken(token);

      if (userId === undefined) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const user = await auth.getUser(userId);

      await auth.updateUserAttributes(user.userId, {
        is_verified: true,
      });

      await TokenManager.deleteEmailVerificationToken(token);
    }),

  forgetPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email("Please provide a valid email address"),
      })
    )
    .mutation(async ({ input }) => {
      const { email } = input;

      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email),
      });

      if (user === undefined) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const isTimeout = await TimeoutManager.managePasswordResetTimeout(email);

      if (isTimeout) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      }

      const passwordResetToken = await TokenManager.generatePasswordResetToken(
        user.id
      );

      console.log(
        "Verfication Url",
        `http://localhost:3000/reset-password/${passwordResetToken}`
      );
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z
          .string()
          .min(8, { message: "Password must be mininum 8 characters" })
          .max(256, { message: "Password should not exceed 256 characters" }),
      })
    )
    .mutation(async ({ input }) => {
      const { token, password } = input;

      const userId = await TokenManager.validatePasswordResetToken(token);

      if (userId === undefined) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      let user;

      try {
        user = await auth.getUser(userId);
      } catch (e) {
        if (e instanceof LuciaError) {
          switch (e.message) {
            case "AUTH_INVALID_USER_ID": {
              throw new TRPCError({ code: "NOT_FOUND" });
            }
          }
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      await auth.updateKeyPassword("email", user.email, password);

      await TokenManager.deletePasswordResetToken(token);

      if (user.isVerified === false) {
        await auth.updateUserAttributes(user.userId, { is_verified: true });
      }

      await auth.invalidateAllUserSessions(user.userId);
    }),

  logout: privateProcedure.mutation(async ({ ctx }) => {
    const { sessionId } = ctx;

    const authRequest = auth.handleRequest("GET", context);

    await auth.invalidateSession(sessionId);

    authRequest.setSession(null);
  }),

  logoutOfAllDevice: privateProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx.user;

    const authRequest = auth.handleRequest("GET", context);

    await auth.invalidateAllUserSessions(userId);

    authRequest.setSession(null);
  }),
});
