import { afterEach, describe, expect, it, vi } from "vitest";

import { createHttpProductRepository } from "./http-product-repository";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("HTTP product repository", () => {
  it("passes filters and abort signals through the transport boundary", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("[]", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const repository = createHttpProductRepository("https://api.example.com/v1");
    const controller = new AbortController();

    await repository.fetchProducts("onSale", controller.signal);

    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.example.com/v1/products?filter=onSale");
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ signal: controller.signal });
  });

  it("sends creations as JSON and returns the server product", async () => {
    const created = {
      id: "p-server",
      title: "서버 상품",
      price: 9000,
      description: "",
      category: "book" as const,
      negotiable: false,
      status: "onSale" as const,
      sellerName: "서버 판매자",
      region: "역삼동",
      createdAt: new Date().toISOString(),
    };
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(created), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const repository = createHttpProductRepository("https://api.example.com");
    const input = {
      title: created.title,
      price: created.price,
      description: created.description,
      category: created.category,
      negotiable: created.negotiable,
    };

    await expect(repository.createProduct(input)).resolves.toEqual(created);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.example.com/products");
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      method: "POST",
      body: JSON.stringify(input),
    });
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get("Content-Type")).toBe(
      "application/json",
    );
  });
});
