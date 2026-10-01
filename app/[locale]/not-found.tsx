import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  NotFoundView,
  notFoundHomeButtonClassName,
} from "@/components/layout/not-found-view";
import { NotFoundLogo } from "@/components/layout/not-found-logo";

export default async function LocaleNotFoundPage() {
  const t = await getTranslations("NotFound");
  const tHeader = await getTranslations("Header");

  return (
    <NotFoundView
      variant="locale"
      className="min-h-[50dvh] flex-1"
      title={t("title")}
      description={t("description")}
      logo={
        <Link href="/" aria-label={tHeader("home")}>
          <NotFoundLogo alt={tHeader("logoAlt")} />
        </Link>
      }
      action={
        <Link href="/" className={notFoundHomeButtonClassName()}>
          {t("backHome")}
        </Link>
      }
    />
  );
}
