import { createRouter } from "@tanstack/react-router";

import { ErrorPage } from "@/pages/error";
import { NotFoundPage } from "@/pages/not-found";

import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultNotFoundComponent: NotFoundPage,
  defaultErrorComponent: ErrorPage,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
