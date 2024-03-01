import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { Sort } from "@/types";
import { redis } from "@/lib/redis";
import { env } from "@/lib/env.mjs";
import { db, kysely } from "@/lib/db";
import { TRPCError } from "@trpc/server";
import { privateProcedure, router } from "@/trpc";
import { fileActivities, files } from "@/lib/db/schema";

export const fileRouter = router({
  getFiles: privateProcedure
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
        return await db.query.files.findMany({
          where: (files, { and, eq, isNull }) => {
            return and(
              eq(files.isTrashed, false),
              eq(files.userId, userId),
              folderId === undefined
                ? isNull(files.folderId)
                : eq(files.folderId, folderId)
            );
          },
          orderBy: (files, { asc, desc }) => {
            if (sort.by === "name") {
              return sort.order === "asc" ? asc(files.name) : desc(files.name);
            }

            if (sort.by === "modified") {
              return sort.order === "asc"
                ? asc(files.updatedAt)
                : desc(files.updatedAt);
            }

            return sort.order === "asc" ? asc(files.size) : desc(files.size);
          },
        });
      }

      if (page === "recent") {
        const recentFiles = await db
          .select({ file: files })
          .from(files)
          .leftJoin(fileActivities, () => eq(files.id, fileActivities.id))
          .where(and(eq(files.isTrashed, false), eq(files.userId, userId)))
          .orderBy(desc(fileActivities.timestamp))
          .limit(20);

        return recentFiles.flatMap(({ file }) => file);
      }

      if (page === "starred") {
        return await db.query.files.findMany({
          where: (files, { and, eq }) => {
            return and(
              eq(files.isStarred, true),
              eq(files.isTrashed, false),
              eq(files.userId, userId)
            );
          },
        });
      }

      if (page === "trash") {
        return await db.query.files.findMany({
          where: (files, { and, eq }) => {
            return and(eq(files.userId, userId), eq(files.isTrashed, true));
          },
        });
      }

      return [];
    }),

  getFileUrl: privateProcedure
    .input(z.string().cuid2())
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.user;

      const fileId = input;

      const file = await db.query.files.findFirst({
        where: (files, { and, eq }) =>
          and(
            eq(files.id, fileId),
            eq(files.userId, userId),
            eq(files.isTrashed, false)
          ),
      });

      if (file === undefined) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const client = new S3Client({ endpoint: env.AWS_ENDPOINT });

      const command = new GetObjectCommand({
        Bucket: env.AWS_S3_BUCKET_NAME,
        Key: file.key,
      });

      const url = getSignedUrl(client, command, { expiresIn: 3600 });

      return url;
    }),

  upload: privateProcedure
    .input(
      z.object({
        name: z.string().min(1),
        size: z.number().int().min(1).max(1073741824),
        folderId: z.string().cuid2().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.user;

      const id = createId();

      const { name, size, folderId } = input;

      const storage = await db.query.storage.findFirst({
        where: (storage, { eq }) => eq(storage.userId, userId),
      });

      if (storage) {
        const availableStorage = storage.totalStorage - storage.usedStorage;
        if (availableStorage < size) {
          throw new TRPCError({ code: "BAD_REQUEST" });
        }
      }

      const parents = folderId
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

      const parentsPath = parents.map((folder) => folder.id).join("/");

      const key = (parents.length > 0 ? parentsPath + "/" : "/") + id;

      const client = new S3Client({ endpoint: env.AWS_ENDPOINT });

      const command = new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET_NAME,
        Key: env.AWS_S3_BUCKET_NAME + "/" + key,
        ContentLength: size,
      });

      const url = await getSignedUrl(client, command, {
        expiresIn: 300,
      });

      await redis.hset(`files:${key}`, {
        id: id,
        key: key,
        name: name,
        userId: userId,
        folderId: folderId,
      });

      return url;
    }),
});
