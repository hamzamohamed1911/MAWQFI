import type { BookingInput } from "@/lib/schemas/booking.schema";

const STORAGE_KEY = "onstreet-checkout";

export type StoredCheckout = {
  booking: BookingInput;
};

export function storeCheckout(value: StoredCheckout) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function readStoredCheckout(): StoredCheckout | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredCheckout;
    if (!parsed?.booking) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
