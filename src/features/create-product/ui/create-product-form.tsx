import type { FormEvent } from "react";

import { useTranslation } from "react-i18next";

import { ActionButton } from "seed-design/ui/action-button";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectRoot,
  SelectTrigger,
} from "seed-design/ui/select";
import { Switch } from "seed-design/ui/switch";
import { TextField, TextFieldInput, TextFieldTextarea } from "seed-design/ui/text-field";

import {
  type Product,
  PRODUCT_CATEGORIES,
  type ProductCategory,
  useCreateProductMutation,
} from "@/entities/product";

import { useProductForm } from "../model/use-product-form";

export interface CreateProductFormProps {
  onCreated: (product: Product) => void;
}

export function CreateProductForm({ onCreated }: CreateProductFormProps) {
  const { t } = useTranslation("product");
  const { values, errors, setValue, reset, validate } = useProductForm();
  const { mutate, isPending } = useCreateProductMutation();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = validate();
    if (!payload) return;

    mutate(payload, {
      onSuccess: (product) => {
        reset();
        onCreated(product);
      },
    });
  }

  return (
    <form className="flex flex-col gap-x6" onSubmit={handleSubmit} noValidate>
      <TextField
        label={t("create.titleField")}
        invalid={Boolean(errors.title)}
        errorMessage={errors.title}
        maxGraphemeCount={40}
        value={values.title}
        onValueChange={({ value }) => setValue("title", value)}
        showRequiredIndicator
        required
      >
        <TextFieldInput placeholder={t("create.titlePlaceholder")} />
      </TextField>

      <TextField
        label={t("create.priceField")}
        invalid={Boolean(errors.price)}
        errorMessage={errors.price}
        suffix="원"
        value={values.price}
        onValueChange={({ value }) => setValue("price", value)}
        showRequiredIndicator
        required
      >
        <TextFieldInput inputMode="numeric" placeholder={t("create.pricePlaceholder")} />
      </TextField>

      <SelectRoot
        label={t("create.categoryField")}
        value={[values.category]}
        onValueChange={(value) => {
          const [selected] = value;
          if (selected) setValue("category", selected as ProductCategory);
        }}
      >
        <SelectTrigger aria-label={t("create.categoryField")} />
        <SelectContent>
          <SelectGroup>
            {PRODUCT_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category} label={t(`category.${category}`)} />
            ))}
          </SelectGroup>
        </SelectContent>
      </SelectRoot>

      <TextField label={t("create.descriptionField")}>
        <TextFieldTextarea
          placeholder={t("create.descriptionPlaceholder")}
          value={values.description}
          onChange={(event) => setValue("description", event.target.value)}
        />
      </TextField>

      {/* SEED's Switch is `inline-flex` with `space-between`; keeping it self-start
          stops the flex column from stretching the label away from the control. */}
      <Switch
        className="gap-x3 self-start"
        label={t("create.negotiableField")}
        checked={values.negotiable}
        onCheckedChange={(checked) => setValue("negotiable", checked)}
      />

      <ActionButton type="submit" size="large" loading={isPending}>
        {t("create.submit")}
      </ActionButton>
    </form>
  );
}
