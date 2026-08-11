(() => {
  const colorModes = new Set(["system", "light-only", "dark-only"]);
  const root = document.documentElement;
  let colorMode = "system";

  try {
    const stored = window.localStorage.getItem("seed-starter:color-mode");
    const parsed = stored ? JSON.parse(stored) : null;
    const candidate = parsed?.state?.colorMode;

    if (colorModes.has(candidate)) colorMode = candidate;
  } catch {
    // Storage may be disabled or contain malformed data. The system default is safe.
  }

  let userColorScheme = "light";

  try {
    userColorScheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    // Very old browsers without matchMedia receive SEED's light palette.
  }

  root.setAttribute("data-seed-color-mode", colorMode);
  root.setAttribute("data-seed-user-color-scheme", userColorScheme);
})();
