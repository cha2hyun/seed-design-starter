import type { LoginCredentials, Session, SessionUser } from "../model/types";

export const DEMO_USER: SessionUser = {
  id: "demo-user",
  name: "당근이",
  email: "karrot@example.com",
};

export const DEMO_SESSION: Session = { user: DEMO_USER };

const STORAGE_KEY = "seed-starter.demo-session.v1";
const SIGNED_IN = "signed-in";
const SIGNED_OUT = "signed-out";

type StoredSessionState = typeof SIGNED_IN | typeof SIGNED_OUT | "absent" | "invalid";

function getStorage(name: "localStorage" | "sessionStorage"): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return window[name];
  } catch {
    return null;
  }
}

function readStoredState(storage: Storage | null): StoredSessionState {
  if (!storage) return "absent";

  try {
    const value = storage.getItem(STORAGE_KEY);
    if (value === null) return "absent";
    if (value === SIGNED_IN || value === SIGNED_OUT) return value;
    return "invalid";
  } catch {
    return "invalid";
  }
}

function writeStoredState(storage: Storage | null, state: typeof SIGNED_IN | typeof SIGNED_OUT) {
  try {
    storage?.setItem(STORAGE_KEY, state);
  } catch {
    // The in-memory session still works when storage is blocked by the browser.
  }
}

function removeStoredState(storage: Storage | null) {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    // Nothing else can be done when storage is unavailable.
  }
}

function restoreSession(): Session | null {
  // A non-remembered login is tab-scoped and deliberately wins over the durable signed-out
  // marker that prevents other tabs from falling back to the first-run demo session.
  const tabState = readStoredState(getStorage("sessionStorage"));
  if (tabState === SIGNED_IN) return DEMO_SESSION;
  if (tabState !== "absent") return null;

  const durableState = readStoredState(getStorage("localStorage"));
  if (durableState === SIGNED_IN) return DEMO_SESSION;
  if (durableState !== "absent") return null;

  // An entirely fresh starter still opens with the signed-in demo account.
  return DEMO_SESSION;
}

let activeSession: Session | null = restoreSession();

/** Synchronous seed for the query cache so account navigation does not flash while booting. */
export function getSessionSnapshot(): Session | null {
  return activeSession;
}

/** In-memory stand-in for a server session endpoint. */
export function fetchSession(): Promise<Session | null> {
  return Promise.resolve(activeSession);
}

/**
 * The demo accepts any valid-looking credentials and returns the fixture account. A real app
 * should replace this function with its authentication endpoint and never retain the password.
 */
export function login(credentials: LoginCredentials): Promise<Session> {
  activeSession = DEMO_SESSION;

  if (credentials.rememberMe) {
    writeStoredState(getStorage("localStorage"), SIGNED_IN);
    removeStoredState(getStorage("sessionStorage"));
  } else {
    // Keep this tab signed in, while a new tab or browser restart remains signed out.
    writeStoredState(getStorage("localStorage"), SIGNED_OUT);
    writeStoredState(getStorage("sessionStorage"), SIGNED_IN);
  }

  return Promise.resolve(activeSession);
}

export function logout(): Promise<null> {
  activeSession = null;
  writeStoredState(getStorage("localStorage"), SIGNED_OUT);
  removeStoredState(getStorage("sessionStorage"));
  return Promise.resolve(null);
}
