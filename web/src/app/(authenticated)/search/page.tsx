import { eq, and, sql } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

import { db } from "@/lib/db";
import { folders, files } from "@/lib/db/schema";
import { getPageSession } from "@/lib/auth/lucia";

import { ActionBarLayout } from "@/components/Layouts/ActionBarLayout";
import { ContentView } from "@/components/ContentView";
import { FC, Suspense } from "react";
import { ContentViewShell } from "@/components/Shells/ContentViewShell";

export default async function page({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const session = await getPageSession();

  if (session === null) {
    return redirect("/sign-in");
  }

  const query = searchParams?.q;

  if (typeof query === "string") {
    return (
      <div>
        <ActionBarLayout page="search">
          <div className="pt-6">
            <h1 className="text-2xl font-semibold px-6">Search Result</h1>
            <Suspense fallback={<ContentViewShell />}>
              <SearchContentView query={query} userId={session.user.userId} />
            </Suspense>
          </div>
        </ActionBarLayout>
      </div>
    );
  }

  return notFound();
}

const SearchContentView: FC<{ query: string; userId: string }> = async ({
  query,
  userId,
}) => {
  const searchfolders = await db
    .select()
    .from(folders)
    .where(
      and(
        sql`name @@ phraseto_tsquery('english', ${query})`,
        eq(folders.userId, userId)
      )
    );

  const searchfiles = await db
    .select()
    .from(files)
    .where(
      and(
        sql`name @@ phraseto_tsquery('english', ${query})`,
        eq(files.userId, userId)
      )
    );

  return (
    <ContentView
      page="search"
      data={{ folders: searchfolders, files: searchfiles }}
    />
  );
};
