export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

const LATENCY_MS = 400;

/**
 * Stands in for a real transport so the blueprint stays runnable with no backend.
 * Swap the body for `fetch` and the call sites keep working.
 */
export async function request<T>(resolve: () => T): Promise<T> {
  await new Promise((done) => setTimeout(done, LATENCY_MS));
  return resolve();
}
