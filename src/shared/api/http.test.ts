import { afterEach, describe, expect, it, vi } from "vitest";

import { request } from "./http";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("request", () => {
  it("resolves relative API paths and parses successful JSON responses", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ id: "p-1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      request<{ id: string }>("products/p-1", {
        baseUrl: "https://api.example.com/v1",
      }),
    ).resolves.toEqual({ id: "p-1" });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.example.com/v1/products/p-1");
  });

  it("supports a same-origin relative API base", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("[]", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await request("products", { baseUrl: "/api" });

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/products");
  });

  it("normalizes non-success responses to HttpError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ message: "Product is unavailable" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const promise = request("products/p-1", { baseUrl: "https://api.example.com" });

    await expect(promise).rejects.toMatchObject({
      name: "HttpError",
      status: 503,
      message: "Product is unavailable",
      body: { message: "Product is unavailable" },
    });
  });

  it("normalizes network failures while preserving their cause", async () => {
    const cause = new TypeError("Failed to fetch");
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockRejectedValue(cause));

    const promise = request("products", { baseUrl: "https://api.example.com" });

    await expect(promise).rejects.toMatchObject({
      name: "HttpError",
      status: 0,
      message: "The network request failed",
      cause,
    });
  });
});
