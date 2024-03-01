import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { db, kysely } from "@/lib/db";
import { Sort } from "@/types";
import { folders } from "@/lib/db/schema";
import { orderBy } from "@/lib/helpers/sort";
import { router, privateProcedure } from "@/trpc";

export const folderRouter = router({
  getBreadCrumbs: privateProcedure
    .input(z.object({ folderId: z.string().cuid2().optional() }))
    .query(async ({ input, ctx }) => {
      const { folderId } = input;

      const { userId } = ctx.user;

      const breadCrumbs = folderId
        ? await kysely
            .withRecursive("folderHierarchy", (db) =>
              db
                .selectFrom("folders")
                .select(["id", "name", "parent_id"])
                .where("id", "=", folderId)
                .where("user_id", "=", userId)
                .unionAll(
                  db
                    .selectFrom("folders")
                    .select(["folders.id", "folders.name", "folders.parent_id"])
                    .innerJoin(
                      "folderHierarchy",
                      "folderHierarchy.parent_id",
                      "folders.id"
                    )
                )
            )
            .selectFrom("folderHierarchy")
            .select(["id", "name"])
            .execute()
        : [];

      return breadCrumbs;
    }),

  getFolders: privateProcedure
    .input(
      z.object({
        page: z.enum(["drive", "recent", "starred", "trash", "search"]),
        folderId: z.string().cuid2().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.user;

      const { page, folderId } = input;

      const perference = await db.query.perferences.findFirst({
        where: (perferences, { eq }) => eq(perferences.userId, userId),
      });

      const sort: Sort = {
        by: perference?.sortBy ?? "name",
        order: perference?.sortOrder ?? "asc",
      };

      if (page === "drive") {
        return await db.query.folders.findMany({
          where: (folders, { and, eq, isNull }) => {
            return and(
              eq(folders.userId, userId),
              eq(folders.isTrashed, false),
              folderId === undefined
                ? isNull(folders.parentId)
                : eq(folders.parentId, folderId)
            );
          },
          orderBy: (folders, { asc, desc }) =>
            orderBy(folders, { asc, desc }, sort),
        });
      }

      if (page === "starred") {
        return await db.query.folders.findMany({
          where: (folders, { and, eq }) => {
            return and(
              eq(folders.isStarred, true),
              eq(folders.isTrashed, false),
              eq(folders.userId, userId)
            );
          },
          orderBy: (folders, { asc, desc }) =>
            orderBy(folders, { asc, desc }, sort),
        });
      }

      if (page === "trash") {
        return await db.query.folders.findMany({
          where: (folders, { and, eq }) => {
            return and(eq(folders.userId, userId), eq(folders.isTrashed, true));
          },
          orderBy: (folders, { asc, desc }) =>
            orderBy(folders, { asc, desc }, sort),
        });
      }

      return [];
    }),

  new: privateProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(1, { message: "Folder name cannot be empty" })
          .max(128, { message: "Folder name exceeds 128 characters" }),
        parentId: z.string().cuid2().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.user;

      const { name, parentId } = input;

      if (parentId) {
        const parent = await db.query.folders.findFirst({
          where: (folders, { and, eq }) => {
            return and(eq(folders.userId, userId), eq(folders.id, parentId));
          },
        });

        if (parent === undefined) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "The parent folder for the new folder does not exist.",
          });
        }
      }

      const [newFolder] = await db
        .insert(folders)
        .values({ name: name, userId: userId, parentId: parentId })
        .returning();

      return newFolder;
    }),
});
