import {
	getFetch,
	loggerLink,
	httpBatchLink,
	createTRPCReact,
	createTRPCProxyClient,
} from "@trpc/react-query";
import superjson from "superjson";
import { inferRouterOutputs } from "@trpc/server";

import { getBaseUrl } from "@/lib/utils";
import { AppRouter } from "@/trpc/routes/_app";

export const trpc = createTRPCReact<AppRouter>();

export const client = createTRPCProxyClient<AppRouter>({
	links: [
		loggerLink({ enabled: () => true }),
		httpBatchLink({
			url: getBaseUrl() + "/api/trpc",
			fetch: async (input, init?) => {
				const fetch = getFetch();
				return fetch(input, {
					...init,
					credentials: "include",
				});
			},
		}),
	],
	transformer: superjson,
});

export type RouterOutput = inferRouterOutputs<AppRouter>;
