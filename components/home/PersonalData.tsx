"use client";

import React, { useEffect, useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { CountryCode } from "libphonenumber-js/core";
import { useTranslations } from "next-intl";
import { PhoneInputField } from "./phone-input-field";
import { BookingInput } from "@/lib/schemas/booking.schema";
import { UseFormReturn } from "react-hook-form";
import { Input } from "../ui/input";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import type { GeoStatus } from "@/lib/hooks/use-zone-geo-status";
import { ParkingZone } from "@/lib/zones";
import { ZoneCard } from "./zone-card";
import { ZoneGeoNotice } from "./zone-panel";

type PersonalDataProps = {
  zone: ParkingZone | null;
  geo: GeoStatus;
  form: UseFormReturn<BookingInput>;
  isSubmitting: boolean;
  onContinue: () => void | Promise<void>;
};

const PersonalData = ({
  form,
  isSubmitting,
  zone,
  geo,
  onContinue,
}: PersonalDataProps) => {
  type Country = CountryCode;

  const DEFAULT_COUNTRY: Country = "SA";

  const t = useTranslations("HomePage");

  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [isContinuing, setIsContinuing] = useState(false);

  const [numbers, setNumbers] = useState("");
  const [letters, setLetters] = useState("");
  const plateValue = form.watch("plate");
  const continueDisabled = isSubmitting || isContinuing;

  useEffect(() => {
    if (!plateValue) {
      return;
    }

    const match = plateValue.match(/^(\d*)([\p{L}]*)$/u);
    if (!match) {
      return;
    }

    setNumbers(match[1] ?? "");
    setLetters(match[2] ?? "");
  }, [plateValue]);

  async function handleContinue() {
    setIsContinuing(true);
    try {
      await onContinue();
    } finally {
      setIsContinuing(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {zone ? <ZoneCard zone={zone} /> : null}
      {zone ? (
        <div className="lg:hidden">
          <ZoneGeoNotice geo={geo} />
        </div>
      ) : null}

      <FormField
        control={form.control}
        name="plate"
        render={() => (
          <FormItem>
            <div className="flex items-center justify-start gap-1">
              <FormLabel className="font-semibold text-lg">
                {t("plate-number")}
              </FormLabel>

              <span className="text-2xl text-red-500">*</span>
            </div>

            {/* Plate layout matches the physical Saudi plate — always LTR */}
            <div dir="ltr" className="w-full max-w-full">
              <FormControl>
                <div className="flex w-fit overflow-hidden rounded-xl border-2 border-black dark:border-white">
                  {/* Main plate */}
                  <div className="grid md:w-90 w-full grid-cols-2 grid-rows-2">
                    {/* Numbers Input */}
                    <div className="flex items-center justify-center border-b-2 border-r-2 border-black dark:border-white">
                      <Input
                        value={numbers}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");

                          setNumbers(value);

                          form.setValue("plate", `${value}${letters}`, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="...."
                        disabled={continueDisabled}
                        className="h-full w-full border-0 text-center lg:text-2xl md:text-xl text-lg shadow-none focus-visible:ring-0"
                      />
                    </div>

                    {/* Letters Input */}
                    <div className="flex items-center justify-center border-b-2 border-black dark:border-white">
                      <Input
                        value={letters}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/[^\p{L}]/gu, "")
                            .toUpperCase();

                          setLetters(value);

                          form.setValue("plate", `${numbers}${value}`, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                        maxLength={3}
                        placeholder="A A A"
                        disabled={continueDisabled}
                        className="h-full w-full border-0 text-center lg:text-2xl md:text-xl text-lg shadow-none focus-visible:ring-0"
                      />
                    </div>

                    {/* Numbers Result */}
                    <div className="flex items-center justify-center border-r-2 border-black dark:border-white lg:text-2xl md:text-xl text-lg text-gray-300">
                      {numbers || "0000"}
                    </div>

                    {/* Letters Result */}
                    <div className="flex items-center justify-center lg:text-2xl md:text-xl text-lg text-gray-300">
                      {letters || "AAA"}
                    </div>
                  </div>

                  {/* Saudi Section */}
                  <div className="flex w-13.75 flex-col items-center justify-center gap-1 border-l-2 border-black dark:border-white py-2">
                    <Image
                      alt={t("saudiArabiaAlt")}
                      width={25}
                      height={25}
                      src="/icons/Saudi_Arabia.svg"
                    />

                    <p className="text-[7px] font-semibold">السعودية</p>

                    <span className="flex flex-col items-center text-[10px] leading-3">
                      <span>K</span>
                      <span>S</span>
                      <span>A</span>
                    </span>

                    <span className="size-2 rounded-full bg-black dark:bg-white" />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-start gap-1">
              <FormLabel className="font-semibold">
                {t("contact-information")}
              </FormLabel>
              <span className="text-2xl text-red-500">*</span>
            </div>

            <FormControl>
              <PhoneInputField
                country={country}
                phoneCountry={form.watch("phone_country")}
                phoneNumber={field.value}
                onPhoneCountryChange={(nextCountry) => {
                  setCountry(nextCountry);

                  form.setValue("phone_country", nextCountry, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
                onPhoneNumberChange={field.onChange}
                disabled={continueDisabled}
                placeholder={t("phone-placeholder")}
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex w-full justify-end">
        <Button
          type="button"
          className="w-full rounded-full md:w-36"
          disabled={continueDisabled}
          onClick={() => void handleContinue()}
        >
          {t("Continue")}
        </Button>
      </div>
    </div>
  );
};

export default PersonalData;
