import type { Product } from "../model/types";

export function createSeedProducts(): Product[] {
  return [
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
}
