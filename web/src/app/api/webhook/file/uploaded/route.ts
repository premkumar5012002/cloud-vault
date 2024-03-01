import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { and, eq, inArray, sql } from "drizzle-orm";

import { db, kysely } from "@/lib/db";
import { env } from "@/lib/env.mjs";
import { redis } from "@/lib/redis";
import { files, folders, storage } from "@/lib/db/schema";
import { FileMetadataSchema } from "@/lib/validators/contents";

export async function POST(req: Request) {
  try {
    const hash = req.headers.get("x-hmac-hash");

    const body = await req.json();

    const calculatedHash = createHmac("sha256", env.WEBHOOK_SECRET_KEY)
      .update(JSON.stringify(body))
      .digest("hex");

    if (hash !== calculatedHash) {
      return new Response("INVALID_HASH", { status: 400 });
    }

    const fileMetadata = FileMetadataSchema.parse(body);

    const fileData = await redis.hgetall(`files:${fileMetadata.key}`);

    if (fileData === null) {
      throw new Response("FILE_METADATA_NOT_FOUND", { status: 404 });
    }

    const folderId =
      fileData.folderId.length === 0 ? undefined : fileData.folderId;

    const newFile = {
      id: fileData.id,
      key: fileData.key,
      name: fileData.name,
      folderId: folderId,
      size: fileMetadata.size,
      userId: fileData.userId,
    };

    await db.insert(files).values(newFile);

    if (folderId) {
      const parents = await kysely
        .withRecursive("folderHierarchy", (db) =>
          db
            .selectFrom("folders")
            .select(["id", "name", "parent_id"])
            .where("id", "=", folderId)
            .where("user_id", "=", newFile.userId)
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
        .execute();

      await db
        .update(folders)
        .set({
          size: sql`size + ${fileMetadata.size}`,
        })
        .where(
          and(
            inArray(
              folders.id,
              parents.map((folder) => folder.id)
            ),
            eq(folders.userId, fileData.userId)
          )
        );
    }

    const userStorage = await db.query.storage.findFirst({
      where: (storage, { eq }) => eq(storage.id, fileData.userId),
    });

    if (userStorage) {
      await db
        .update(storage)
        .set({ usedStorage: userStorage.usedStorage + fileMetadata.size })
        .where(eq(storage.userId, fileData.userId));
    } else {
      await db
        .insert(storage)
        .values({ usedStorage: fileMetadata.size, userId: fileData.userId });
    }

    await redis.del(`files:${fileMetadata.key}`);

    return NextResponse.json({ status: "SUCCESS" });
  } catch (e) {
    console.log(e);
    return new Response("INTERNAL_SERVER_ERROR", { status: 500 });
  }
}
