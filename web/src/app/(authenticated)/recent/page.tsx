import { FC, Suspense } from "react";
import { redirect } from "next/navigation";
import { eq, and, desc, asc } from "drizzle-orm";

import { db } from "@/lib/db";
import { Sort } from "@/types";
import { getPageSession } from "@/lib/auth/lucia";
import { files, fileActivities } from "@/lib/db/schema";

import { ActionBarLayout } from "@/components/Layouts/ActionBarLayout";
import { ContentView } from "@/components/ContentView";
import { ContentViewShell } from "@/components/Shells/ContentViewShell";
import { orderBy } from "@/lib/helpers/sort";

export default async function page() {
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
    <ActionBarLayout page="recent">
      <Suspense fallback={<ContentViewShell />}>
        <RecentContentView sort={sort} userId={session.user.userId} />
      </Suspense>
    </ActionBarLayout>
  );
}

const RecentContentView: FC<{ userId: string; sort: Sort }> = async ({
  userId,
  sort,
}) => {
  const recentFiles = await db
    .select({ file: files })
    .from(files)
    .leftJoin(fileActivities, () => eq(files.id, fileActivities.id))
    .where(and(eq(files.isTrashed, false), eq(files.userId, userId)))
    .orderBy(orderBy(files, { asc, desc }, sort))
    .limit(20);

  return (
    <ContentView
      page="recent"
      data={{ folders: [], files: recentFiles.flatMap(({ file }) => file) }}
    />
  );
};
