"use client";

import { useLocale, useTranslations } from "next-intl";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect } from "react";
import { ZoneCard } from "@/components/home/zone-card";
import type { ParkingZone } from "@/lib/zones";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { BookingInput } from "@/lib/schemas/booking.schema";
import { UseFormReturn } from "react-hook-form";
import { getLocaleDirection } from "@/i18n/routing";

type ZoneListProps = {
  zone: ParkingZone | null;
  error?: string | null;
  form: UseFormReturn<BookingInput>;
  onNext: () => void;
};

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

  const increaseHours = () => {
    const nextHours = (hours ?? 3) + 1;

    if (nextHours > 8) {
      return;
    }

    void setHours(nextHours);

    form.setValue("hours", nextHours, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const decreaseHours = () => {
    const nextHours = (hours ?? 3) - 1;

    if (nextHours < 1) {
      return;
    }

    void setHours(nextHours);

    form.setValue("hours", nextHours, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

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
              <div className="mt-2 max-w-full items-center justify-center rounded-lg border p-4 md:max-w-fit">
                <div className="flex flex-col justify-center gap-1 border-b pb-2">
                  <h3 className="text-center text-sm font-semibold md:text-base">
                    {t("selectCustomTime")}
                  </h3>

                  <p className="text-center text-xs text-muted-foreground md:text-sm">
                    {t("maxTimeSelection")}
                  </p>
                </div>

                <div className="my-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={decreaseHours}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border bg-primary-500 text-white"
                  >
                    -
                  </button>

                  <span className="min-w-8 text-center font-semibold">
                    {hours}
                  </span>

                  <button
                    type="button"
                    onClick={increaseHours}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border bg-primary-500 text-white"
                  >
                    +
                  </button>
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
