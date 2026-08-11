import { createFileRoute } from "@tanstack/react-router";

import { WizardPage } from "@/pages/wizard";

export const Route = createFileRoute("/wizard")({
  component: WizardPage,
});
