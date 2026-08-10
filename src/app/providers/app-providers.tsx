import type { ReactNode } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import type { AnyRouter } from "@tanstack/react-router";

import { SnackbarProvider } from "seed-design/ui/snackbar";

import { DevtoolsProvider } from "./devtools-provider";
import { queryClient } from "./query-client";

export interface AppProvidersProps {
  children: ReactNode;
  router: AnyRouter;
}

export function AppProviders({ children, router }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <DevtoolsProvider router={router}>
        <SnackbarProvider>{children}</SnackbarProvider>
      </DevtoolsProvider>
    </QueryClientProvider>
  );
}
