import { createRootRoute, Outlet } from "@tanstack/react-router";

import { NotFoundPage } from "@/pages/not-found";

import { AppHeader } from "@/widgets/app-header";
import { AppSidebar } from "@/widgets/app-sidebar";

import { shellContentClassName } from "@/shared/ui";

function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-layer-basement text-fg-neutral">
      <AppHeader />
      <div className="flex flex-1">
        <AppSidebar />
        <main className="min-w-x0 flex-1 py-x4 md:py-x6">
          <div className={shellContentClassName}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});
