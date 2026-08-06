import { create } from "zustand";

import type { ProductListFilter } from "@/entities/product";

interface ProductFilterState {
  filter: ProductListFilter;
  setFilter: (filter: ProductListFilter) => void;
}

/** Kept out of the URL on purpose: it is a transient view preference, not shareable state. */
export const useProductFilterStore = create<ProductFilterState>((set) => ({
  filter: "all",
  setFilter: (filter) => set({ filter }),
}));
