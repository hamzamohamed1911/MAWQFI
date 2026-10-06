"use server";

import type { ParkingZone } from "@/lib/zones";
import { BookingInput } from "../schemas/booking.schema";
import {
  apiFailure,
  apiSuccess,
  type ApiActionResult,
  type ApiErrorBody,
} from "@/lib/api/action-result";
import type {
  ActivateBookingErrorResponse,
  ActivateBookingResponse,
  BookingQuoteResponse,
  CheckoutReturnResponse,
  ConfirmBookingResponse,
} from "@/lib/types/zone";

function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  return base;
}

export async function fetchZone(qrId: string) {
  const response = await fetch(`${getApiBaseUrl()}/public/zones/${qrId}`, {
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
): Promise<ApiActionResult<BookingQuoteResponse>> {
  const response = await fetch(`${getApiBaseUrl()}/public/bookings/checkout/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingBody),
  });
  const data = (await response.json()) as BookingQuoteResponse & ApiErrorBody;

  if (!response.ok) {
    return apiFailure(data);
  }

  return apiSuccess(data);
}

export async function submitBookingReturn(params: {
  checkout_id: string;
  tap_id: string;
}): Promise<ApiActionResult<CheckoutReturnResponse>> {
  const response = await fetch(`${getApiBaseUrl()}/public/bookings/confirm/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      checkout_id: params.checkout_id,
      tap_id: params.tap_id,
    }),
  });
  const data = (await response.json()) as CheckoutReturnResponse & ApiErrorBody;
  console.log("data", data);

  if (!response.ok) {
    return apiFailure(data);
  }

  return apiSuccess(data);
}

export async function confirmBooking(
  checkout_id: string,
): Promise<ApiActionResult<ConfirmBookingResponse>> {
  const response = await fetch(`${getApiBaseUrl()}/public/bookings/confirm/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ checkout_id }),
  });
  const data = (await response.json()) as ConfirmBookingResponse & ApiErrorBody;

  if (!response.ok) {
    return apiFailure(data);
  }

  return apiSuccess(data);
}

export async function activateBooking(params: {
  zone: number;
  plate: string;
}): Promise<ActivateBookingResponse> {
  const search = new URLSearchParams({
    zone: String(params.zone),
    plate: params.plate,
  });
  const response = await fetch(
    `${getApiBaseUrl()}/public/bookings/active/?${search}`,
    {
      cache: "no-store",
    },
  );

  const data = (await response.json()) as
    | ActivateBookingResponse
    | ActivateBookingErrorResponse;

  if (!response.ok) {
    throw data;
  }

  return data as ActivateBookingResponse;
}

export async function fetchBooking(bookingId: string) {
  const response = await fetch(
    `${getApiBaseUrl()}/public/bookings/${bookingId}`,
    {
      cache: "no-store",
    },
  );
  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}

export async function fetchBookingBillHtml(
  bookingId: number,
  plate: string,
): Promise<ApiActionResult<{ html: string }>> {
  const query = new URLSearchParams({ plate });
  const response = await fetch(
    `${getApiBaseUrl()}/public/bookings/${encodeURIComponent(String(bookingId))}/bill/?${query}`,
    { cache: "no-store", headers: { Accept: "text/html" } },
  );

  if (!response.ok) {
    let error: ApiErrorBody = { detail: "request_failed" };
    try {
      error = (await response.json()) as ApiErrorBody;
    } catch {
      const text = await response.text();
      if (text.length > 0) {
        error = { detail: text.slice(0, 500) };
      }
    }
    return apiFailure(error);
  }

  const html = await response.text();
  return apiSuccess({ html });
}
