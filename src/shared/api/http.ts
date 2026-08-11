export interface HttpErrorOptions {
  body?: unknown;
  cause?: unknown;
}

/** A transport error with a stable shape for route and mutation error handling. */
export class HttpError extends Error {
  readonly status: number;
  readonly body?: unknown;

  constructor(status: number, message: string, options: HttpErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = "HttpError";
    this.status = status;
    this.body = options.body;
  }
}

export interface RequestOptions extends RequestInit {
  baseUrl: string;
}

function resolveUrl(baseUrl: string, path: string): string {
  const normalizedPath = path.replace(/^\/+/, "");
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");

  if (/^[a-z][a-z\d+.-]*:/i.test(normalizedBaseUrl)) {
    return new URL(normalizedPath, `${normalizedBaseUrl}/`).toString();
  }

  return `${normalizedBaseUrl}/${normalizedPath}`;
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;

  const text = await response.text();
  if (!text) return undefined;

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new HttpError(response.status, "The server returned invalid JSON", { body: text });
    }
  }

  return text;
}

function getErrorMessage(response: Response, body: unknown): string {
  if (typeof body === "object" && body !== null && "message" in body) {
    const message = Reflect.get(body, "message");
    if (typeof message === "string" && message.length > 0) return message;
  }

  if (typeof body === "string" && body.length > 0) return body;
  return response.statusText || `HTTP ${response.status}`;
}

/**
 * JSON transport used by HTTP-backed repositories.
 *
 * HTTP failures and network failures are normalized to `HttpError`; aborts stay as
 * abort errors so TanStack Query can treat cancellation separately from a failed request.
 */
export async function request<T>(path: string, options: RequestOptions): Promise<T> {
  const { baseUrl, headers, ...init } = options;
  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has("Accept")) requestHeaders.set("Accept", "application/json");
  if (init.body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(resolveUrl(baseUrl, path), {
      ...init,
      headers: requestHeaders,
    });
    const body = await readBody(response);

    if (!response.ok) {
      throw new HttpError(response.status, getErrorMessage(response, body), { body });
    }

    return body as T;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (options.signal?.aborted) throw error;

    throw new HttpError(0, "The network request failed", { cause: error });
  }
}
