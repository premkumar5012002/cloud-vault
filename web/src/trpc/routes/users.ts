import { z } from "zod";
import { eq } from "drizzle-orm";
import { LuciaError } from "lucia";
import { TRPCError } from "@trpc/server";
import { revalidateTag } from "next/cache";
import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";

import { db } from "@/lib/db";
import { env } from "@/lib/env.mjs";
import { auth } from "@/lib/auth/lucia";
import { privateProcedure, router } from "@/trpc";
import { perferences, users } from "@/lib/db/schema";

export const userRouter = router({
	changeName: privateProcedure
		.input(
			z.object({
				firstName: z.string(),
				lastName: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { userId } = ctx.user;

			const { firstName, lastName } = input;

			const user = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, userId),
			});

			if (user === undefined) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			await db.update(users).set({ firstName, lastName }).where(eq(users.id, userId));
		}),

	changePassword: privateProcedure
		.input(
			z.object({
				currentPassword: z.string(),
				newPassword: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { userId } = ctx.user;

			const { currentPassword, newPassword } = input;

			const user = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, userId),
			});

			if (user === undefined) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			try {
				await auth.useKey("email", user.email, currentPassword);
			} catch (e) {
				if (e instanceof LuciaError && e.message === "AUTH_INVALID_PASSWORD") {
					throw new TRPCError({ code: "BAD_REQUEST" });
				}
				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
			}

			await auth.updateKeyPassword("email", user.email, newPassword);

			const sessions = await auth.getAllUserSessions(user.id);

			await Promise.all(
				sessions
					.filter((s) => s.sessionId !== ctx.sessionId)
					.map((s) => auth.invalidateSession(s.sessionId))
			);
		}),

	deleteAccount: privateProcedure.mutation(async ({ ctx }) => {
		const { userId } = ctx.user;

		const user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, userId),
		});

		if (user === undefined) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}

		await auth.invalidateAllUserSessions(userId);

		const allUserFiles = await db.query.files.findMany({
			where: (files, { eq }) => eq(files.userId, userId),
		});

		const client = new S3Client({ endpoint: env.AWS_ENDPOINT });

		if (allUserFiles.length > 0) {
			const command = new DeleteObjectsCommand({
				Bucket: env.AWS_S3_BUCKET_NAME,
				Delete: {
					Objects: allUserFiles.map((file) => ({ Key: file.id })),
				},
			});

			await client.send(command);
		}

		await db.delete(users).where(eq(users.id, userId));
	}),
});
