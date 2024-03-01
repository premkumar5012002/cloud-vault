import { FC, Suspense } from "react";
import { redirect } from "next/navigation";

import { Sort } from "@/types";
import { db, kysely } from "@/lib/db";
import { getPageSession } from "@/lib/auth/lucia";

import { orderBy } from "@/lib/helpers/sort";

import { ActionBarLayout } from "@/components/Layouts/ActionBarLayout";
import { BreadCrumbsShell } from "@/components/Shells/BreadCrumbsShell";
import { BreadCrumbs } from "@/components/BreadCrumbs";
import { ContentView } from "@/components/ContentView";
import { ContentViewShell } from "@/components/Shells/ContentViewShell";

export default async function page({
  params,
}: {
  params: { slug?: string[] };
}) {
  const folderId = params.slug?.pop();

  const session = await getPageSession();

  if (session === null) {
    return redirect("/sign-in");
  }

  const perference = await db.query.perferences.findFirst({
    where: (perferences, { eq }) => eq(perferences.userId, session.user.userId),
  });

  const sort: Sort = {
    by: perference?.sortBy ?? "name",
    order: perference?.sortOrder ?? "asc",
  };

  return (
    <ActionBarLayout page="drive" folderId={folderId}>
      <Suspense fallback={<BreadCrumbsShell />}>
        <DriveBreadCrumbs folderId={folderId} userId={session.user.userId} />
      </Suspense>
      <Suspense fallback={<ContentViewShell />}>
        <DriveContentView
          folderId={folderId}
          userId={session.user.userId}
          sort={sort}
        />
      </Suspense>
    </ActionBarLayout>
  );
}

const DriveBreadCrumbs: FC<{ folderId?: string; userId: string }> = async ({
  folderId,
  userId,
}) => {
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

  return <BreadCrumbs breadCrumbs={breadCrumbs} />;
};

const DriveContentView: FC<{
  folderId?: string;
  userId: string;
  sort: Sort;
}> = async ({ folderId, userId, sort }) => {
  const folders = await db.query.folders.findMany({
    where: (folders, { and, eq, isNull }) => {
      return and(
        eq(folders.userId, userId),
        eq(folders.isTrashed, false),
        folderId === undefined
          ? isNull(folders.parentId)
          : eq(folders.parentId, folderId)
      );
    },
    orderBy: (folders, operators) => orderBy(folders, operators, sort),
  });

  const files = await db.query.files.findMany({
    where: (files, { and, eq, isNull }) => {
      return and(
        eq(files.isTrashed, false),
        eq(files.userId, userId),
        folderId === undefined
          ? isNull(files.folderId)
          : eq(files.folderId, folderId)
      );
    },
    orderBy: (files, operators) => orderBy(files, operators, sort),
  });

  return (
    <ContentView page="drive" folderId={folderId} data={{ folders, files }} />
  );
};
