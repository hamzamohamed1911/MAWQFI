"use server";
import type { ParkingZone } from "@/lib/zones";
import { BookingInput } from "../schemas/booking.schema";
import type {
  ActivateBookingErrorResponse,
  ActivateBookingResponse,
  ActiveBooking,
  BookingQuoteResponse,
  ConfirmBookingResponse,
} from "@/lib/types/zone";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchZone(qrId: string) {
  const response = await fetch(`${API_URL}/public/zones/${qrId}`, {
    cache: "no-store",
  });
  const data = (await response.json()) as ParkingZone & { detail?: string };

  if (!response.ok) {
    throw new Error(data.detail);
  }

  return data;
}
export async function submitBooking(
  bookingBody: BookingInput,
): Promise<BookingQuoteResponse> {
  const response = await fetch(`${API_URL}/public/bookings/checkout/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingBody),
  });
  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}
export async function confirmBooking(
  checkout_id: string,
): Promise<ConfirmBookingResponse> {
  const response = await fetch(`${API_URL}/public/bookings/confirm/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ checkout_id }),
  });
  const data = (await response.json()) as ConfirmBookingResponse;

  if (!response.ok) {
    throw data;
  }

  return data;
}

export async function activateBooking(params: {
  zone: number;
  plate: string;
}): Promise<ActivateBookingResponse> {
  const search = new URLSearchParams({
    zone: String(params.zone),
    plate: params.plate,
  });
  const response = await fetch(`${API_URL}/public/bookings/active/?${search}`, {
    cache: "no-store",
  });

  /** No active booking for this plate/zone — normal case, not an error. */
  if (response.status === 404) {
    return { booking: null };
  }

  const data = (await response.json()) as
    | ActivateBookingResponse
    | ActivateBookingErrorResponse;

  if (!response.ok) {
    throw data;
  }

  return data as ActivateBookingResponse;
}

export function resolveActiveBooking(
  response: ActivateBookingResponse,
): ActiveBooking | null {
  const booking = response.booking;
  return booking?.is_active ? booking : null;
}
export async function fetchBooking(bookingId: string) {
  const response = await fetch(`${API_URL}/public/bookings/${bookingId}`, {
    cache: "no-store",
  });
  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}
export async function downloadBookingBill(
  bookingId: number,
  plate: string,
): Promise<void> {
  const query = new URLSearchParams({ plate });
  const response = await fetch(
    `${API_URL}/public/bookings/${encodeURIComponent(String(bookingId))}/bill/?${query}`,
    { cache: "no-store", headers: { Accept: "text/html" } },
  );

  if (!response.ok) {
    let message = "request_failed";
    try {
      const payload = (await response.json()) as { detail?: string };
      if (typeof payload.detail === "string" && payload.detail.length > 0) {
        message = payload.detail;
      }
    } catch {
      // non-JSON error body
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `booking-${bookingId}-bill.html`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
