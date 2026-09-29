"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
