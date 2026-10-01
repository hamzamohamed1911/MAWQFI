import Image from "next/image";
import { cn } from "@/lib/utils/cn";

type NotFoundLogoProps = {
  alt: string;
  /** Root page has no theme toggle — always use the light-background logo. */
  forceLight?: boolean;
  className?: string;
};

export function NotFoundLogo({
  alt,
  forceLight = false,
  className,
}: NotFoundLogoProps) {
  if (forceLight) {
    return (
      <Image
        src="/images/logo.svg"
        alt={alt}
        width={200}
        height={84}
        priority
        unoptimized
        className={cn("h-9 w-auto object-contain sm:h-10", className)}
      />
    );
  }

  return (
    <>
      <Image
        src="/images/logo.svg"
        alt={alt}
        width={200}
        height={84}
        priority
        unoptimized
        className={cn(
          "h-9 w-auto object-contain dark:hidden sm:h-10",
          className,
        )}
      />
      <Image
        src="/images/logoDark.svg"
        alt={alt}
        width={200}
        height={84}
        priority
        unoptimized
        className={cn(
          "hidden h-9 w-auto object-contain dark:block sm:h-10",
          className,
        )}
      />
    </>
  );
}
