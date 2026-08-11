import { afterEach, describe, expect, it, vi } from "vitest";

import { createHttpProductRepository, createMemoryProductRepository } from "./product-api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("memory product repository", () => {
  it("persists a created product and returns it from detail and list queries", async () => {
    const repository = createMemoryProductRepository({ latencyMs: 0, products: [] });

    const created = await repository.createProduct({
      title: "테스트 상품",
      price: 12000,
      description: "깨끗하게 사용했어요.",
      category: "digital",
      negotiable: true,
    });

    await expect(repository.fetchProduct(created.id)).resolves.toEqual(created);
    await expect(repository.fetchProducts("all")).resolves.toEqual([created]);
  });

  it("uses the same normalized 404 error shape as the HTTP repository", async () => {
    const repository = createMemoryProductRepository({ latencyMs: 0, products: [] });

    await expect(repository.fetchProduct("missing")).rejects.toMatchObject({
      name: "HttpError",
      status: 404,
    });
  });

  it("stops an in-flight request when its signal is aborted", async () => {
    const repository = createMemoryProductRepository({ latencyMs: 100, products: [] });
    const controller = new AbortController();
    const promise = repository.fetchProducts("all", controller.signal);

    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: "AbortError" });
  });
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
