"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export function PaymentReviewHeader() {
  const t = useTranslations("HomePage");

  return (
    <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="flex flex-col gap-2 sm:gap-3">
        <h2 className="text-xl font-bold text-foreground md:text-2xl">
          {t("paymentReviewTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("paymentReviewDescription")}
        </p>
      </div>
      <Badge
        variant="outline"
        className={cn(
          "w-fit shrink-0 gap-2 border-primary-200 bg-primary-50 px-3 py-2 text-primary-700",
          "dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-200",
        )}
      >
        <ShieldCheck className="size-4" aria-hidden />
        {t("securePayment")}
      </Badge>
    </div>
  );
}
