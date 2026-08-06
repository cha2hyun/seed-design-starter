import { HttpError, request } from "@/shared/api";

import type { NewProduct, Product, ProductListFilter } from "../model/types";

const seed: Product[] = [
  {
    id: "p-1",
    title: "3년 쓴 캠핑 의자",
    price: 25000,
    description:
      "접이식 캠핑 의자입니다. 프레임은 튼튼하고 원단에 사용감이 조금 있어요. 직거래만 가능합니다.",
    category: "outdoor",
    status: "onSale",
    negotiable: true,
    sellerName: "당근이",
    region: "역삼동",
    createdAt: new Date(Date.now() - 3 * 3_600_000).toISOString(),
  },
  {
    id: "p-2",
    title: "기계식 키보드 (적축)",
    price: 68000,
    description: "1년 정도 사용했고 키캡은 새것으로 교체했습니다. 박스와 케이블 모두 있어요.",
    category: "digital",
    status: "reserved",
    negotiable: false,
    sellerName: "키보드러버",
    region: "삼성동",
    createdAt: new Date(Date.now() - 26 * 3_600_000).toISOString(),
  },
  {
    id: "p-3",
    title: "원목 4인 식탁",
    price: 140000,
    description: "이사하면서 내놓습니다. 상판 스크래치 거의 없고 의자는 포함되지 않습니다.",
    category: "furniture",
    status: "sold",
    negotiable: false,
    sellerName: "이사가는중",
    region: "논현동",
    createdAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
  },
  {
    id: "p-4",
    title: "리팩터링 2판",
    price: 22000,
    description: "밑줄 없이 깨끗합니다. 서점 가격보다 저렴하게 드려요.",
    category: "book",
    status: "onSale",
    negotiable: true,
    sellerName: "책벌레",
    region: "대치동",
    createdAt: new Date(Date.now() - 40 * 60_000).toISOString(),
  },
];

/** In-memory stand-in for a backend. Replace with real HTTP calls. */
const store = new Map(seed.map((product) => [product.id, product]));

export function fetchProducts(filter: ProductListFilter): Promise<Product[]> {
  return request(() => {
    const all = [...store.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (filter === "all") return all;
    if (filter === "sold") return all.filter((product) => product.status === "sold");
    return all.filter((product) => product.status !== "sold");
  });
}

export function fetchProduct(productId: string): Promise<Product> {
  return request(() => {
    const product = store.get(productId);
    if (!product) {
      throw new HttpError(404, `Product ${productId} does not exist`);
    }
    return product;
  });
}

export function createProduct(input: NewProduct): Promise<Product> {
  return request(() => {
    const product: Product = {
      ...input,
      id: `p-${store.size + 1}-${Date.now()}`,
      status: "onSale",
      sellerName: "나",
      region: "역삼동",
      createdAt: new Date().toISOString(),
    };
    store.set(product.id, product);
    return product;
  });
}
