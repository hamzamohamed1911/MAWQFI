import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { HomeLanding } from "@/components/home/home-landing";
import { routing } from "@/i18n/routing";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center bg-background px-4 py-8 sm:px-6 sm:py-12 dark:bg-background">
      <HomeLanding />
    </main>
  );
}
