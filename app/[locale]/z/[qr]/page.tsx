import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { BackToScan } from "@/components/home/back-to-scan";
import { BookingPanel } from "@/components/home/booking-panel";
import { routing } from "@/i18n/routing";
import { fetchZone } from "@/lib/api/zones";

export async function generateMetadata({
  params,
}: BookingPageProps): Promise<Metadata> {
  const { locale, qr } = await params;
  const safeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;
  const t = await getTranslations({
    locale: safeLocale,
    namespace: "HomePage",
  });

  try {
    const zone = await fetchZone(qr);
    const title = zone.site_name;

    return {
      title,
      openGraph: {
        title,
      },
    };
  } catch {
    return {
      title: t("title"),
    };
  }
}

type BookingPageProps = {
  params: Promise<{ locale: string; qr: string }>;
  searchParams: Promise<{ plate?: string }>;
};

export default async function BookingPage({
  params,
  searchParams,
}: BookingPageProps) {
  const { qr } = await params;
  const { plate } = await searchParams;

  return (
    <main className="relative flex flex-1 flex-col px-4  pb-8 pt-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <BackToScan />
        <BookingPanel qrId={qr} plate={plate} />
      </div>
    </main>
  );
}
