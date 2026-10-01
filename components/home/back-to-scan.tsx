import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function BackToScan() {
  const t = await getTranslations("HomePage");

  return (
    <Link
      href="/"
      className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 dark:hover:bg-primary/10"
    >
      <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
      {t("backToScan")}
    </Link>
  );
}
