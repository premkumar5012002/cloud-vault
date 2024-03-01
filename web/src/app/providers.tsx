"use client";

import { Toaster } from "sonner";
import superjson from "superjson";
import { ThemeProvider } from "next-themes";
import { useRouter } from "next/navigation";
import { NextUIProvider } from "@nextui-org/react";
import { useState, PropsWithChildren } from "react";
import { httpBatchLink, getFetch, loggerLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { trpc } from "@/trpc/client";
import { getBaseUrl } from "@/lib/utils";

import { UploadTrackerOverlay } from "@/components/UploadTrackerOverlay";

export const Providers = (props: PropsWithChildren) => {
	const router = useRouter();

	const [queryClient] = useState(() => {
		return new QueryClient({
			defaultOptions: { queries: { staleTime: 5000 } },
		});
	});

	const [trpcClient] = useState(() => {
		return trpc.createClient({
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
	});

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<NextUIProvider navigate={router.push}>
					<ThemeProvider enableSystem attribute="class">
						<Toaster richColors />
						<UploadTrackerOverlay />
						{props.children}
					</ThemeProvider>
				</NextUIProvider>
			</QueryClientProvider>
		</trpc.Provider>
	);
};
