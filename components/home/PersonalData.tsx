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
import { ParkingZone } from "@/lib/zones";
import {
  isValidSaudiPlate,
  sanitizePlateLetters,
  toArabicPlateDigits,
  toArabicPlateLetters,
} from "@/lib/utils/saudi-plate";
import { ZoneCard } from "./zone-card";

type PersonalDataProps = {
  zone: ParkingZone | null;
  form: UseFormReturn<BookingInput>;
  isSubmitting: boolean;
  onContinue: () => void | Promise<void>;
};

const PersonalData = ({
  form,
  isSubmitting,
  zone,
  onContinue,
}: PersonalDataProps) => {
  type Country = CountryCode;

  const DEFAULT_COUNTRY: Country = "SA";

  const t = useTranslations("HomePage");
  type PlateType = "saudi" | "other";

  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [isContinuing, setIsContinuing] = useState(false);
  const [plateType, setPlateType] = useState<PlateType>("saudi");

  const [numbers, setNumbers] = useState("");
  const [letters, setLetters] = useState("");
  const plateValue = form.watch("plate");
  const continueDisabled = isSubmitting || isContinuing;

  useEffect(() => {
    if (plateType !== "saudi" || !plateValue) {
      return;
    }

    const match = plateValue.match(/^(\d*)(.*)$/);

    if (!match) {
      return;
    }

    const nextNumbers = (match[1] ?? "").slice(0, 4);
    const nextLetters = sanitizePlateLetters(match[2] ?? "");

    setNumbers(nextNumbers);
    setLetters(nextLetters);

    const nextPlate = `${nextNumbers}${nextLetters}`;

    if (nextPlate !== plateValue) {
      form.setValue("plate", nextPlate, {
        shouldValidate: true,
      });
    }
  }, [plateValue, plateType, form]);

  async function handleContinue() {
    setIsContinuing(true);

    try {
      const plate = form.getValues("plate").trim();

      if (!plate) {
        form.setError("plate", {
          type: "manual",
          message: t("validation-plate-required"),
        });

        return;
      }

      if (plateType === "saudi" && !isValidSaudiPlate(plate)) {
        form.setError("plate", {
          type: "manual",
          message: t("validation-plate-invalid"),
        });

        return;
      }

      form.clearErrors("plate");

      await onContinue();
    } finally {
      setIsContinuing(false);
    }
  }
  return (
    <div className="flex flex-col gap-4">
      {zone ? <ZoneCard zone={zone} /> : null}

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

            <Tabs
              value={plateType}
              onValueChange={(value) => {
                setPlateType(value as "saudi" | "other");
                form.clearErrors("plate");
              }}
            >
              <TabsList className="h-12 w-full justify-center bg-neutral-200 dark:bg-transparent border-b border-neutral-500">
                <TabsTrigger
                  value="saudi"
                  className="flex h-full w-full cursor-pointer items-center justify-center border-b-3 border-transparent p-0 text-center text-neutral-600 dark:text-white data-[state=active]:border-primary-500 data-[state=active]:text-primary"
                >
                  {t("saudiPlate")}
                </TabsTrigger>

                <TabsTrigger
                  value="other"
                  className="flex h-full w-full cursor-pointer items-center justify-center border-b-3 border-transparent p-0 text-center text-neutral-600 dark:text-white data-[state=active]:border-primary-500 data-[state=active]:text-primary"
                >
                  {t("other")}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="saudi">
                {/*  Saudi plate */}
                <div className="w-full flex justify-start max-w-full">
                  <FormControl dir="ltr">
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
                              const value = sanitizePlateLetters(
                                e.target.value,
                              );

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
                          <span
                            className={numbers ? "text-foreground" : undefined}
                          >
                            {numbers ? toArabicPlateDigits(numbers) : "٠٠٠٠"}
                          </span>
                        </div>

                        {/* Arabic match for the entered Latin letters */}
                        <div className="flex items-center justify-center lg:text-2xl md:text-xl text-lg text-gray-300">
                          <span
                            className={letters ? "text-foreground" : undefined}
                          >
                            {letters ? toArabicPlateLetters(letters) : "أ أ أ"}
                          </span>
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
                </div>
              </TabsContent>
              {/*  other plate */}
              <TabsContent value="other">
                <FormItem className="flex flex-col gap-2">
                  <FormLabel className="font-semibold text-natural-1000 dark:text-white text-xl">
                    {t("plate-number")}
                  </FormLabel>
                  <FormControl dir="ltr">
                    <Input
                      value={plateValue}
                      className="border h-12 border-neutral-200 dark:border-white rounded-lg"
                      onChange={(e) => {
                        form.setValue("plate", e.target.value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      inputMode="text"
                      maxLength={10}
                      placeholder="X Y Z 1 2 3 4"
                      disabled={continueDisabled}
                    />
                  </FormControl>

                  <p className="text-neutral-500 text-sm">
                    {t("plate-number-hint")}
                  </p>
                </FormItem>
              </TabsContent>
            </Tabs>
            <FormMessage />
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
          className="w-full rounded-full md:w-36 h-12  text-base font-semibold"
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
