"use client";

import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Minus, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { getLocaleDirection } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

export const MIN_CUSTOM_HOURS = 3;
export const MAX_CUSTOM_HOURS = 24;

type CustomTimePickerProps = {
  hours: number;
  onHoursChange: (hours: number) => void;
  className?: string;
};

export function CustomTimePicker({
  hours,
  onHoursChange,
  className,
}: CustomTimePickerProps) {
  const t = useTranslations("HomePage");
  const dir = getLocaleDirection(useLocale());
  const hoursLabel = hours === 1 ? t("hourUnit") : t("hoursUnit");

  const setClamped = (next: number) => {
    onHoursChange(Math.min(MAX_CUSTOM_HOURS, Math.max(MIN_CUSTOM_HOURS, next)));
  };

  return (
    <div
      className={cn(
        "mt-4 w-full max-w-xl rounded-2xl p-5 shadow-sm md:p-6",
        "border-2 border-primary-200 ",
        "dark:border-primary-800/60 dark:bg-primary-900/40",
        className,
      )}
    >
      <div
        className={cn(
          "space-y-1 border-b pb-4",
          "border-primary-200/80 dark:border-primary-800/50",
        )}
      >
        <h3
          className={cn(
            "text-base font-bold md:text-lg",
            "text-primary-800 dark:text-primary-100",
          )}
        >
          {t("selectCustomTime")}
        </h3>
        <p
          className={cn(
            "text-sm",
            "text-primary-700/80 dark:text-primary-300/85",
          )}
        >
          {t("maxTimeSelection", { count: MAX_CUSTOM_HOURS })}
        </p>
      </div>

      <div className="mt-5 flex items-center gap-4 md:gap-5">
        <Button
          type="button"
          size="icon"
          className={cn(
            "size-11 shrink-0 rounded-full md:size-12",
            "bg-primary-500 text-primary-foreground",
            "hover:bg-primary-600 dark:bg-primary-500 dark:hover:bg-primary-400",
          )}
          disabled={hours <= MIN_CUSTOM_HOURS}
          onClick={() => setClamped(hours - 1)}
          aria-label={t("decreaseHours")}
        >
          <Minus className="size-5" aria-hidden />
        </Button>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex justify-center">
            <span
              className={cn(
                "rounded-full px-4 py-1.5 text-lg font-bold tabular-nums md:text-xl",
                "bg-primary-500 text-primary-foreground",
                "dark:bg-primary-500 dark:text-primary-foreground",
              )}
            >
              {hours} {hoursLabel}
            </span>
          </div>

          <DirectionProvider direction={dir}>
            <Slider
              className="w-full"
              min={MIN_CUSTOM_HOURS}
              max={MAX_CUSTOM_HOURS}
              step={1}
              value={[hours]}
              onValueChange={(values) => {
                const next = Array.isArray(values) ? values[0] : values;
                if (typeof next === "number") {
                  setClamped(next);
                }
              }}
              aria-label={t("selectCustomTime")}
            />
          </DirectionProvider>

          <div
            className={cn(
              "flex justify-between text-sm font-medium",
              "text-primary-700/90 dark:text-muted-foreground",
            )}
          >
            <span>
              {MIN_CUSTOM_HOURS} {t("hoursUnit")}
            </span>
            <span>
              {MAX_CUSTOM_HOURS} {t("hoursUnit")}
            </span>
          </div>
        </div>

        <Button
          type="button"
          size="icon"
          className={cn(
            "size-11 shrink-0 rounded-full md:size-12",
            "bg-primary-500 text-primary-foreground",
            "hover:bg-primary-600 dark:bg-primary-500 dark:hover:bg-primary-400",
          )}
          disabled={hours >= MAX_CUSTOM_HOURS}
          onClick={() => setClamped(hours + 1)}
          aria-label={t("increaseHours")}
        >
          <Plus className="size-5" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
