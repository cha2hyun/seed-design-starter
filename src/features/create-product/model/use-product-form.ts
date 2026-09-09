import { useCallback, useState } from "react";

import type { NewProduct } from "@/entities/product";

import {
  INITIAL_PRODUCT_FORM_VALUES,
  type ProductFormErrors,
  type ProductFormValues,
  validateProductForm,
} from "./product-form";

export interface UseProductFormResult {
  values: ProductFormValues;
  errors: ProductFormErrors;
  setValue: <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => void;
  reset: () => void;
  validate: () => NewProduct | null;
}

export function useProductForm(): UseProductFormResult {
  const [values, setValues] = useState<ProductFormValues>(INITIAL_PRODUCT_FORM_VALUES);
  const [errors, setErrors] = useState<ProductFormErrors>({});

  const setValue = useCallback<UseProductFormResult["setValue"]>((key, value) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    if (key === "title" || key === "price") {
      setErrors((previous) => ({ ...previous, [key]: undefined }));
    }
  }, []);

  const reset = useCallback(() => {
    setValues(INITIAL_PRODUCT_FORM_VALUES);
    setErrors({});
  }, []);

  const validate = useCallback((): NewProduct | null => {
    const result = validateProductForm(values);
    setErrors(result.valid ? {} : result.errors);
    return result.valid ? result.product : null;
  }, [values]);

  return { values, errors, setValue, reset, validate };
}
