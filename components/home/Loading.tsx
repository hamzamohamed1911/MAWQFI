"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Progress } from "@/components/ui/progress";

const LOADING_DURATION_MS = 2200;

export function Loading() {
  const t = useTranslations("HomePage");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    let frameId = 0;

    const animate = (now: number) => {
      const elapsed = (now - startTime) % LOADING_DURATION_MS;
      const phase = elapsed / LOADING_DURATION_MS;

      let nextValue: number;

      if (phase < 0.45) {
        nextValue = (phase / 0.45) * 100;
      } else if (phase < 0.55) {
        nextValue = 100;
      } else {
        nextValue = 100 - ((phase - 0.55) / 0.45) * 100;
      }

      setProgress(nextValue);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-5 py-6 sm:py-8">
      <div className="flex w-full max-w-sm items-end gap-3 sm:max-w-md sm:gap-4">
        <Image
          src="/images/loadingLogo.svg"
          alt=""
          width={97}
          height={97}
          priority
          unoptimized
          className="size-18 shrink-0 sm:size-24.25"
        />

        <Progress
          value={progress}
          aria-label={t("zonesLoading")}
          className="mb-3 min-w-0 flex-1 gap-0 **:data-[slot=progress-indicator]:rounded-full **:data-[slot=progress-indicator]:bg-primary-500 **:data-[slot=progress-indicator]:transition-none **:data-[slot=progress-track]:h-3 **:data-[slot=progress-track]:rounded-full **:data-[slot=progress-track]:bg-natural-200"
        />
      </div>

      <p className="max-w-md px-2 text-center text-sm leading-relaxed text-muted-foreground">
        {t("loadingZoneWait")}
      </p>
    </div>
  );
}
