"use client";

import { Switch } from "@base-ui/react/switch";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const t = useTranslations("ThemeSwitcher");
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Switch.Root
      checked={isDark}
      disabled={!mounted}
      aria-label={t("label")}
      onCheckedChange={(checked) => {
        setTheme(checked ? "dark" : "light");
      }}
      className="relative cursor-pointer inline-flex h-9 w-16 shrink-0 items-center rounded-full border-2 border-primary-400/70 bg-primary-100 p-0.5 shadow-md outline-none ring-1 ring-primary-500/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background data-checked:border-primary-200 data-checked:bg-primary-900 data-checked:ring-primary-950/20 data-disabled:opacity-70"
    >
      <Switch.Thumb className="relative z-10 flex size-7 items-center justify-center rounded-full bg-primary-500 text-white shadow-sm transition-transform duration-200 ease-out data-checked:translate-x-7 rtl:data-checked:-translate-x-7">
        {isDark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
      </Switch.Thumb>
    </Switch.Root>
  );
}
