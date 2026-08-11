import type { ReactNode } from "react";

import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  type RegisteredRouter,
  RouterProvider,
} from "@tanstack/react-router";

/**
 * Renders a component that calls router hooks (`useNavigate`, `useRouterState`, `Link`)
 * without booting the real route tree, which would pull in every page and its data.
 *
 * The returned `location` reads the current path, so a test can assert where a component
 * navigated to instead of mocking the navigation away.
 */
export function createTestRouter(ui: ReactNode, initialPath = "/") {
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => ui,
  });
  // Every destination a component under test might navigate to needs to exist, or the
  // router resolves it to notFound and the assertion reads the wrong path.
  const catchAllRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "$",
    component: () => null,
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, catchAllRoute]),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });

  return {
    // The app augments `Register` with its real router, so `RouterProvider` is typed to that
    // exact tree and this throwaway one cannot structurally satisfy it.
    element: <RouterProvider router={router as unknown as RegisteredRouter} />,
    location: () => router.state.location.pathname,
  };
}
