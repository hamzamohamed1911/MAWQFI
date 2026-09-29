import type { BookingInput } from "@/lib/schemas/booking.schema";
import type { ActivateBookingErrorResponse } from "@/lib/types/zone";

const BOOKING_FORM_FIELDS = new Set<keyof BookingInput>([
  "zone",
  "plate",
  "phone_country",
  "phone",
  "hours",
  "shopper_result_url",
]);

export function getActivateBookingErrorMessage(error: unknown): string | null {
  const detail = (error as ActivateBookingErrorResponse).detail;

  return typeof detail === "string" && detail.length > 0 ? detail : null;
}

function firstFieldMessage(value: unknown): string | undefined {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  if (Array.isArray(value)) {
    const first = value.find(
      (item): item is string => typeof item === "string" && item.length > 0,
    );
    return first;
  }

  return undefined;
}

export type ParsedCheckoutErrors = {
  /** All user-facing messages from the API body */
  messages: string[];
  fieldErrors: Partial<Record<keyof BookingInput, string>>;
};

/** Parses DRF-style bodies such as `{ hours: ["…"] }` or `{ detail: "…" }`. */
export function parseCheckoutError(error: unknown): ParsedCheckoutErrors {
  if (typeof error === "string" && error.length > 0) {
    return { messages: [error], fieldErrors: {} };
  }

  if (!error || typeof error !== "object") {
    return { messages: [], fieldErrors: {} };
  }

  const record = error as Record<string, unknown>;
  const messages: string[] = [];
  const fieldErrors: Partial<Record<keyof BookingInput, string>> = {};

  const detail = firstFieldMessage(record.detail);
  if (detail) {
    messages.push(detail);
  }

  for (const [field, value] of Object.entries(record)) {
    if (field === "detail") {
      continue;
    }

    const message = firstFieldMessage(value);
    if (!message) {
      continue;
    }

    messages.push(message);

    if (BOOKING_FORM_FIELDS.has(field as keyof BookingInput)) {
      fieldErrors[field as keyof BookingInput] = message;
    }
  }

  return { messages, fieldErrors };
}
