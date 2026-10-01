import { z } from "zod";

import { isValidPhoneNumberForCountry } from "@/lib/utils/phone";
import { isValidSaudiPlate } from "@/lib/utils/saudi-plate";

type TranslateFn = (key: string) => string;
export const createBookingSchema = (t: TranslateFn) =>
  z
    .object({
      zone: z.number().int().positive(t("validation-zone-required")),

      plate: z
        .string()
        .trim()
        .min(1, t("validation-plate-required"))
        .refine(isValidSaudiPlate, t("validation-plate-invalid")),

      phone_country: z.string().min(1, t("validation-field-required")),

      phone: z.string().trim().min(1, t("validation-phone-required")),

      hours: z.number().int().positive(t("validation-hours-required")),
      shopper_result_url: z.string().url().optional(),
    })
    .superRefine((data, ctx) => {
      if (!isValidPhoneNumberForCountry(data.phone_country, data.phone)) {
        ctx.addIssue({
          code: "custom",
          path: ["phone"],
          message: t("validation-phone-invalid"),
        });
      }
    });

export type BookingInput = z.infer<ReturnType<typeof createBookingSchema>>;

export const bookingDefaultValues: BookingInput = {
  zone: 0,
  plate: "",
  phone: "",
  phone_country: "SA",
  hours: 1,
};
