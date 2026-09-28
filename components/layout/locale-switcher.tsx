"use client";

import { Menu } from "@base-ui/react/menu";
import { Check, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

const localeFlags = {
  en: "/icons/en.svg",
  ar: "/icons/ar.svg",
} as const;

export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchLocale(nextLocale: AppLocale) {
    if (nextLocale === locale) {
      return;
    }

    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        disabled={isPending}
        aria-label={t("label")}
        className="inline-flex cursor-pointer h-9 items-center gap-2 rounded-lg border border-white/25 bg-white/15 px-2.5 text-sm font-bold text-natural-25 outline-none backdrop-blur-sm transition-colors hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/60 data-popup-open:bg-white/25"
      >
        <Image
          src={localeFlags[locale]}
          alt=""
          width={20}
          height={14}
          unoptimized
          className="h-3.5 w-5 rounded-sm object-cover shadow-sm"
        />
        <span className="text-primary-600">
          <span className="sm:hidden">{locale}</span>
          <span className="hidden sm:inline">{t(locale)}</span>
        </span>
        <ChevronDown className="size-4 text-primary-600 opacity-80" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner className="outline-none" sideOffset={8} align="end">
          <Menu.Popup className="min-w-44 origin-(--transform-origin) rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <p className="px-2.5 py-1.5 text-xs font-bold text-primary-400">
              {t("label")}
            </p>
            {routing.locales.map((nextLocale) => {
              const isActive = locale === nextLocale;

              return (
                <Menu.Item
                  key={nextLocale}
                  onClick={() => switchLocale(nextLocale)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-bold outline-none select-none data-highlighted:bg-muted",
                    isActive && "bg-muted/70",
                  )}
                >
                  <Image
                    src={localeFlags[nextLocale]}
                    alt=""
                    width={20}
                    height={14}
                    unoptimized
                    className="h-3.5 w-5 rounded-sm object-cover shadow-sm"
                  />
                  <span className="flex-1">{t(nextLocale)}</span>
                  <Check
                    className={cn(
                      "size-4 text-primary-500",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                </Menu.Item>
              );
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
