"use client";

import { Link } from '@/lib/navigation';
import Image from "next/image";
import { Building2, Phone, Globe, MapPin } from "lucide-react";
import { parseTranslatedContent } from "@/lib/utils/translation";

interface CompanyCardProps {
  company: {
    id: number;
    name: string | { [key: string]: string };
    slug: string;
    logo?: string;
    website?: string;
    phone?: string;
    addresses?: string | string[] | { [key: string]: string };
    description?: string | { [key: string]: string };
  };
  locale: string;
  type: string;
}

export function CompanyCard({ company, locale, type }: CompanyCardProps) {
  const name = parseTranslatedContent(company.name, locale);
  const description = company.description ? parseTranslatedContent(company.description, locale) : null;
  
  // Parse addresses
  let address = null;
  if (company.addresses) {
    if (typeof company.addresses === 'string') {
      try {
        const parsed = JSON.parse(company.addresses);
        address = Array.isArray(parsed) ? parsed[0] : parsed[locale] || parsed.az || parsed;
      } catch {
        address = company.addresses;
      }
    } else if (Array.isArray(company.addresses)) {
      address = company.addresses[0];
    } else {
      address = company.addresses[locale] || company.addresses.az;
    }
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <Link href={`/sirketler/${type}/${company.slug}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          {company.logo && (
            <div className="mb-4 flex justify-center">
              <div className="relative w-32 h-16">
                <Image
                  src={company.logo.startsWith('http') ? company.logo : `/storage/${company.logo}`}
                  alt={name}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
          
          {/* Company Name */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {name}
          </h3>
          
          {/* Description */}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {description}
            </p>
          )}
          
          {/* Contact Info */}
          <div className="mt-auto space-y-2">
            {company.phone && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4 mr-2" />
                <span>{company.phone}</span>
              </div>
            )}
            
            {address && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="line-clamp-1">{address}</span>
              </div>
            )}
            
            {company.website && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Globe className="w-4 h-4 mr-2" />
                <span className="line-clamp-1">{company.website}</span>
              </div>
            )}
          </div>
          
          {/* View Details Button */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-brand-orange hover:text-brand-orange-dark font-medium text-sm">
              View Details →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}