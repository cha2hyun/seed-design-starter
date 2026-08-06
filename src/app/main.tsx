import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { RouterProvider } from "@tanstack/react-router";

import "@/shared/i18n";

import { AppProviders } from "./providers";
import { router } from "./router";
import "./styles/global.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("#root is missing from index.html");
}

createRoot(container).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
