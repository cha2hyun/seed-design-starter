import type { ReactNode } from "react";

import { QueryClientProvider } from "@tanstack/react-query";

import { SnackbarProvider } from "seed-design/ui/snackbar";

import { queryClient } from "./query-client";

export interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>{children}</SnackbarProvider>
    </QueryClientProvider>
  );
}
