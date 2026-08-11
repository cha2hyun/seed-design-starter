import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import { NotFoundPage } from "@/pages/not-found";

import { AppFooter } from "@/widgets/app-footer";
import { AppHeader } from "@/widgets/app-header";
import { AppSidebar } from "@/widgets/app-sidebar";

import { MAIN_CONTENT_ID, shellContentClassName, SkipToContent } from "@/shared/ui";

export interface AppRouterContext {
  queryClient: QueryClient;
}

function RootLayout() {
  return (
    <div className="flex flex-col bg-bg-layer-basement text-fg-neutral">
      <div className="flex min-h-dvh flex-col">
        <SkipToContent />
        <AppHeader />
        <div className="flex flex-1">
          <AppSidebar />
          {/*
            `tabIndex={-1}` so the skip link can move focus here. Without it the browser
            scrolls to the anchor but leaves focus in the nav, and the next Tab returns the
            user to the top of the menu they were trying to escape.
          */}
          <main id={MAIN_CONTENT_ID} tabIndex={-1} className="min-w-0 flex-1 py-x4 md:py-x6">
            <div className={shellContentClassName}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}

export const Route = createRootRouteWithContext<AppRouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});
