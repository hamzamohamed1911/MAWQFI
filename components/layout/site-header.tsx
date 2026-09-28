"use client";

import { useEffect, useState } from "react";

import { BrandLogo } from "./brand-logo";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeSwitcher } from "./theme-switcher";

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b overflow-hidden bg-background/10 backdrop-blur-md border-white/15 transition-all duration-300 ${
        isScrolled
          ? "bg-primary-50 backdrop-blur-md dark:bg-primary-900"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:gap-4">
        <BrandLogo />

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
