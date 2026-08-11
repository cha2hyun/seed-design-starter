import { createFileRoute } from "@tanstack/react-router";

import { ProfilePage } from "@/pages/profile";

import { requireSession } from "../guards/require-session";

export const Route = createFileRoute("/profile")({
  beforeLoad: ({ context }) => requireSession(context.queryClient),
  component: ProfilePage,
});
