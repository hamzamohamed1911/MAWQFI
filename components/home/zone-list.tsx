"use client";

import { useLocale, useTranslations } from "next-intl";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect } from "react";
import { ZoneCard } from "@/components/home/zone-card";
import type { ParkingZone } from "@/lib/zones";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { BookingInput } from "@/lib/schemas/booking.schema";
import { UseFormReturn } from "react-hook-form";
import { getLocaleDirection } from "@/i18n/routing";

type ZoneListProps = {
  zone: ParkingZone | null;
  error?: string | null;
  form: UseFormReturn<BookingInput>;
  onNext: () => void;
};

const MIN_CUSTOM_HOURS = 3;
const MAX_HOURS = 8;

export function ZoneList({ zone, error, form, onNext }: ZoneListProps) {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const dir = getLocaleDirection(locale);
  const [zoneId, setZoneId] = useQueryState(
    "zone",
    parseAsInteger.withOptions({
      history: "replace",
    }),
  );

  const [hours, setHours] = useQueryState(
    "hours",
    parseAsInteger.withDefault(1).withOptions({
      history: "replace",
    }),
  );
  // Sync zone from URL -> form
  useEffect(() => {
    if (zone && zoneId !== zone.id) {
      void setZoneId(zone.id);
    }

    if (zone) {
      form.setValue("zone", zone.id, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [zone, zoneId, setZoneId, form]);

  useEffect(() => {
    if (hours && hours > 0) {
      form.setValue("hours", hours, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [hours, form]);

  const handleTimeChange = (value: string) => {
    const selectedHours = value === "select" ? 3 : Number(value);

    void setHours(selectedHours);

    form.setValue("hours", selectedHours, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const setHoursValue = (nextHours: number) => {
    const clamped = Math.min(MAX_HOURS, Math.max(MIN_CUSTOM_HOURS, nextHours));

    void setHours(clamped);

    form.setValue("hours", clamped, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const customHours = hours && hours > 2 ? hours : MIN_CUSTOM_HOURS;
  const hoursLabel =
    customHours === 1 ? t("hourUnit") : t("hoursUnit");

  return (
    <div>
      <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
        {t("zoneTimeDescription")}
      </p>

      {error ? <p className="mt-4 text-xs text-destructive">{error}</p> : null}

      {zone ? (
        <div className="mt-4 flex flex-col gap-4">
          <ZoneCard zone={zone} />

          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-bold md:text-lg">
              {t("select-time-slot")}
            </h2>

            <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
              {t("selectTimeDescription")}
            </p>

            <RadioGroup
              dir={dir}
              value={
                hours === 1
                  ? "1"
                  : hours === 2
                    ? "2"
                    : hours
                      ? "select"
                      : undefined
              }
              onValueChange={handleTimeChange}
              className="grid w-full grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:gap-4"
            >
              <Label
                htmlFor="1"
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg border p-4 has-data-[state=checked]:border-primary"
              >
                <RadioGroupItem value="1" id="1" />
                <span>{t("oneHour")}</span>
              </Label>

              <Label
                htmlFor="2"
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg border p-4 has-data-[state=checked]:border-primary"
              >
                <RadioGroupItem value="2" id="2" />
                <span>{t("twoHours")}</span>
              </Label>

              <Label
                htmlFor="select"
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg border p-4 has-data-[state=checked]:border-primary"
              >
                <RadioGroupItem value="select" id="select" />
                <span>{t("select")}</span>
              </Label>
            </RadioGroup>

            {hours && hours > 2 ? (
              <div className="mt-4 w-full max-w-xl rounded-2xl border-2 border-primary-200 bg-primary-50/80 p-5 shadow-sm md:p-6">
                <div className="space-y-1 border-b border-primary-200/80 pb-4">
                  <h3 className="text-base font-bold text-primary-800 md:text-lg">
                    {t("selectCustomTime")}
                  </h3>
                  <p className="text-sm text-primary-700/80">
                    {t("maxTimeSelection")}
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-4 md:gap-5">
                  <Button
                    type="button"
                    size="icon"
                    className="size-11 shrink-0 rounded-full bg-primary-500 text-white hover:bg-primary-600 md:size-12"
                    disabled={customHours <= MIN_CUSTOM_HOURS}
                    onClick={() => setHoursValue(customHours - 1)}
                    aria-label={t("decreaseHours")}
                  >
                    <Minus className="size-5" aria-hidden />
                  </Button>

                  <div className="flex min-w-0 flex-1 flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-primary-800 md:text-base">
                        {t("duration")}
                      </span>
                      <span className="rounded-full bg-primary-500 px-4 py-1.5 text-lg font-bold tabular-nums text-primary-foreground md:text-xl">
                        {customHours} {hoursLabel}
                      </span>
                    </div>

                    <Slider
                      className="w-full"
                      min={MIN_CUSTOM_HOURS}
                      max={MAX_HOURS}
                      step={1}
                      value={[customHours]}
                      onValueChange={(values) => {
                        const next = Array.isArray(values) ? values[0] : values;
                        if (typeof next === "number") {
                          setHoursValue(next);
                        }
                      }}
                      aria-label={t("selectCustomTime")}
                    />

                    <div className="flex justify-between text-sm font-medium text-primary-700/90">
                      <span>
                        {MIN_CUSTOM_HOURS} {t("hoursUnit")}
                      </span>
                      <span>
                        {MAX_HOURS} {t("hoursUnit")}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="icon"
                    className="size-11 shrink-0 rounded-full bg-primary-500 text-white hover:bg-primary-600 md:size-12"
                    disabled={customHours >= MAX_HOURS}
                    onClick={() => setHoursValue(customHours + 1)}
                    aria-label={t("increaseHours")}
                  >
                    <Plus className="size-5" aria-hidden />
                  </Button>
                </div>
              </div>
            ) : null}

            {/* Validation message for hours */}
            {form.formState.errors.hours && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.hours.message}
              </p>
            )}
          </div>
        </div>
      ) : null}
      <div className="w-full mt-4 flex justify-end items-end">
        <Button
          className="md:w-36 w-full rounded-full"
          type="button"
          onClick={onNext}
        >
          {t("next")}
        </Button>
      </div>
    </div>
  );
}
