"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  getCountries,
  getCountryCallingCode,
  type Country,
} from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import ar from "react-phone-number-input/locale/ar.json";
import en from "react-phone-number-input/locale/en.json";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils/cn";

import {
    isSaudiPhoneCountry,
    sanitizePhoneNumberInput,
    toPhoneCountry,
  } from "@/lib/utils/phone";


export const DEFAULT_PHONE_COUNTRY = "+966";
export const DEFAULT_COUNTRY: Country = "SA";
export const SAUDI_PHONE_COUNTRY = "+966";

/** National number: 7–15 digits (ITU E.164 national significant number range). */
export const PHONE_NUMBER_REGEX = /^\d{7,15}$/;

/** Saudi mobile: 9 digits starting with 5 (no leading 0). */
export const SAUDI_PHONE_NUMBER_REGEX = /^5\d{8}$/;





export function isValidPhoneNumber(phoneNumber: string): boolean {
  return PHONE_NUMBER_REGEX.test(phoneNumber);
}

export function isValidPhoneNumberForCountry(
  phoneCountry: string,
  phoneNumber: string,
): boolean {
  if (isSaudiPhoneCountry(phoneCountry)) {
    return SAUDI_PHONE_NUMBER_REGEX.test(phoneNumber);
  }
  return PHONE_NUMBER_REGEX.test(phoneNumber);
}

export function formatPhoneDisplay(
  phoneCountry: string,
  phoneNumber: string,
): string {
  return `${phoneCountry} ${phoneNumber}`.trim();
}

export function resolveCountryFromPhoneCountry(
  phoneCountry: string,
  preferred: Country = DEFAULT_COUNTRY,
): Country {
  const dial = phoneCountry.replace(/^\+/, "");
  if (
    getCountryCallingCode(preferred) === dial
  ) {
    return preferred;
  }

  if (dial === "966") return "SA";

  const match = getCountries().find(
    (code) => getCountryCallingCode(code) === dial,
  );

  return match ?? preferred;
}

const countryLabels = {
  ar,
  en,
} as const;

type CountryLabels = Record<string, string>;

function getCountryLabels(locale: string): CountryLabels {
  return locale.startsWith("ar") ? countryLabels.ar : countryLabels.en;
}


export type PhoneInputFieldProps = {
  phoneCountry: string; // +966 فقط للعرض
  phoneNumber: string;
  country?: Country;

  onPhoneCountryChange: (country: Country) => void;

  onPhoneNumberChange: (phoneNumber: string) => void;

  disabled?: boolean;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
};

function CountryFlag({
  country,
  labels,
}: {
  country: Country;
  labels: CountryLabels;
}) {
  const Flag = flags[country];
  if (!Flag) {
    return <span className="text-sm leading-none">{country}</span>;
  }

  return (
    <span className="flex h-4.5 w-6.5 overflow-hidden rounded-[2px] [&_svg]:h-full [&_svg]:w-full">
      <Flag title={labels[country] ?? country} />
    </span>
  );
}

export function PhoneInputField({
  phoneNumber,
  country: countryProp,
  onPhoneCountryChange,
  onPhoneNumberChange,
  disabled,
  placeholder,
  "aria-label": ariaLabel,
  className,
}: PhoneInputFieldProps) {
  const locale = useLocale();
  const t = useTranslations("HomePage");
  const labels = useMemo(() => getCountryLabels(locale), [locale]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [internalCountry, setInternalCountry] = useState<Country>("SA");

  const country = countryProp ?? internalCountry;

  const countries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return getCountries()
      .map((code) => ({
        code,
        name: labels[code] ?? code,
        dialCode: `+${getCountryCallingCode(code)}`,
      }))
      .filter((item) => {
        if (!query) return true;
        return (
          item.name.toLowerCase().includes(query) ||
          item.dialCode.includes(query) ||
          item.code.toLowerCase().includes(query)
        );
      });
  }, [labels, search]);

  function handleCountrySelect(nextCountry: Country) {
    setInternalCountry(nextCountry);
  
    // Form/API stores "SA", "EG", "AE", etc.
    onPhoneCountryChange(nextCountry);
  
    // UI/input uses the dialing code
    const dialCode = toPhoneCountry(nextCountry);
  
    onPhoneNumberChange(
      sanitizePhoneNumberInput(dialCode, phoneNumber),
    );
  
    setOpen(false);
    setSearch("");
  }
  function handlePhoneNumberChange(value: string) {
    const dialCode = toPhoneCountry(country);
  
    onPhoneNumberChange(
      sanitizePhoneNumberInput(dialCode, value),
    );
  }

  const isSaudi = country === "SA";
  return (
    <div
      className={cn(
        "flex h-14 overflow-hidden rounded-xl border border-input ",
        "focus-within:ring-2 focus-within:ring-primary",
        className,
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          disabled={disabled}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 bg-background px-3 transition-colors hover:bg-background/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CountryFlag country={country} labels={labels} />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-72 p-0"
        >
          <div className="border-b border-border p-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("phone-country-search")}
              className="h-9 rounded-lg"
              autoComplete="off"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {countries.map((item) => (
              <li key={item.code}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-start text-sm hover:bg-accent",
                    item.code === country && "bg-accent",
                  )}
                  onClick={() => handleCountrySelect(item.code)}
                >
                  <CountryFlag country={item.code} labels={labels} />
                  <span className="min-w-0 flex-1 truncate">{item.name}</span>
                  <span className="shrink-0 text-muted-foreground" dir="ltr">
                    {item.dialCode}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>

      <div dir="ltr" className="flex min-w-0 flex-1 items-center gap-1 px-3">
        <span
          className="shrink-0 text-base leading-none font-bold text-title md:text-sm"
          aria-hidden
        >
         {toPhoneCountry(country)}
        </span>
        <Input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          disabled={disabled}
          aria-label={ariaLabel}
          placeholder={placeholder}
          value={phoneNumber}
          maxLength={isSaudi ? 9 : 15}
          onChange={(event) => handlePhoneNumberChange(event.target.value)}
          className="h-auto min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 text-base leading-none text-title shadow-none font-medium placeholder:text-xs focus-visible:ring-0 md:text-sm md:placeholder:text-[11px]"
        />
      </div>
    </div>
  );
}
