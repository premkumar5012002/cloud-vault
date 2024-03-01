import { privateProcedure, router } from "@/trpc";

import { authRouter } from "./auth";
import { userRouter } from "./users";
import { folderRouter } from "./folders";
import { fileRouter } from "./files";
import { contentRouter } from "./contents";
import { z } from "zod";
import { db } from "@/lib/db";
import { perferences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const appRouter = router({
	auth: authRouter,
	user: userRouter,
	folders: folderRouter,
	files: fileRouter,
	contents: contentRouter,

	changeSort: privateProcedure
		.input(
			z.object({
				sort: z.object({
					by: z.enum(["name", "modified", "size"]),
					order: z.enum(["asc", "desc"]),
				}),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { sort } = input;

			const userId = ctx.user.userId;

			const perference = await db.query.perferences.findFirst({
				where: (perferences, { eq }) => eq(perferences.userId, userId),
			});

			if (perference) {
				await db
					.update(perferences)
					.set({ sortBy: sort.by, sortOrder: sort.order })
					.where(eq(perferences.userId, userId));
			} else {
				await db.insert(perferences).values({
					sortBy: sort.by,
					sortOrder: sort.order,
					userId: userId,
				});
			}
		}),

	changeView: privateProcedure
		.input(
			z.object({
				view: z.enum(["list", "grid"]),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { view } = input;

			const userId = ctx.user.userId;

			const perference = await db.query.perferences.findFirst({
				where: (perferences, { eq }) => eq(perferences.userId, userId),
			});

			if (perference) {
				await db.update(perferences).set({ view: view }).where(eq(perferences.userId, userId));
			} else {
				await db.insert(perferences).values({
					view: view,
					userId: userId,
				});
			}
		}),
});

export type AppRouter = typeof appRouter;
