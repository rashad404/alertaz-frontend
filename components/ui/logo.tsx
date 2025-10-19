"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export function Logo({ locale = 'az' }: { locale?: string }) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // For 'az' locale, use root path. For others, maintain the locale
  const homePath = locale === 'az' ? '/' : `/${locale}`;

  const handleLogoClick = (e: React.MouseEvent) => {
    const isHomePage = pathname === '/' || pathname === `/${locale}` || pathname === '/az' || pathname === '/en' || pathname === '/ru';

    if (isHomePage) {
      e.preventDefault();
      window.location.href = homePath;
    }
  };

  if (!mounted) {
    // Return a placeholder with same dimensions to prevent layout shift
    return (
      <Link href={homePath} className="flex items-center">
        <div className="w-24 h-7 lg:w-28 lg:h-8" />
      </Link>
    );
  }

  const currentTheme = theme === "system" ? systemTheme : theme;
  const logoSrc = currentTheme === "dark" ? "/logo-dark.svg" : "/logo.svg";

  return (
    <Link href={homePath} onClick={handleLogoClick} className="flex items-center hover:opacity-90 transition-opacity flex-shrink-0">
      <Image
        src={logoSrc}
        alt="Kredit.az"
        width={180}
        height={50}
        priority
        className="h-7 w-auto lg:h-8 lg:w-auto object-contain"
      />
    </Link>
  );
}