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
  searchParams: Promise<{
    plate?: string;
    zone?: string;
    step?: string;
    hours?: string;
    checkout_id?: string;
    tap_id?: string;
  }>;
};

export default async function BookingPage({
  params,
  searchParams,
}: BookingPageProps) {
  const { locale, qr } = await params;
  const { plate, zone, step, hours, checkout_id, tap_id } = await searchParams;

  return (
    <main className="relative flex flex-1 flex-col px-4  pb-8 pt-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <BackToScan />
        <BookingPanel
          qrId={qr}
          locale={locale}
          plate={plate}
          zoneParam={zone}
          step={step}
          hours={hours}
          checkoutId={checkout_id}
          tapId={tap_id}
        />
      </div>
    </main>
  );
}
