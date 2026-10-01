import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  getCountries,
  getCountryCallingCode,
  isSupportedCountry,
  type Country,
} from "react-phone-number-input";
  
  export const DEFAULT_PHONE_COUNTRY = "+966";
  export const DEFAULT_COUNTRY: Country = "SA";
  export const SAUDI_PHONE_COUNTRY = "+966";
  
  /** National number: 7–15 digits (ITU E.164 national significant number range). */
  export const PHONE_NUMBER_REGEX = /^\d{7,15}$/;
  
  /** Saudi mobile: 9 digits starting with 5 (no leading 0). */
  export const SAUDI_PHONE_NUMBER_REGEX = /^5\d{8}$/;
  
  export function toPhoneCountry(country: Country): string {
    return `+${getCountryCallingCode(country)}`;
  }
  
  export function isSaudiPhoneCountry(phoneCountry: string): boolean {
    return phoneCountry === SAUDI_PHONE_COUNTRY || phoneCountry === "966";
  }
  
  export function sanitizePhoneNumberInput(
    phoneCountry: string,
    value: string,
  ): string {
    let digits = value.replace(/\D/g, "");
  
    if (isSaudiPhoneCountry(phoneCountry)) {
      digits = digits.replace(/^0+/, "");
      if (digits.length > 0 && digits[0] !== "5") {
        const fiveIndex = digits.indexOf("5");
        digits = fiveIndex === -1 ? "" : digits.slice(fiveIndex);
      }
      return digits.slice(0, 9);
    }
  
    return digits.slice(0, 15);
  }
  
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
  
/** Maps active-booking E.164 (e.g. +966547200658) to form fields. */
export function phoneFieldsFromE164(e164: string): {
  phone_country: Country;
  phone: string;
} | null {
  const parsed = parsePhoneNumberFromString(e164.trim());
  if (!parsed?.isValid() || !parsed.country) {
    return null;
  }

  return {
    phone_country: parsed.country,
    phone: parsed.nationalNumber,
  };
}

export function resolveCountryFromPhoneCountry(
  phoneCountry: string,
  preferred: Country = DEFAULT_COUNTRY,
): Country {
    const dial = phoneCountry.replace(/^\+/, "");
    if (
      isSupportedCountry(preferred) &&
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
  