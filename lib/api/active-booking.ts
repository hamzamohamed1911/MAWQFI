import type { ActivateBookingResponse, ActiveBooking } from "@/lib/types/zone";

export function resolveActiveBooking(
  response: ActivateBookingResponse,
): ActiveBooking | null {
  const booking = response.booking;
  return booking?.is_active ? booking : null;
}
