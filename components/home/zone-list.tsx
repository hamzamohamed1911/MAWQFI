"use client";

import { useLocale, useTranslations } from "next-intl";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect } from "react";
import type { ParkingZone } from "@/lib/zones";

import { MAX_CUSTOM_HOURS } from "@/components/home/custom-time-picker";
import { ActiveBookingCountdown } from "@/components/home/active-booking-countdown";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { BookingInput } from "@/lib/schemas/booking.schema";
import { UseFormReturn } from "react-hook-form";
import { getLocaleDirection } from "@/i18n/routing";
import type { ActiveBooking } from "@/lib/types/zone";
import type { GeoStatus } from "@/lib/hooks/use-zone-geo-status";
import { cn } from "@/lib/utils/cn";
import { ZoneGeoNotice } from "@/components/home/zone-panel";

const MIN_SLOT_HOURS = 1;
const HOUR_SLOTS = Array.from(
  { length: MAX_CUSTOM_HOURS },
  (_, index) => index + MIN_SLOT_HOURS,
);

type ZoneListProps = {
  zone: ParkingZone | null;
  geo: GeoStatus;
  error?: string | null;
  checkoutError?: string | null;
  form: UseFormReturn<BookingInput>;
  isSubmitting?: boolean;
  activeBooking?: ActiveBooking | null;
  activeBookingError?: string | null;
  onBack: () => void;
  onContinue: () => void | Promise<void>;
};

export function ZoneList({
  zone,
  geo,
  error,

  form,
  isSubmitting = false,
  activeBooking,
  activeBookingError,
  onBack,
  onContinue,
}: ZoneListProps) {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const dir = getLocaleDirection(locale);
  const [hours, setHours] = useQueryState(
    "hours",
    parseAsInteger.withDefault(1).withOptions({
      history: "replace",
    }),
  );
  useEffect(() => {
    if (zone) {
      form.setValue("zone", zone.id, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [zone, form]);

  useEffect(() => {
    if (!hours || hours <= 0) {
      return;
    }

    const clamped = Math.min(MAX_CUSTOM_HOURS, Math.max(MIN_SLOT_HOURS, hours));

    if (clamped !== hours) {
      void setHours(clamped);
    }

    form.setValue("hours", clamped, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [hours, form, setHours]);

  const setHoursValue = (nextHours: number) => {
    const clamped = Math.min(
      MAX_CUSTOM_HOURS,
      Math.max(MIN_SLOT_HOURS, nextHours),
    );

    void setHours(clamped);

    form.setValue("hours", clamped, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const selectedHours =
    hours && hours >= MIN_SLOT_HOURS && hours <= MAX_CUSTOM_HOURS
      ? hours
      : MIN_SLOT_HOURS;

  return (
    <div>
      {zone ? (
        <div className="mb-4 lg:hidden">
          <ZoneGeoNotice geo={geo} />
        </div>
      ) : null}
      {error ? <p className="mt-4 text-xs text-destructive">{error}</p> : null}

      <div className="mt-4 flex w-full flex-col gap-4">
        <div className="flex w-full flex-col gap-2">
          <div className="flex w-full items-start justify-between gap-2">
            {activeBooking && !activeBookingError ? (
              <h2 className="text-sm font-bold md:text-lg">
                {t("extendParkingDurationTitle")}
              </h2>
            ) : (
              <div className="flex flex-col gap-4">
                <h2 className="text-sm font-bold md:text-lg">
                  {t("parkingDurationTitle")}
                </h2>
                <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
                  {t("parkingDurationDescription")}
                </p>
              </div>
            )}

            <Badge
              variant="secondary"
              className="mt-0.5 tabular-nums bg-secondary-50 py-3 px-4 text-secondary-800"
            >
              {activeBooking && !activeBookingError
                ? t("activeBookingBadge")
                : t("newBooking")}
            </Badge>
          </div>

          {activeBooking && !activeBookingError ? (
            <div className="mt-4">
              <ActiveBookingCountdown activeBooking={activeBooking} />
            </div>
          ) : null}
          <div className="w-full rounded-2xl border border-border bg-card p-3 sm:p-4">
            <div
              role="radiogroup"
              aria-label={t("select-time-slot")}
              dir={dir}
              className="grid w-full grid-cols-4 gap-2 sm:gap-3"
            >
              {HOUR_SLOTS.map((slot) => {
                const isSelected = selectedHours === slot;

                return (
                  <Button
                    key={slot}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    variant="outline"
                    className={cn(
                      "h-12 w-full min-w-0 rounded-xl border text-base font-semibold shadow-none sm:h-14 sm:text-lg",
                      isSelected
                        ? "border-primary-500 bg-primary-500 text-white hover:bg-primary-600 hover:text-white dark:border-primary-400 dark:bg-primary-500 dark:text-primary-foreground dark:hover:bg-primary-400 dark:hover:text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-muted dark:border-primary-800/60 dark:bg-primary-950/35 dark:text-primary-100 dark:hover:bg-primary-900/45",
                    )}
                    onClick={() => setHoursValue(slot)}
                  >
                    {slot}
                  </Button>
                );
              })}
            </div>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              {t("maxTimeSelection")}
            </p>
          </div>

          {form.formState.errors.hours ? (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.hours.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex w-full flex-col gap-2 md:flex-row md:justify-between">
        <Button
          type="button"
          variant="ghost"
          className="w-full text-base hover:text-secondary-600 hover:bg-transparent rounded-full   font-semibold text-secondary-800 md:w-36"
          onClick={onBack}
          disabled={isSubmitting}
        >
          {t("back")}
        </Button>
        <Button
          className="w-full rounded-full md:w-36"
          type="button"
          disabled={isSubmitting}
          onClick={() => void onContinue()}
        >
          {t("Continue")}
        </Button>
      </div>
    </div>
  );
}
