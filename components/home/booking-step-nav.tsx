"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Fragment } from "react";

import { BOOKING_STEPS, type BookingStep } from "@/lib/booking-steps";
import { cn } from "@/lib/utils/cn";

const stepCopy = {
  "1": { titleKey: "plateStep" },
  "2": { titleKey: "durationStep" },
  "3": { titleKey: "payment" },
  "4": { titleKey: "confirmationStep" },
} as const;

type BookingStepNavProps = {
  step: BookingStep;
};

export function BookingStepNav({ step }: BookingStepNavProps) {
  const t = useTranslations("HomePage");
  const currentStepNumber = Number(step);

  return (
    <nav
      aria-label={t("stepLabel", { number: step })}
      className="mb-2 flex w-full items-start justify-between gap-0.5 md:gap-2"
    >
      {BOOKING_STEPS.map((value, index) => {
        const copy = stepCopy[value];
        const stepNumber = Number(value);
        const isCompleted = stepNumber < currentStepNumber;
        const isActive = value === step;
        const isUpcoming = stepNumber > currentStepNumber;
        const connectorComplete = index > 0 && stepNumber <= currentStepNumber;

        return (
          <Fragment key={value}>
            {index > 0 ? (
              <div
                className={cn(
                  "mt-3.5 h-1.5 min-w-2 flex-1 rounded-full md:min-w-4 md:h-2",
                  connectorComplete ? "bg-primary-400" : "bg-primary-100",
                )}
                aria-hidden
              />
            ) : null}

            <div className="flex min-w-8 shrink-0 flex-col items-center gap-0.5 md:gap-2 md:min-w-12">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-bold transition-colors md:size-10 md:text-base",
                  isCompleted && "bg-primary-400 text-white",
                  isActive && "bg-primary-600 text-white",
                  isUpcoming &&
                    "border-2 border-primary-200 bg-primary-50 text-primary-400",
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {isCompleted ? (
                  <Check className="size-4 stroke-3 md:size-6" aria-hidden />
                ) : (
                  value
                )}
              </div>

              <span
                className={cn(
                  "max-w-18 text-center text-[10px] font-semibold leading-tight text-muted-foreground sm:max-w-none sm:text-[11px]",
                  !isActive && "invisible",
                )}
              >
                {t(copy.titleKey)}
              </span>
            </div>
          </Fragment>
        );
      })}
    </nav>
  );
}
