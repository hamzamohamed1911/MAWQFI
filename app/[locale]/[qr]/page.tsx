import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
};

export default async function BookingPage({ params }: BookingPageProps) {
  const { locale, qr } = await params;

  if (!hasLocale(routing.locales, locale) || !qr) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <main className="relative flex flex-1 flex-col px-4  py-8 ">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <BackToScan />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <BookingPanel qrId={qr} />
        </div>
      </div>
    </main>
  );
}
