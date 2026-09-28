import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function BrandLogo() {
  const t = useTranslations("Header");

  return (
    <Link
      href="/"
      className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2"
      aria-label={t("home")}
    >
      <Image
        src="/images/logoDark.svg"
        alt={t("logoAlt")}
        width={240}
        height={102}
        priority
        unoptimized
        className="hidden h-10 w-auto max-w-40 object-contain sm:h-11 dark:block"
      />
      <Image
        src="/images/logo.svg"
        alt={t("logoAlt")}
        width={240}
        height={102}
        priority
        unoptimized
        className="h-10 w-auto max-w-40 object-contain sm:h-11 dark:hidden"
      />
    </Link>
  );
}
