import type { ReactNode } from "react";

import { QueryClient, QueryClientProvider, useMutation } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { NewProduct, Product } from "@/entities/product";

import { CreateProductForm } from "./create-product-form";

const createProductMock = vi.hoisted(() => vi.fn<(input: NewProduct) => Promise<Product>>());

vi.mock("@/entities/product", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/product")>();

  return {
    ...actual,
    useCreateProductMutation: () =>
      useMutation<Product, Error, NewProduct>({ mutationFn: createProductMock }),
  };
});

function renderForm(onCreated = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return {
    onCreated,
    user: userEvent.setup(),
    ...render(<CreateProductForm onCreated={onCreated} />, { wrapper }),
  };
}

beforeEach(() => {
  createProductMock.mockReset();
});

describe("CreateProductForm", () => {
  it("reports creation failures and keeps the user's entries for retry", async () => {
    createProductMock.mockRejectedValue(new Error("Service unavailable"));
    const { onCreated, user } = renderForm();
    const title = screen.getByRole("textbox", { name: /제목/ });
    const price = screen.getByRole("textbox", { name: /가격/ });

    await user.type(title, "보존할 상품명");
    await user.type(price, "15000");
    await user.click(screen.getByRole("button", { name: "등록하기" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("상품을 등록하지 못했어요");
    expect(title).toHaveValue("보존할 상품명");
    expect(price).toHaveValue("15000");
    expect(onCreated).not.toHaveBeenCalled();
  });

  it("calls onCreated and clears entries after a successful creation", async () => {
    const created: Product = {
      id: "p-created",
      title: "등록할 상품",
      price: 15000,
      description: "",
      category: "digital",
      negotiable: false,
      status: "onSale",
      sellerName: "나",
      region: "역삼동",
      createdAt: new Date().toISOString(),
    };
    createProductMock.mockResolvedValue(created);
    const { onCreated, user } = renderForm();
    const title = screen.getByRole("textbox", { name: /제목/ });
    const price = screen.getByRole("textbox", { name: /가격/ });

    await user.type(title, created.title);
    await user.type(price, String(created.price));
    await user.click(screen.getByRole("button", { name: "등록하기" }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(created));
    expect(title).toHaveValue("");
    expect(price).toHaveValue("");
  });
});
