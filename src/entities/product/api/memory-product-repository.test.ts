import { describe, expect, it } from "vitest";

import { createMemoryProductRepository } from "./memory-product-repository";

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
