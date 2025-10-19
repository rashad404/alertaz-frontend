"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { useDictionary } from "@/providers/dictionary-provider";
import { siteApi } from "@/lib/api/endpoints";
import { getImageUrl, getTranslation } from "@/lib/utils";

interface AppDownloadSectionProps {
  locale: string;
}

export function AppDownloadSection({ locale }: AppDownloadSectionProps) {
  const dictionary = useDictionary();
  const t = dictionary.home.appDownload;

  const { data: appSection } = useQuery({
    queryKey: ["app-download-section", locale],
    queryFn: () => siteApi.getAppDownloadSection(locale),
  });

  if (!appSection?.data) {
    // Fallback content
    return (
      <div className="mb-8">
        <div className="bg-[#EFFFEB] rounded-2xl p-8 lg:p-14 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 max-w-xl">
              <h2 className="text-3xl lg:text-4xl font-medium text-grayscale-900 leading-tight mb-5">
                {t.title}
              </h2>
              <p className="text-text-gray-10 mb-8 leading-relaxed">
                {locale === 'az' ? 'Kredit.az mobil tətbiqi ilə istənilən vaxt və yerdən maliyyə xidmətlərinə çıxış əldə edin. Kreditləri müqayisə edin, ərizə verin və maliyyə vəziyyətinizi idarə edin.' : 
                 locale === 'ru' ? 'Получите доступ к финансовым услугам в любое время и в любом месте с мобильным приложением Kredit.az. Сравнивайте кредиты, подавайте заявки и управляйте своими финансами.' :
                 'Access financial services anytime, anywhere with the Kredit.az mobile app. Compare loans, apply, and manage your finances on the go.'}
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Link href="#" target="_blank" rel="noopener noreferrer">
                  <img
                    src="/app-store-badge.svg"
                    alt={t.downloadOnAppStore}
                    className="h-12 lg:h-14 hover:opacity-90 transition-opacity"
                  />
                </Link>
                <Link href="#" target="_blank" rel="noopener noreferrer">
                  <img
                    src="/google-play-badge.svg"
                    alt={t.downloadOnGooglePlay}
                    className="h-12 lg:h-14 hover:opacity-90 transition-opacity"
                  />
                </Link>
              </div>
            </div>
            <div className="flex-shrink-0">
              <img
                src="/mobile-app-mockup.svg"
                alt="Mobile app preview"
                className="w-48 h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const section = appSection.data;

  return (
    <div className="mb-8">
      <div className="bg-bg-light-green rounded-2xl p-8 lg:p-14 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex-1 max-w-xl">
            <h2 className="text-3xl lg:text-4xl font-medium text-grayscale-900 leading-tight mb-5">
              {getTranslation(section.title, locale)}
            </h2>
            <p className="text-text-gray-10 mb-8 leading-relaxed">
              {getTranslation(section.description, locale)}
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {section.app_store_url && (
                <Link href={section.app_store_url} target="_blank" rel="noopener noreferrer">
                  <img
                    src="/app-store-badge.svg"
                    alt={t.downloadOnAppStore}
                    className="h-12 lg:h-14 hover:opacity-90 transition-opacity"
                  />
                </Link>
              )}
              {section.play_store_url && (
                <Link href={section.play_store_url} target="_blank" rel="noopener noreferrer">
                  <img
                    src="/google-play-badge.svg"
                    alt={t.downloadOnGooglePlay}
                    className="h-12 lg:h-14 hover:opacity-90 transition-opacity"
                  />
                </Link>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <img
              src={section.image ? getImageUrl(section.image) : "/mobile-app-mockup.svg"}
              alt="Mobile app preview"
              className="w-48 lg:w-56 h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}