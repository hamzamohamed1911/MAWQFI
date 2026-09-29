"use client";

import { useLocale, useTranslations } from "next-intl";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect } from "react";
import { ZoneCard } from "@/components/home/zone-card";
import type { ParkingZone } from "@/lib/zones";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  CustomTimePicker,
  MIN_CUSTOM_HOURS,
  MAX_CUSTOM_HOURS,
} from "@/components/home/custom-time-picker";
import { ActiveBookingCountdown } from "@/components/home/active-booking-countdown";
import { Alert } from "@/components/ui/alert";
import { Button } from "../ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { BookingInput } from "@/lib/schemas/booking.schema";
import { UseFormReturn } from "react-hook-form";
import { getLocaleDirection } from "@/i18n/routing";
import type { ActiveBooking } from "@/lib/types/zone";

type ZoneListProps = {
  zone: ParkingZone | null;
  error?: string | null;
  checkoutError?: string | null;
  form: UseFormReturn<BookingInput>;
  isSubmitting?: boolean;
  activeBooking?: ActiveBooking | null;
  activeBookingError?: string | null;
  onBack: () => void;
};

export function ZoneList({
  zone,
  error,
  checkoutError,
  form,
  isSubmitting = false,
  activeBooking,
  activeBookingError,
  onBack,
}: ZoneListProps) {
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
    const clamped = Math.min(
      MAX_CUSTOM_HOURS,
      Math.max(MIN_CUSTOM_HOURS, nextHours),
    );

    void setHours(clamped);

    form.setValue("hours", clamped, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const customHours = hours && hours > 2 ? hours : MIN_CUSTOM_HOURS;

  return (
    <div>
      <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
        {t("zoneTimeDescription")}
      </p>

      {error ? <p className="mt-4 text-xs text-destructive">{error}</p> : null}

      {activeBookingError ? (
        <Alert variant="destructive" className="mt-4">
          {activeBookingError}
        </Alert>
      ) : null}

      {activeBooking && !activeBookingError ? (
        <Alert
          variant="warning"
          className="mt-4"
          icon={
            <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
          }
          title={t("activeBookingNoticeTitle")}
        >
          <div className="space-y-3">
            <p>{t("activeBookingNotice")}</p>
            <ActiveBookingCountdown expiresAt={activeBooking.expires_at} />
          </div>
        </Alert>
      ) : null}

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
              <CustomTimePicker
                hours={customHours}
                onHoursChange={setHoursValue}
              />
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
      <div className="mt-4 flex w-full flex-col gap-2 md:flex-row md:justify-between">
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-full border-2 border-primary font-semibold text-primary hover:text-primary md:w-36"
          onClick={onBack}
          disabled={isSubmitting}
        >
          {t("back")}
        </Button>
        <Button
          className="w-full rounded-full md:w-36"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            t("submit")
          )}
        </Button>
      </div>
    </div>
  );
}
