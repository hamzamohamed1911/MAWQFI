"use client";

import React, { useState } from "react";
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

type PersonalDataProps = {
  form: UseFormReturn<BookingInput>;
  isSubmitting: boolean;
  onBack: () => void;
};

const PersonalData = ({ form, isSubmitting, onBack }: PersonalDataProps) => {
  type Country = CountryCode;

  const DEFAULT_COUNTRY: Country = "SA";

  const t = useTranslations("HomePage");

  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);

  // Plate UI states
  const [numbers, setNumbers] = useState("");
  const [letters, setLetters] = useState("");
  return (
    <div className="flex flex-col gap-4">
      <p className="lg:text-lg md:text-base text-sm text-muted-foreground">
        {t("personalDataStepHint")}
      </p>

      {/* Phone */}
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
                disabled={isSubmitting}
                placeholder={t("phone-placeholder")}
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="plate"
        render={() => (
          <FormItem>
            <div className="flex items-center justify-start gap-1">
              <FormLabel className="font-semibold">
                {t("plate-number")}
              </FormLabel>

              <span className="text-2xl text-red-500">*</span>
            </div>

            <p className="text-xs text-muted-foreground">{t("plate-order")}</p>
            {/* Plate layout matches the physical Saudi plate — always LTR */}
            <div dir="ltr" className="w-full max-w-full">
              <Tabs defaultValue="saudi" className="w-full">
                <TabsList className="grid w-fit grid-cols-2 gap-0">
                  <TabsTrigger
                    value="saudi"
                    className="cursor-pointer text-xs font-semibold rounded-s-2xl border p-2 text-center justify-center items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {t("plateTabSaudi")}
                  </TabsTrigger>

                  <TabsTrigger
                    value="other-regions"
                    className="cursor-pointer text-xs font-semibold rounded-e-2xl border p-2 text-center justify-center items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {t("plateTabOtherRegions")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="saudi">
                  <FormControl>
                    <div className="flex w-fit overflow-hidden rounded-xl border-2 border-black">
                      {/* Main plate */}
                      <div className="grid md:w-90 w-full grid-cols-2 grid-rows-2">
                        {/* Numbers Input */}
                        <div className="flex items-center justify-center border-b-2 border-r-2 border-black">
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
                            disabled={isSubmitting}
                            className="h-full w-full border-0 text-center lg:text-2xl md:text-xl text-lg shadow-none focus-visible:ring-0"
                          />
                        </div>

                        {/* Letters Input */}
                        <div className="flex items-center justify-center border-b-2 border-black">
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
                            disabled={isSubmitting}
                            className="h-full w-full border-0 text-center lg:text-2xl md:text-xl text-lg shadow-none focus-visible:ring-0"
                          />
                        </div>

                        {/* Numbers Result */}
                        <div className="flex items-center justify-center border-r-2 border-black lg:text-2xl md:text-xl text-lg text-gray-300">
                          {numbers || "0000"}
                        </div>

                        {/* Letters Result */}
                        <div className="flex items-center justify-center lg:text-2xl md:text-xl text-lg text-gray-300">
                          {letters || "AAA"}
                        </div>
                      </div>

                      {/* Saudi Section */}
                      <div className="flex w-13.75 flex-col items-center justify-center gap-1 border-l-2 border-black py-2">
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
                </TabsContent>

                <TabsContent value="other-regions">
                  {/* Other regions content */}

                  <FormField
                    control={form.control}
                    name="plate"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl className="w-full">
                          <Input
                            {...field}
                            placeholder={t("plate-number")}
                            disabled={isSubmitting}
                            className="h-12 w-full rounded-xl ring-primary md:max-w-72"
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </FormItem>
        )}
      />
      <div className="flex justify-between w-full gap-2 md:flex-row flex-col">
        <Button
          onClick={() => onBack()}
          className="text-primary border-primary border-2 font-semibold md:order-1 order-2 md:w-36 w-full rounded-full hover:text-primary "
          variant="outline"
          type="button"
        >
          {t("back")}
        </Button>
        <Button
          type="submit"
          className="md:w-36 w-full rounded-full md:order-2 order-1"
          disabled={isSubmitting}
        >
          {t("submit")}
        </Button>
      </div>
    </div>
  );
};

export default PersonalData;
