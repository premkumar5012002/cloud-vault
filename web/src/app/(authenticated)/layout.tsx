import { PropsWithChildren } from "react";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getPageSession } from "@/lib/auth/lucia";

import { Providers } from "./providers";
import { NavBar } from "@/components/Navbar";
import { SideBar } from "@/components/Sidebar";

export default async function Layout({ children }: PropsWithChildren) {
	const session = await getPageSession();

	if (session === null) {
		return redirect("/sign-in");
	}

	const storage = await db.query.storage.findFirst({
		where: (storages, { eq }) => eq(storages.userId, session.user.userId),
	});

	const preference = await db.query.perferences.findFirst({
		where: (preferences, { eq }) => eq(preferences.userId, session.user.userId),
	});

	return (
		<Providers preference={preference}>
			<NavBar storage={storage} />
			<SideBar storage={storage} />
			<div className="lg:pl-72">{children}</div>
		</Providers>
	);
}
