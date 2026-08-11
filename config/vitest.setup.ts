import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

// Keep setup imports independent from Vite alias resolution.
import { DEFAULT_LANGUAGE } from "../src/shared/config";
import { changeLanguage } from "../src/shared/i18n";

// SEED components read layout via APIs jsdom does not implement. Without these the
// components throw on mount and every test fails for a reason unrelated to the test.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// TanStack Router restores scroll after navigation. jsdom exposes this method but its
// implementation only reports a "Not implemented" error, which obscures real test failures.
window.scrollTo = () => {};

// Language is global state on the shared i18n instance, so a test that switches to English
// would otherwise leak into whichever test runs next.
beforeEach(() => {
  changeLanguage(DEFAULT_LANGUAGE);
});

afterEach(() => {
  cleanup();
});
