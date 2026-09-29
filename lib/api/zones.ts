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
): Promise<ApiActionResult<BookingQuoteResponse>> {
  const response = await fetch(`${API_URL}/public/bookings/checkout/`, {
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

export async function confirmBooking(
  checkout_id: string,
): Promise<ApiActionResult<ConfirmBookingResponse>> {
  const response = await fetch(`${API_URL}/public/bookings/confirm/`, {
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
