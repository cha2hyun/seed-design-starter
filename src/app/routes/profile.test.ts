import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { DEMO_SESSION } from "@/entities/session";

import { queryKeys } from "@/shared/api";

import { requireSession } from "../guards/require-session";

function createSessionClient(session: typeof DEMO_SESSION | null) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClient.setQueryData(queryKeys.session.current, session);
  return queryClient;
}

describe("profile route guard", () => {
  it("allows a signed-in session", async () => {
    await expect(requireSession(createSessionClient(DEMO_SESSION))).resolves.toBeUndefined();
  });

  it("redirects a signed-out visitor to login", async () => {
    await expect(requireSession(createSessionClient(null))).rejects.toMatchObject({
      status: 307,
      options: { to: "/login" },
    });
  });
});
