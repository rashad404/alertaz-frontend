"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useDictionary } from "@/providers/dictionary-provider";
import { companyApi } from "@/lib/api/endpoints";
import { getImageUrl } from "@/lib/utils";
import { parseTranslatedContent } from "@/lib/utils/translation";
import { getLocalizedPath } from "@/lib/utils/locale";

interface PartnerBanksProps {
  locale: string;
}

export function PartnerBanks({ locale }: PartnerBanksProps) {
  const dictionary = useDictionary();
  const t = dictionary.home;
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const { data: partners, isLoading } = useQuery({
    queryKey: ["partner-banks", locale],
    queryFn: () => companyApi.getCompaniesByType('banks', locale),
  });

  // Default partners for when API is not available
  const defaultPartners = [
    { id: 1, name: { az: "Kapital Bank" }, logo: "/banks/kapital.svg" },
    { id: 2, name: { az: "PAŞA Bank" }, logo: "/banks/pasha.svg" },
    { id: 3, name: { az: "Bank Respublika" }, logo: "/banks/respublika.svg" },
    { id: 4, name: { az: "ABB" }, logo: "/banks/abb.svg" },
    { id: 5, name: { az: "Unibank" }, logo: "/banks/unibank.svg" },
    { id: 6, name: { az: "AccessBank" }, logo: "/banks/access.svg" },
  ];

  const partnerData = Array.isArray(partners?.data) && partners.data.length > 0 ? partners.data : defaultPartners;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-black dark:text-white">
          {t.partnerBanks}
        </h2>
        <Link
          href={getLocalizedPath(locale, '/sirketler/banklar')}
          className="flex items-center space-x-1 border border-black/50 dark:border-gray-600 text-black dark:text-white px-3 py-2 rounded-lg text-sm opacity-50 hover:opacity-100 transition-opacity"
        >
          <span>{t.moreBanks}</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center">
          {partnerData.map((partner) => {
            // Handle different data structures (API vs default)
            const bankName = partner.name ? parseTranslatedContent(partner.name, locale) : partner.title;
            const bankLogo = partner.logo || partner.image;
            
            return (
              <div key={partner.id} className="flex items-center justify-center">
                <img
                  src={imageErrors[partner.id] ? "/news-placeholder.svg" : (bankLogo?.startsWith('/banks/') ? bankLogo : getImageUrl(bankLogo))}
                  alt={bankName}
                  className="h-12 lg:h-16 w-auto object-contain filter grayscale hover:grayscale-0 transition-all"
                  onError={() => setImageErrors(prev => ({ ...prev, [partner.id]: true }))}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}