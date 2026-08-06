import { createRootRoute, Outlet } from "@tanstack/react-router";

import { NotFoundPage } from "@/pages/not-found";

import { AppHeader } from "@/widgets/app-header";

function RootLayout() {
  return (
    <div className="min-h-dvh bg-bg-layer-basement text-fg-neutral">
      <AppHeader />
      <main className="mx-auto w-full max-w-content py-x6 px-x5">
        <Outlet />
      </main>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});
