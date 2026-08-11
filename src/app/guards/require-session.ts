import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";

import { sessionQuery } from "@/entities/session";

/** Route guard shared by screens that require the signed-in account. */
export async function requireSession(queryClient: QueryClient) {
  const session = await queryClient.ensureQueryData(sessionQuery());
  if (!session) redirect({ to: "/login", throw: true });
}
