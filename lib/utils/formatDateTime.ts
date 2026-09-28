export function formatDateTime(date: Date, locale: string) {
  const intlLocale = locale.startsWith("ar") ? "ar-SA" : "en-US";

  return new Intl.DateTimeFormat(intlLocale, {
    month: "long",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}