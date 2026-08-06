import { useCallback, useState } from "react";

import { useTranslation } from "react-i18next";

import type { NewProduct, ProductCategory } from "@/entities/product";

export interface ProductFormValues {
  title: string;
  price: string;
  description: string;
  category: ProductCategory;
  negotiable: boolean;
}

export type ProductFormErrors = Partial<Record<"title" | "price", string>>;

const INITIAL_VALUES: ProductFormValues = {
  title: "",
  price: "",
  description: "",
  category: "digital",
  negotiable: false,
};

const MAX_TITLE_LENGTH = 40;

export interface UseProductFormResult {
  values: ProductFormValues;
  errors: ProductFormErrors;
  setValue: <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => void;
  reset: () => void;
  validate: () => NewProduct | null;
}

export function useProductForm(): UseProductFormResult {
  const { t } = useTranslation("product");
  const [values, setValues] = useState<ProductFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<ProductFormErrors>({});

  const setValue = useCallback<UseProductFormResult["setValue"]>((key, value) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  }, []);

  const reset = useCallback(() => {
    setValues(INITIAL_VALUES);
    setErrors({});
  }, []);

  const validate = useCallback((): NewProduct | null => {
    const nextErrors: ProductFormErrors = {};
    const title = values.title.trim();
    const price = Number(values.price);

    if (title.length === 0) {
      nextErrors.title = t("validation.titleRequired");
    } else if (title.length > MAX_TITLE_LENGTH) {
      nextErrors.title = t("validation.titleTooLong");
    }

    if (values.price.trim().length === 0) {
      nextErrors.price = t("validation.priceRequired");
    } else if (!Number.isFinite(price) || price < 0) {
      nextErrors.price = t("validation.priceInvalid");
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return null;
    }

    return {
      title,
      price,
      description: values.description.trim(),
      category: values.category,
      negotiable: values.negotiable,
    };
  }, [t, values]);

  return { values, errors, setValue, reset, validate };
}
