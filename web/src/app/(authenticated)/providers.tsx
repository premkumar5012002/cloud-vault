"use client";

import { FC, PropsWithChildren, useRef } from "react";

import { Perference } from "@/types";

import { createPerferenceStore } from "@/store/perference";

import { PerferenceContext } from "@/context/perference";

interface ProvidersProps extends PropsWithChildren {
	preference?: Perference;
}

export const Providers: FC<ProvidersProps> = ({ preference, children }) => {
	const perferenceStore = useRef(
		createPerferenceStore({
			view: preference?.view ?? "list",
			sort: {
				by: preference?.sortBy ?? "name",
				order: preference?.sortOrder ?? "asc",
			},
		})
	).current;

	return (
		<PerferenceContext.Provider value={perferenceStore}>{children}</PerferenceContext.Provider>
	);
};
