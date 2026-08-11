import { beforeEach, describe, expect, it, vi } from "vitest";

const credentials = {
  email: "karrot@example.com",
  password: "never-store-this-password",
  rememberMe: true,
};

async function loadSessionApi() {
  vi.resetModules();
  return import("./session-api");
}

function storedValues(storage: Storage): string[] {
  return Array.from({ length: storage.length }, (_, index) => storage.key(index))
    .filter((key): key is string => key !== null)
    .map((key) => storage.getItem(key) ?? "");
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe("demo session persistence", () => {
  it("uses the signed-in demo only when storage has never recorded a choice", async () => {
    const { DEMO_SESSION, fetchSession } = await loadSessionApi();

    await expect(fetchSession()).resolves.toEqual(DEMO_SESSION);
  });

  it("keeps logout across a hard refresh", async () => {
    const sessionApi = await loadSessionApi();
    await sessionApi.login({ ...credentials, rememberMe: false });
    await sessionApi.logout();

    expect(sessionStorage).toHaveLength(0);
    const refreshedApi = await loadSessionApi();
    await expect(refreshedApi.fetchSession()).resolves.toBeNull();
  });

  it("persists a remembered login without storing credentials", async () => {
    const sessionApi = await loadSessionApi();
    await sessionApi.logout();
    await sessionApi.login(credentials);

    const persisted = [...storedValues(localStorage), ...storedValues(sessionStorage)].join(" ");
    expect(persisted).not.toContain(credentials.password);
    expect(persisted).not.toContain(credentials.email);
    expect(sessionStorage).toHaveLength(0);

    const refreshedApi = await loadSessionApi();
    await expect(refreshedApi.fetchSession()).resolves.toEqual(refreshedApi.DEMO_SESSION);
  });

  it("keeps a non-remembered login only for the current tab session", async () => {
    const sessionApi = await loadSessionApi();
    await sessionApi.logout();
    await sessionApi.login({ ...credentials, rememberMe: false });

    const persisted = [...storedValues(localStorage), ...storedValues(sessionStorage)].join(" ");
    expect(persisted).not.toContain(credentials.password);
    expect(persisted).not.toContain(credentials.email);

    const refreshedInTab = await loadSessionApi();
    await expect(refreshedInTab.fetchSession()).resolves.toEqual(refreshedInTab.DEMO_SESSION);

    sessionStorage.clear();
    const reopenedApi = await loadSessionApi();
    await expect(reopenedApi.fetchSession()).resolves.toBeNull();
  });

  it("fails closed when a stored marker is unrecognized", async () => {
    localStorage.setItem("seed-starter.demo-session.v1", "corrupted");

    const sessionApi = await loadSessionApi();
    await expect(sessionApi.fetchSession()).resolves.toBeNull();
  });
});
