import { useState } from "react";

import { useTranslation } from "react-i18next";

import { ActionButton } from "seed-design/ui/action-button";
import { Checkbox } from "seed-design/ui/checkbox";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";

import { useDocumentTitle } from "@/shared/lib";
import { PageSection, StateMessage } from "@/shared/ui";

import { WizardSteps } from "./wizard-steps";

const STEPS = ["account", "preferences", "review"] as const;
type Step = (typeof STEPS)[number];

interface WizardValues {
  name: string;
  email: string;
  notifications: boolean;
  terms: boolean;
}

/** Deliberately permissive: it exists to catch a typo, not to adjudicate RFC 5322. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_VALUES: WizardValues = {
  name: "",
  email: "",
  notifications: true,
  terms: false,
};

export function WizardPage() {
  const { t } = useTranslation(["wizard", "common"]);
  useDocumentTitle(t("wizard:title"));
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<WizardValues>(INITIAL_VALUES);
  const [submitted, setSubmitted] = useState(false);

  const step: Step = STEPS[stepIndex] ?? STEPS[0];
  const isLastStep = stepIndex === STEPS.length - 1;

  // A non-empty string was enough to enable Next, but the browser runs its own constraint
  // validation on `type="email"` before dispatching submit, so a malformed address aborted
  // the submission and the handler never ran — Next simply did nothing. The form now opts out
  // of the native bubble and states the rule itself.
  const emailValid = EMAIL_PATTERN.test(values.email.trim());
  const canAdvance =
    step === "account"
      ? values.name.trim() !== "" && emailValid
      : // Terms live on this step, and the review step no longer renders the Checkbox, so
        // letting it pass unaccepted strands the user at a disabled Submit they cannot fix.
        step !== "preferences" || values.terms;

  const patch = (next: Partial<WizardValues>) => setValues((prev) => ({ ...prev, ...next }));

  const restart = () => {
    setValues(INITIAL_VALUES);
    setStepIndex(0);
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <PageSection
        title={t("wizard:title")}
        description={t("wizard:description")}
        className="mx-auto w-full max-w-form"
        headingAs="h1"
      >
        <StateMessage
          title={t("wizard:submitted.title")}
          description={t("wizard:submitted.description", { name: values.name })}
          action={
            <ActionButton type="button" variant="neutralWeak" size="medium" onClick={restart}>
              {t("wizard:submitted.restart")}
            </ActionButton>
          }
        />
      </PageSection>
    );
  }

  return (
    <PageSection
      title={t("wizard:title")}
      description={t("wizard:description")}
      className="mx-auto w-full max-w-form"
      headingAs="h1"
    >
      <form
        noValidate
        className="flex w-full flex-col gap-x6 rounded-r5 bg-bg-layer-default p-x6 shadow-s2"
        onSubmit={(event) => {
          event.preventDefault();
          if (isLastStep) {
            setSubmitted(true);
          } else if (canAdvance) {
            setStepIndex((index) => index + 1);
          }
        }}
      >
        <div className="border-b border-stroke-neutral-muted pb-x5">
          <WizardSteps
            labels={STEPS.map((name) => t(`wizard:step.${name}`))}
            currentIndex={stepIndex}
            listLabel={t("wizard:progress", { current: stepIndex + 1, total: STEPS.length })}
            completedLabel={t("wizard:step.completed")}
            currentLabel={t("wizard:step.current")}
          />
        </div>

        {step === "account" && (
          <div className="flex flex-col gap-x4">
            <TextField label={t("wizard:field.name")} required>
              <TextFieldInput
                name="name"
                autoComplete="name"
                placeholder={t("wizard:field.namePlaceholder")}
                value={values.name}
                onChange={(event) => patch({ name: event.target.value })}
              />
            </TextField>
            <TextField
              label={t("wizard:field.email")}
              required
              invalid={values.email.trim() !== "" && !emailValid}
              errorMessage={t("wizard:field.emailInvalid")}
            >
              <TextFieldInput
                type="email"
                name="email"
                autoComplete="email"
                placeholder={t("wizard:field.emailPlaceholder")}
                value={values.email}
                onChange={(event) => patch({ email: event.target.value })}
              />
            </TextField>
          </div>
        )}

        {step === "preferences" && (
          <div className="flex flex-col gap-x4">
            <Checkbox
              className="self-start"
              label={t("wizard:field.notifications")}
              variant="ghost"
              tone="neutral"
              size="large"
              checked={values.notifications}
              onCheckedChange={(checked) => patch({ notifications: checked })}
            />
            <Checkbox
              className="self-start"
              label={t("wizard:field.terms")}
              required
              tone="neutral"
              size="large"
              checked={values.terms}
              onCheckedChange={(checked) => patch({ terms: checked })}
            />
          </div>
        )}

        {/* Inset, not elevated: the review box sits inside the form card, so it recedes. */}
        {step === "review" && (
          <section
            aria-labelledby="wizard-review-heading"
            className="flex flex-col gap-x3 rounded-r4 bg-bg-layer-basement p-x4"
          >
            <h2 id="wizard-review-heading" className="t4-bold text-fg-neutral">
              {t("wizard:review.title")}
            </h2>
            {/* No empty fallback: the account step will not advance without both values. */}
            <dl className="flex flex-col gap-x3">
              <ReviewRow label={t("wizard:field.name")} value={values.name} />
              <ReviewRow label={t("wizard:field.email")} value={values.email} />
              <ReviewRow
                label={t("wizard:field.notifications")}
                value={t(values.notifications ? "wizard:review.agreed" : "wizard:review.notAgreed")}
              />
              <ReviewRow
                label={t("wizard:field.terms")}
                value={t(values.terms ? "wizard:review.agreed" : "wizard:review.notAgreed")}
              />
            </dl>
          </section>
        )}

        {/* Full-width targets on a phone, intrinsic width right-aligned from sm up. */}
        <div className="mt-x4 flex items-center gap-x3 sm:justify-end">
          {stepIndex > 0 && (
            <ActionButton
              type="button"
              variant="neutralOutline"
              size="medium"
              className="flex-1 sm:flex-none"
              onClick={() => setStepIndex((index) => index - 1)}
            >
              {t("wizard:action.previous")}
            </ActionButton>
          )}
          <ActionButton
            type="submit"
            variant="brandSolid"
            size="medium"
            className="flex-1 sm:flex-none"
            disabled={!canAdvance}
          >
            {t(isLastStep ? "wizard:action.submit" : "wizard:action.next")}
          </ActionButton>
        </div>
      </form>
    </PageSection>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-x1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-x3">
      <dt className="t3-regular text-fg-neutral-muted">{label}</dt>
      {/*
        The value is user input — an email address has no break opportunity, so without
        `min-w-0` + `wrap-anywhere` it pushes the row past the content column and turns
        into document-level horizontal scroll at phone widths.
      */}
      <dd className="min-w-0 t3-regular wrap-anywhere text-fg-neutral sm:text-right">{value}</dd>
    </div>
  );
}
