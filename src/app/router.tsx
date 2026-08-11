import type { QueryClient } from "@tanstack/react-query";
import { createRouter, type RouterHistory } from "@tanstack/react-router";

import { ErrorPage } from "@/pages/error";
import { NotFoundPage } from "@/pages/not-found";

import { routeTree } from "./routeTree.gen";

export interface CreateAppRouterOptions {
  history?: RouterHistory;
  queryClient: QueryClient;
}

export function createAppRouter({ history, queryClient }: CreateAppRouterOptions) {
  return createRouter({
    routeTree,
    context: { queryClient },
    history,
    defaultPreload: "intent",
    defaultNotFoundComponent: NotFoundPage,
    defaultErrorComponent: ErrorPage,
    scrollRestoration: true,
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

declare module "@tanstack/react-router" {
  interface Register {
    router: AppRouter;
  }
}
