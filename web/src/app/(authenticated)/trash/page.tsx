import { FC, Suspense } from "react";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { Sort } from "@/types";
import { getPageSession } from "@/lib/auth/lucia";

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
		<ActionBarLayout page="trash">
			<Suspense fallback={<ContentViewShell />}>
				<TrashedContentView userId={session.user.userId} sort={sort} />
			</Suspense>
		</ActionBarLayout>
	);
}

const TrashedContentView: FC<{ userId: string; sort: Sort }> = async ({ userId, sort }) => {
	const trashedFolders = await db.query.folders.findMany({
		where: (folders, { and, eq }) => {
			return and(eq(folders.isTrashed, true), eq(folders.userId, userId));
		},
		orderBy: (folders, operators) => orderBy(folders, operators, sort),
	});

	const trashedFiles = await db.query.files.findMany({
		where: (files, { and, eq }) => {
			return and(eq(files.isTrashed, true), eq(files.userId, userId));
		},
		orderBy: (files, operators) => orderBy(files, operators, sort),
	});

	return <ContentView page="trash" data={{ folders: trashedFolders, files: trashedFiles }} />;
};
