import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { RouterProvider } from "@tanstack/react-router";

import "@/shared/i18n";

import { AppProviders, createQueryClient } from "./providers";
import { createAppRouter } from "./router";
import "./styles/global.css";

const queryClient = createQueryClient();
const router = createAppRouter({ queryClient });

const container = document.getElementById("root");
if (!container) {
  throw new Error("#root is missing from index.html");
}

createRoot(container).render(
  <StrictMode>
    <AppProviders queryClient={queryClient} router={router}>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
