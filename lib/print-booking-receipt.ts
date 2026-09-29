import type { ActiveBooking, PaymentResult } from "@/lib/types/zone";
import { formatDateTime } from "@/lib/utils/formatDateTime";

export type ReceiptLabels = {
  title: string;
  bookingId: string;
  site: string;
  zone: string;
  plate: string;
  duration: string;
  amount: string;
  reference: string;
  starts: string;
  expires: string;
  hourUnit: string;
  hoursUnit: string;
  minuteUnit: string;
  minutesUnit: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDuration(
  minutes: number,
  labels: Pick<ReceiptLabels, "hourUnit" | "hoursUnit" | "minuteUnit" | "minutesUnit">,
) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? labels.hourUnit : labels.hoursUnit}`);
  }

  if (mins > 0 || hours === 0) {
    parts.push(`${mins} ${mins === 1 ? labels.minuteUnit : labels.minutesUnit}`);
  }

  return parts.join(" ");
}

export function printBookingReceipt(params: {
  booking: ActiveBooking;
  payment: PaymentResult;
  labels: ReceiptLabels;
  locale: string;
  brandName: string;
}) {
  const { booking, payment, labels, locale, brandName } = params;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const lang = locale === "ar" ? "ar" : "en";

  const rows: { label: string; value: string }[] = [
    { label: labels.bookingId, value: String(booking.id) },
    { label: labels.site, value: booking.site_name },
    { label: labels.zone, value: booking.zone_name },
    { label: labels.plate, value: booking.plate },
    {
      label: labels.duration,
      value: formatDuration(booking.duration_minutes, labels),
    },
    {
      label: labels.amount,
      value: `${booking.amount} ${booking.currency}`,
    },
    { label: labels.reference, value: payment.reference },
    {
      label: labels.starts,
      value: formatDateTime(new Date(booking.created_at), locale),
    },
    {
      label: labels.expires,
      value: formatDateTime(new Date(booking.expires_at), locale),
    },
  ];

  const rowsHtml = rows
    .map(
      (row) => `
        <tr>
          <th scope="row">${escapeHtml(row.label)}</th>
          <td>${escapeHtml(row.value)}</td>
        </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(labels.title)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 24px;
        font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
        color: #111;
        background: #fff;
      }
      .receipt {
        max-width: 360px;
        margin: 0 auto;
      }
      h1 {
        margin: 0 0 4px;
        font-size: 1.125rem;
        font-weight: 800;
      }
      .brand {
        margin: 0 0 20px;
        font-size: 0.75rem;
        color: #666;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.8125rem;
      }
      th, td {
        padding: 8px 0;
        vertical-align: top;
        text-align: start;
        border-bottom: 1px solid #eee;
      }
      th {
        width: 42%;
        font-weight: 600;
        color: #444;
      }
      td {
        font-weight: 700;
      }
      @media print {
        body { padding: 12px; }
      }
    </style>
  </head>
  <body>
    <article class="receipt">
      <h1>${escapeHtml(labels.title)}</h1>
      <p class="brand">${escapeHtml(brandName)}</p>
      <table>${rowsHtml}</table>
    </article>
  </body>
</html>`;

  const printWindow = window.open("", "_blank", "noopener,noreferrer");

  if (!printWindow) {
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  window.setTimeout(() => {
    printWindow.print();
  }, 300);
}
