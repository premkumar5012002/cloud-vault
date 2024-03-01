import {
  loggerLink,
  TRPCClientError,
  createTRPCProxyClient,
} from "@trpc/client";
import { cache } from "react";
import SuperJSON from "superjson";
import { cookies } from "next/headers";
import { callProcedure } from "@trpc/server";
import { TRPCErrorResponse } from "@trpc/server/rpc";
import { observable } from "@trpc/server/observable";

import { createTRPCContext } from "@/trpc";
import { AppRouter, appRouter } from "@/trpc/routes/_app";

const createContext = cache(() => {
  return createTRPCContext({
    headers: new Headers({
      cookie: cookies().toString(),
      "x-trpc-source": "rsc",
    }),
  });
});

export const api = createTRPCProxyClient<AppRouter>({
  transformer: SuperJSON,
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    /**
     * Custom RSC link that lets us invoke procedures without using http requests. Since Server
     * Components always run on the server, we can just call the procedure as a function.
     */
    () =>
      ({ op }) =>
        observable((observer) => {
          createContext()
            .then((ctx) => {
              return callProcedure({
                procedures: appRouter._def.procedures,
                path: op.path,
                rawInput: op.input,
                ctx,
                type: op.type,
              });
            })
            .then((data) => {
              observer.next({ result: { data } });
              observer.complete();
            })
            .catch((cause: TRPCErrorResponse) => {
              observer.error(TRPCClientError.from(cause));
            });
        }),
  ],
});
