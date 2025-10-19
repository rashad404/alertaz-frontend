"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, Shield, CreditCard } from "lucide-react";
import Link from "next/link";
import { useDictionary } from "@/providers/dictionary-provider";
import { companyApi } from "@/lib/api/endpoints";
import { getTranslation } from "@/lib/utils";
import { getLocalizedPath } from "@/lib/utils/locale";

interface CategoriesSectionProps {
  locale: string;
}

const categoryColors = {
  banks: "bg-red-50",
  insurance: "bg-blue-50",
  bokt: "bg-yellow-50",
};

const categoryIcons = {
  banks: Building2,
  insurance: Shield,
  bokt: CreditCard,
};

export function CategoriesSection({ locale }: CategoriesSectionProps) {
  const dictionary = useDictionary();
  const t = dictionary.home;

  const { data: response, isLoading } = useQuery({
    queryKey: ["company-types", locale],
    queryFn: () => companyApi.getTypes(locale),
  });

  const companyTypes = response?.data?.data || response?.data || [];

  if (isLoading || !Array.isArray(companyTypes) || companyTypes.length === 0) {
    return (
      <div className="flex md:grid md:grid-cols-3 gap-4 mb-11 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none scrollbar-hide">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-5 h-48 animate-pulse min-w-[280px] md:min-w-0 snap-start" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex md:grid md:grid-cols-3 gap-4 mb-8 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none scrollbar-hide">
      {companyTypes.slice(0, 3).map((type: any, index: number) => {
        const colorClass = Object.values(categoryColors)[index] || "bg-gray-50";
        const Icon = Object.values(categoryIcons)[index] || Building2;

        return (
          <div key={type.id} className={`${colorClass} rounded-xl p-5 relative overflow-hidden min-w-[280px] md:min-w-0 snap-start flex-shrink-0`}>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-black mb-3">
                {getTranslation(type.title, locale)}
              </h3>
              <div className="space-y-2 mb-5">
                {Array.isArray(type.companies) && type.companies.length > 0 ? (
                  type.companies.slice(0, 3).map((company: any, index: number) => (
                    <Link
                      key={`${type.id}-company-${company.id || index}`}
                      href={getLocalizedPath(locale, `/sirketler/${type.slug}/${company.slug}`)}
                      className="block text-gray-600 text-sm hover:underline first:underline"
                    >
                      {getTranslation(company.name || company.title, locale)}
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No companies available</p>
                )}
              </div>
              <Link
                href={getLocalizedPath(locale, `/sirketler/${type.slug}`)}
                className={`inline-flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                  index === 0 
                    ? 'bg-brand-orange text-white hover:bg-brand-orange-dark' 
                    : 'border border-brand-orange text-brand-orange-text hover:bg-brand-orange/10'
                }`}
              >
                <span>{t.viewAll}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="absolute top-5 right-5 opacity-5">
              <Icon className="w-17 h-17 text-black" />
            </div>
          </div>
        );
      })}
    </div>
  );
}