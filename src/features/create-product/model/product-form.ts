import { countGraphemes } from "unicode-segmenter/grapheme";

import type { NewProduct, ProductCategory } from "@/entities/product";

export interface ProductFormValues {
  title: string;
  price: string;
  description: string;
  category: ProductCategory;
  negotiable: boolean;
}

export interface ProductFormErrors {
  title?: "titleRequired" | "titleTooLong";
  price?: "priceRequired" | "priceInvalid";
}

export const INITIAL_PRODUCT_FORM_VALUES: ProductFormValues = {
  title: "",
  price: "",
  description: "",
  category: "digital",
  negotiable: false,
};

export const MAX_PRODUCT_TITLE_LENGTH = 40;

type ProductFormValidation =
  { valid: true; product: NewProduct } | { valid: false; errors: ProductFormErrors };

export function validateProductForm(values: ProductFormValues): ProductFormValidation {
  const errors: ProductFormErrors = {};
  const title = values.title.trim();
  const price = Number(values.price);

  if (title.length === 0) {
    errors.title = "titleRequired";
  } else if (countGraphemes(title) > MAX_PRODUCT_TITLE_LENGTH) {
    // Match SEED TextField's Unicode segmentation for emoji and combining characters.
    errors.title = "titleTooLong";
  }

  if (values.price.trim().length === 0) {
    errors.price = "priceRequired";
  } else if (!Number.isFinite(price) || price < 0) {
    errors.price = "priceInvalid";
  }

  if (Object.keys(errors).length > 0) return { valid: false, errors };

  return {
    valid: true,
    product: {
      title,
      price,
      description: values.description.trim(),
      category: values.category,
      negotiable: values.negotiable,
    },
  };
}
