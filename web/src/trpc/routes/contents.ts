import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, inArray, sql } from "drizzle-orm";
import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";

import { File, NewFileActivity } from "@/types";
import { env } from "@/lib/env.mjs";
import { redis } from "@/lib/redis";
import { db, kysely } from "@/lib/db";
import { privateProcedure, router } from "@/trpc";
import { getAllFiles } from "@/lib/helpers/get-all-files";
import {
  users,
  files,
  folders,
  storage,
  fileActivities,
} from "@/lib/db/schema";

export const contentRouter = router({
  rename: privateProcedure
    .input(
      z.object({
        id: z.string().cuid2(),
        name: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, name } = input;

      const { userId } = ctx.user;

      const folder = await db.query.folders.findFirst({
        where: (folders, { and, eq }) =>
          and(
            eq(folders.id, id),
            eq(folders.userId, userId),
            eq(folders.isTrashed, false)
          ),
      });

      if (folder) {
        return await db
          .update(folders)
          .set({ name })
          .where(and(eq(folders.id, id), eq(folders.userId, userId)));
      }

      const file = await db.query.files.findFirst({
        where: (files, { and, eq }) =>
          and(
            eq(files.id, id),
            eq(files.userId, userId),
            eq(files.isTrashed, false)
          ),
      });

      if (file === undefined) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await db.insert(fileActivities).values({
        fileId: id,
        userId: userId,
        activity: "UPDATE",
      });

      await db
        .update(files)
        .set({ name })
        .where(and(eq(files.id, id), eq(files.userId, userId)));
    }),

  star: privateProcedure
    .input(
      z.object({
        fileIds: z.array(z.string().cuid2()),
        folderIds: z.array(z.string().cuid2()),
      })
    )
    .mutation(({ input, ctx }) => {
      const { userId } = ctx.user;

      const { fileIds, folderIds } = input;

      db.transaction(async (tx) => {
        if (fileIds.length > 0) {
          await tx
            .update(files)
            .set({ isStarred: true })
            .where(and(eq(files.userId, userId), inArray(files.id, fileIds)));
        }

        if (folderIds.length > 0) {
          await tx
            .update(folders)
            .set({ isStarred: true })
            .where(
              and(eq(folders.userId, userId), inArray(folders.id, folderIds))
            );
        }
      });
    }),

  unstar: privateProcedure
    .input(
      z.object({
        fileIds: z.array(z.string().cuid2()),
        folderIds: z.array(z.string().cuid2()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.user;

      const { fileIds, folderIds } = input;

      db.transaction(async (tx) => {
        if (fileIds.length > 0) {
          await tx
            .update(files)
            .set({ isStarred: false })
            .where(and(eq(files.userId, userId), inArray(files.id, fileIds)));
        }

        if (folderIds.length > 0) {
          await tx
            .update(folders)
            .set({ isStarred: false })
            .where(
              and(eq(folders.userId, userId), inArray(folders.id, folderIds))
            );
        }
      });
    }),

  move: privateProcedure
    .input(
      z.object({
        fileIds: z.array(z.string().cuid2()),
        folderIds: z.array(z.string().cuid2()),
        destinationId: z.string().cuid2().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.user;

      const { fileIds, folderIds, destinationId } = input;

      const destinationFolderParents = destinationId
        ? await kysely
            .withRecursive("folderHierarchy", (db) =>
              db
                .selectFrom("folders")
                .select(["id", "name", "parent_id"])
                .where("id", "=", destinationId)
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

      // if destination parents folder is in the same level as the source folder throw error
      for (const folder of destinationFolderParents) {
        if (folderIds.includes(folder.id)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot move folder into itself",
          });
        }
      }

      db.transaction(async (tx) => {
        if (fileIds.length > 0) {
          const fileActivitiesValues: NewFileActivity[] = fileIds.map(
            (fileId) => ({
              activity: "UPDATE",
              fileId: fileId,
              userId: userId,
            })
          );

          await tx.insert(fileActivities).values(fileActivitiesValues);

          await tx
            .update(files)
            .set({ folderId: destinationId })
            .where(and(eq(files.userId, userId), inArray(files.id, fileIds)));
        }

        if (folderIds.length > 0) {
          await tx
            .update(folders)
            .set({ parentId: destinationId })
            .where(
              and(eq(folders.userId, userId), inArray(folders.id, folderIds))
            );
        }
      });
    }),

  trash: privateProcedure
    .input(
      z.object({
        fileIds: z.array(z.string().cuid2()),
        folderIds: z.array(z.string().cuid2()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.user;

      const { fileIds, folderIds } = input;

      await db.transaction(async (tx) => {
        if (fileIds.length > 0) {
          const fileActivitiesValues: NewFileActivity[] = fileIds.map(
            (fileId) => ({
              activity: "TRASH",
              fileId: fileId,
              userId: userId,
            })
          );

          await tx.insert(fileActivities).values(fileActivitiesValues);

          await tx
            .update(files)
            .set({ isTrashed: true })
            .where(
              and(
                eq(files.userId, userId),
                eq(files.isTrashed, false),
                inArray(files.id, fileIds)
              )
            );
        }

        if (folderIds.length > 0) {
          await tx
            .update(folders)
            .set({ isTrashed: true })
            .where(
              and(
                eq(folders.userId, userId),
                eq(folders.isTrashed, false),
                inArray(folders.id, folderIds)
              )
            );
        }
      });
    }),

  restore: privateProcedure
    .input(
      z.object({
        fileIds: z.array(z.string().cuid2()),
        folderIds: z.array(z.string().cuid2()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.user;

      const { fileIds, folderIds } = input;

      await db.transaction(async (tx) => {
        if (fileIds.length > 0) {
          const fileActivitiesValues: NewFileActivity[] = fileIds.map(
            (fileId) => ({
              activity: "RESTORE",
              fileId: fileId,
              userId: userId,
            })
          );

          await tx.insert(fileActivities).values(fileActivitiesValues);

          await tx
            .update(files)
            .set({ isTrashed: false })
            .where(
              and(
                eq(files.userId, userId),
                eq(files.isTrashed, true),
                inArray(files.id, fileIds)
              )
            );
        }

        if (folderIds.length > 0) {
          await tx
            .update(folders)
            .set({ isTrashed: false })
            .where(
              and(
                eq(folders.userId, userId),
                eq(folders.isTrashed, true),
                inArray(folders.id, folderIds)
              )
            );
        }
      });
    }),

  emptyTrash: privateProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx.user;

    const trashFolders = await db.query.folders.findMany({
      where: (folders, { and, eq }) => {
        return and(eq(folders.userId, userId), eq(folders.isTrashed, true));
      },
    });

    const allTrashedFolderFiles = await getAllFiles(
      trashFolders.map((f) => f.id)
    );

    const trashFiles = await db.query.files.findMany({
      where: (files, { and, eq }) => {
        return and(eq(files.userId, userId), eq(files.isTrashed, true));
      },
    });

    const client = new S3Client({ endpoint: env.AWS_ENDPOINT });

    if (trashFiles.length + allTrashedFolderFiles.length > 0) {
      const command = new DeleteObjectsCommand({
        Bucket: env.AWS_S3_BUCKET_NAME,
        Delete: {
          Objects: trashFiles
            .map((file) => ({ Key: file.id }))
            .concat(allTrashedFolderFiles.map((file) => ({ Key: file.id }))),
        },
      });

      await client.send(command);

      await db
        .delete(files)
        .where(and(eq(files.isTrashed, true), eq(files.userId, userId)));

      const updatedSize =
        trashFiles.reduce((acc, obj) => acc + obj.size, 0) +
        allTrashedFolderFiles.reduce((acc, obj) => acc + obj.size, 0);

      await db
        .update(storage)
        .set({
          usedStorage: sql`used_storage - ${updatedSize}`,
        })
        .where(eq(users.id, userId));
    }

    await db
      .delete(folders)
      .where(and(eq(folders.isTrashed, true), eq(folders.userId, userId)));
  }),

  delete: privateProcedure
    .input(
      z.object({
        fileIds: z.array(z.string().cuid2()),
        folderIds: z.array(z.string().cuid2()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.user;

      const { folderIds, fileIds } = input;

      let allFoldersFiles: Awaited<ReturnType<typeof getAllFiles>> = [];

      if (folderIds.length > 0) {
        const trashFolders = await db.query.folders.findMany({
          where: (folders, { and, eq, inArray }) => {
            return and(
              eq(folders.userId, userId),
              eq(folders.isTrashed, true),
              inArray(folders.id, folderIds)
            );
          },
        });

        allFoldersFiles = await getAllFiles(trashFolders.map((f) => f.id));
      }

      let allFiles: File[] = [];

      if (fileIds.length > 0) {
        allFiles = await db.query.files.findMany({
          where: (files, { and, eq, inArray }) => {
            return and(
              eq(files.userId, userId),
              eq(files.isTrashed, true),
              inArray(files.id, fileIds)
            );
          },
        });
      }

      const client = new S3Client({ endpoint: env.AWS_ENDPOINT });

      if (allFiles.length + allFoldersFiles.length > 0) {
        const command = new DeleteObjectsCommand({
          Bucket: env.AWS_S3_BUCKET_NAME,
          Delete: {
            Objects: allFiles
              .map((file) => ({ Key: file.key }))
              .concat(allFoldersFiles.map((file) => ({ Key: file.key }))),
          },
        });

        await client.send(command);

        await db
          .delete(files)
          .where(and(eq(files.isTrashed, true), eq(files.userId, userId)));

        const updatedSize =
          allFiles.reduce((acc, obj) => acc + obj.size, 0) +
          allFoldersFiles.reduce((acc, obj) => acc + obj.size, 0);

        await db
          .update(storage)
          .set({
            usedStorage: sql`used_storage - ${updatedSize}`,
          })
          .where(eq(storage.id, userId));
      }

      await db
        .delete(folders)
        .where(and(eq(folders.isTrashed, true), eq(folders.userId, userId)));
    }),
});
