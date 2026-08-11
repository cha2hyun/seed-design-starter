import type { ReactNode } from "react";

import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AnyRouter } from "@tanstack/react-router";

import { SnackbarProvider } from "seed-design/ui/snackbar";

import { DevtoolsProvider } from "./devtools-provider";

export interface AppProvidersProps {
  children: ReactNode;
  queryClient: QueryClient;
  router: AnyRouter;
}

export function AppProviders({ children, queryClient, router }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <DevtoolsProvider router={router}>
        <SnackbarProvider>{children}</SnackbarProvider>
      </DevtoolsProvider>
    </QueryClientProvider>
  );
}
