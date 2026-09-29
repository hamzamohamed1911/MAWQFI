"use client";

import { fetchBookingBillHtml } from "@/lib/api/zones";

function downloadHtmlFile(html: string, filename: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function printHtmlBill(html: string): boolean {
  const printWindow = window.open("", "_blank", "noopener,noreferrer");

  if (!printWindow) {
    return false;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  window.setTimeout(() => {
    printWindow.print();
  }, 300);

  return true;
}

/** Fetches bill HTML via server (no browser CORS) then opens print dialog. */
export async function printBookingBillFromApi(
  bookingId: number,
  plate: string,
): Promise<void> {
  const result = await fetchBookingBillHtml(bookingId, plate);

  if (!result.ok) {
    const detail = result.error.detail;
    const message =
      typeof detail === "string" && detail.length > 0
        ? detail
        : "request_failed";
    throw new Error(message);
  }

  const filename = `booking-${bookingId}-bill.html`;
  downloadHtmlFile(result.data.html, filename);

  const printed = printHtmlBill(result.data.html);
  if (!printed) {
    throw new Error("popup_blocked");
  }
}
