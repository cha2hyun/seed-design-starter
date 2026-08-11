import { QueryClient, type QueryClientConfig } from "@tanstack/react-query";

import { HttpError } from "@/shared/api";

export function createQueryClient(config: QueryClientConfig = {}): QueryClient {
  return new QueryClient({
    ...config,
    defaultOptions: {
      ...config.defaultOptions,
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => {
          if (error instanceof HttpError && error.status > 0 && error.status < 500) return false;
          return failureCount < 1;
        },
        refetchOnWindowFocus: false,
        ...config.defaultOptions?.queries,
      },
    },
  });
}
