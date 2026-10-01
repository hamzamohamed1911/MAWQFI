import { Almarai } from "next/font/google";
import Link from "next/link";
import {
  NotFoundView,
  notFoundHomeButtonClassName,
} from "@/components/layout/not-found-view";
import { NotFoundLogo } from "@/components/layout/not-found-logo";
import { routing } from "@/i18n/routing";
import arMessages from "@/messages/ar.json";
import "./globals.css";

const almarai = Almarai({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
  display: "swap",
});

const homePath = `/${routing.defaultLocale}`;

export default function RootNotFoundPage() {
  const copy = arMessages.NotFound;
  const logoAlt = arMessages.Header.logoAlt;

  return (
    <html lang={routing.defaultLocale} dir="rtl" className={`${almarai.variable} h-full`}>
      <body className={`${almarai.className} m-0 min-h-full antialiased`}>
        <NotFoundView
          variant="root"
          title={copy.title}
          description={copy.description}
          logo={
            <Link href={homePath} aria-label={arMessages.Header.home}>
              <NotFoundLogo alt={logoAlt} forceLight />
            </Link>
          }
          action={
            <Link href={homePath} className={notFoundHomeButtonClassName()}>
              {copy.backHome}
            </Link>
          }
        />
      </body>
    </html>
  );
}
