import { FC, Suspense } from "react";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { Sort } from "@/types";
import { getPageSession } from "@/lib/auth/lucia";

import { ActionBarLayout } from "@/components/Layouts/ActionBarLayout";
import { NoStarredContentsView } from "@/components/NoStarredContentsView";
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
		<ActionBarLayout page="starred">
			<Suspense fallback={<ContentViewShell />}>
				<StarredContentView userId={session.user.userId} sort={sort} />
			</Suspense>
		</ActionBarLayout>
	);
}

const StarredContentView: FC<{ userId: string; sort: Sort }> = async ({ userId, sort }) => {
	const starredFolders = await db.query.folders.findMany({
		where: (folders, { and, eq }) => {
			return and(
				eq(folders.isStarred, true),
				eq(folders.isTrashed, false),
				eq(folders.userId, userId)
			);
		},
		orderBy: (folders, operators) => orderBy(folders, operators, sort),
	});

	const starredFiles = await db.query.files.findMany({
		where: (files, { and, eq }) => {
			return and(eq(files.isStarred, true), eq(files.isTrashed, false), eq(files.userId, userId));
		},
		orderBy: (files, operators) => orderBy(files, operators, sort),
	});

	return <ContentView page="starred" data={{ folders: starredFolders, files: starredFiles }} />;
};
