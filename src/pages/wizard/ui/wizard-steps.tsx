import { cn } from "@/shared/lib";
import { Icon, IconCheck } from "@/shared/ui";

export interface WizardStepsProps {
  /** Ordered step labels, already translated. */
  labels: string[];
  currentIndex: number;
  /** Accessible name for the whole list, e.g. "Step 2 of 3". */
  listLabel: string;
  /** Spoken state suffixes — the ring colour and tick are not readable alone. */
  completedLabel: string;
  currentLabel: string;
}

/**
 * Numbered stepper: a node per step joined by connectors, so progress reads as a
 * sequence rather than three unrelated pills. Completed nodes fill in and swap the
 * number for a tick; the connector behind them fills to the same brand colour.
 */
export function WizardSteps({
  labels,
  currentIndex,
  listLabel,
  completedLabel,
  currentLabel,
}: WizardStepsProps) {
  return (
    <ol aria-label={listLabel} className="flex items-start">
      {labels.map((label, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li
            key={label}
            aria-current={isCurrent ? "step" : undefined}
            className="flex min-w-0 flex-1 flex-col items-center gap-x2"
          >
            <div className="flex w-full items-center" aria-hidden="true">
              <Connector filled={index > 0 && (isDone || isCurrent)} hidden={index === 0} />
              <span
                className={cn(
                  "inline-flex size-x8 shrink-0 items-center justify-center rounded-full t3-bold",
                  isDone && "bg-bg-brand-solid text-palette-static-white",
                  isCurrent &&
                    "bg-bg-brand-weak text-fg-brand-contrast outline outline-2 outline-stroke-brand-solid",
                  !isDone && !isCurrent && "bg-bg-neutral-weak text-fg-neutral-muted",
                )}
              >
                {isDone ? <Icon svg={<IconCheck />} size="x4" /> : index + 1}
              </span>
              <Connector filled={isDone} hidden={index === labels.length - 1} />
            </div>

            {/*
              The weights are mutually exclusive, not layered. `cn` is plain clsx by design,
              so `t2-medium t2-bold` keeps both classes and the winner is decided by their
              order in the stylesheet — where Tailwind sorts `t2-bold` first and `t2-medium`
              therefore overrides it, leaving the current step no heavier than the rest.
            */}
            <span
              className={cn(
                "w-full text-center",
                isCurrent ? "t2-bold text-fg-neutral" : "t2-medium text-fg-neutral-muted",
              )}
            >
              {label}
              {isDone && <span className="sr-only"> {completedLabel}</span>}
              {isCurrent && <span className="sr-only"> {currentLabel}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Connector({ filled, hidden }: { filled: boolean; hidden: boolean }) {
  return (
    <span
      className={cn(
        "h-x0_5 flex-1 rounded-full",
        hidden && "invisible",
        filled ? "bg-bg-brand-solid" : "bg-bg-neutral-weak",
      )}
    />
  );
}
