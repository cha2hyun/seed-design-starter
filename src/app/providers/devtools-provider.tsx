import type { ReactNode } from "react";

import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import type { AnyRouter } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { IS_DEV } from "@/shared/config";

export interface DevtoolsProviderProps {
  children: ReactNode;
  router: AnyRouter;
}

/**
 * DEV-only tooling mount. Uses the official TanStack Devtools shell so Query,
 * Router (and later custom panels) share one trigger and tabbed panel — separate
 * FABs overlap when both open.
 */
export function DevtoolsProvider({ children, router }: DevtoolsProviderProps) {
  return (
    <>
      {children}
      {IS_DEV ? <MountedTanStackDevtools router={router} /> : null}
    </>
  );
}

function MountedTanStackDevtools({ router }: { router: AnyRouter }) {
  return (
    <TanStackDevtools
      config={{ position: "bottom-left" }}
      plugins={[
        {
          name: "TanStack Query",
          render: <ReactQueryDevtoolsPanel />,
        },
        {
          name: "TanStack Router",
          render: <TanStackRouterDevtoolsPanel router={router} />,
        },
      ]}
    />
  );
}
