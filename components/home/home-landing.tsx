"use client";

import { Clock, CreditCard, QrCode, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { ScanQr } from "@/components/home/scan-qr";
import { cn } from "@/lib/utils/cn";

const STEPS = [
  { icon: QrCode, titleKey: "landingStep1Title", descKey: "landingStep1Desc" },
  { icon: Clock, titleKey: "landingStep2Title", descKey: "landingStep2Desc" },
  {
    icon: UserRound,
    titleKey: "landingStep3Title",
    descKey: "landingStep3Desc",
  },
  {
    icon: CreditCard,
    titleKey: "landingStep4Title",
    descKey: "landingStep4Desc",
  },
] as const;

export function HomeLanding() {
  const t = useTranslations("HomePage");

  return (
    <article className="w-full max-w-4xl">
      <header className="text-center lg:text-start">
        <p className="inline-flex items-center rounded-full bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-400/10 dark:text-primary-300">
          {t("title")}
        </p>
        <h1 className="mt-4 text-balance text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {t("landingTitle")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base lg:mx-0">
          {t("landingSubtitle")}
        </p>
      </header>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("landingHowItWorks")}
          </h2>
          <ol
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
            aria-label={t("landingHowItWorks")}
          >
            {STEPS.map((step, index) => {
              const Icon = step.icon;

              return (
                <li
                  key={step.titleKey}
                  className={cn(
                    "flex flex-col gap-3 rounded-2xl p-4",
                    "bg-card/80 shadow-sm backdrop-blur-sm dark:bg-card/40",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl",
                        "bg-primary-500/10 text-primary-600 dark:text-primary-400",
                      )}
                      aria-hidden
                    >
                      <Icon className="size-4" strokeWidth={2.25} />
                    </div>
                    <span className="text-xs font-medium tabular-nums text-muted-foreground">
                      {t("stepLabel", { number: index + 1 })}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold leading-snug text-foreground">
                      {t(step.titleKey)}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {t(step.descKey)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <div
          className={cn(
            "rounded-2xl p-6 sm:p-8",
            "bg-linear-to-br from-card via-card to-primary-500/5",
            "shadow-md shadow-primary-900/5",
            "lg:sticky lg:top-24",
            "dark:from-card dark:to-primary-500/10 dark:shadow-black/20",
          )}
        >
          <ScanQr />
        </div>
      </div>
    </article>
  );
}
