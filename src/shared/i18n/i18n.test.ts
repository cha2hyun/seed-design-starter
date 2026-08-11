import { describe, expect, it } from "vitest";

import { changeLanguage, getCurrentLanguage } from "./i18n";

describe("i18n", () => {
  it("sets document.documentElement.lang on load, not only on a later change", () => {
    // The listener is registered after init(), and with inline resources init() resolves
    // synchronously and has already emitted `languageChanged`. Importing the module has to
    // set the attribute itself, or an English user keeps the `lang="ko"` from index.html.
    expect(document.documentElement.lang).toBe(getCurrentLanguage());
  });

  it("keeps the attribute in step with the language", () => {
    changeLanguage("en");
    expect(getCurrentLanguage()).toBe("en");
    expect(document.documentElement.lang).toBe("en");

    changeLanguage("ko");
    expect(document.documentElement.lang).toBe("ko");
  });

  it("normalises an unsupported language to the default", () => {
    // @ts-expect-error -- exercising the runtime guard with a value the types forbid
    changeLanguage("fr");
    expect(getCurrentLanguage()).toBe("ko");
  });
});
