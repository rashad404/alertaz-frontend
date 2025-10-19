"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { i18n, type Locale } from "@/i18n-config";

const languageNames: Record<Locale, string> = {
  az: "AZE",
  en: "ENG",
  ru: "RUS",
};

export function LanguageSwitcher({ locale }: { locale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (newLocale: Locale) => {
    // Remove the current locale prefix from pathname
    let currentPathname = pathname;
    
    // If current locale is not 'az', remove the locale prefix
    if (locale !== 'az') {
      currentPathname = pathname.replace(`/${locale}`, "");
    }
    // If current locale is 'az' (no prefix), pathname is already correct
    
    // Build new path based on target locale
    let newPath: string;
    if (newLocale === 'az') {
      // For 'az', don't add prefix
      newPath = currentPathname || '/';
    } else {
      // For other locales, add the prefix
      newPath = `/${newLocale}${currentPathname}`;
    }
    
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 font-bold hover:text-brand-orange transition-colors"
      >
        <span>{languageNames[locale as Locale]}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-24 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          {i18n.locales.map((lng) => (
            <button
              key={lng}
              onClick={() => handleLanguageChange(lng)}
              className={`block w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                lng === locale ? "bg-gray-50 dark:bg-gray-700 text-brand-orange" : ""
              }`}
            >
              {languageNames[lng]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}