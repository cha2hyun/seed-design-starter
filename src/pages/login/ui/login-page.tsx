import { type FormEvent, useState } from "react";

import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ActionButton } from "seed-design/ui/action-button";
import { Checkbox } from "seed-design/ui/checkbox";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";

import { useDocumentTitle } from "@/shared/lib";
import { Icon, IconShieldCheck, PageSection } from "@/shared/ui";

export function LoginPage() {
  const { t } = useTranslation("login");
  useDocumentTitle(t("title"));
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // SEED's `required` is aria-only — `useField` emits `aria-required` and deliberately never
  // the native attribute (its own test asserts this), so the browser enforces nothing here.
  const canSubmit = email.trim() !== "" && password !== "";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    void navigate({ to: "/profile" });
  };

  return (
    <PageSection
      title={t("title")}
      description={t("description")}
      className="mx-auto w-full max-w-form"
      headingAs="h1"
    >
      <div className="flex flex-col gap-x6 rounded-r5 bg-bg-layer-default p-x6 shadow-s2">
        <div className="flex flex-col items-center gap-x3">
          <span
            aria-hidden="true"
            className="inline-flex size-x12 items-center justify-center rounded-full bg-bg-brand-weak text-fg-brand"
          >
            <Icon svg={<IconShieldCheck />} size="x6" />
          </span>
          <h2 className="text-center t7-bold text-fg-neutral">{t("heading")}</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-x4">
          <TextField label={t("field.email")} required>
            <TextFieldInput
              type="email"
              name="email"
              autoComplete="email"
              placeholder={t("field.emailPlaceholder")}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </TextField>

          <TextField label={t("field.password")} required>
            <TextFieldInput
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder={t("field.passwordPlaceholder")}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </TextField>

          <Checkbox
            label={t("field.rememberMe")}
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
          />

          <ActionButton
            type="submit"
            variant="brandSolid"
            size="large"
            className="mt-x2"
            disabled={!canSubmit}
          >
            {t("action.submit")}
          </ActionButton>
        </form>

        <div className="my-x1 flex items-center gap-x3" aria-hidden="true">
          <div className="h-px flex-1 bg-stroke-neutral-muted" />
          <span className="t2-regular text-fg-neutral-muted">{t("divider")}</span>
          <div className="h-px flex-1 bg-stroke-neutral-muted" />
        </div>

        <div className="flex flex-col gap-x2">
          <ActionButton type="button" variant="neutralOutline" size="medium">
            {t("action.kakao")}
          </ActionButton>
          <ActionButton type="button" variant="neutralOutline" size="medium">
            {t("action.apple")}
          </ActionButton>
        </div>
      </div>
    </PageSection>
  );
}
