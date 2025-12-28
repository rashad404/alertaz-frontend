'use client';

import React from 'react';
import { Link } from '@/lib/navigation';
import { 
  Phone, 
  MapPin, 
  Mail, 
  Globe, 
  Building2, 
  Calendar,
  CreditCard,
  Shield,
  Wallet,
  ChevronRight,
  Info,
  FileText,
  Hash
} from 'lucide-react';

interface CompanyData {
  id: number;
  name: any;
  slug?: string;
  short_name?: any;
  logo?: string;
  about?: string;
  phone?: any;
  phones?: any;
  address?: string;
  addresses?: any;
  website?: string;
  site?: string;
  email?: string;
  establishment_date?: string;
  
  // Bank specific fields
  voen?: string;
  bank_code?: string;
  correspondent_account?: string;
  swift_code?: string;
  reuters_dealing?: string;
  
  // Insurance specific fields
  license_number?: string;
  insurance_types?: string[];
  
  // Company type info
  company_type?: {
    id: number;
    title: any;
    slug: string;
  };
}

interface CompanyDetailClientProps {
  params: { lang: string; slug: string };
  companyData: CompanyData;
}

export default function CompanyDetailClient({ params, companyData }: CompanyDetailClientProps) {
  const { lang } = params;
  
  // Parse company name
  const getCompanyName = () => {
    if (typeof companyData.name === 'object' && companyData.name !== null) {
      return companyData.name[lang] || companyData.name['az'] || 'Company';
    }
    if (typeof companyData.name === 'string') {
      try {
        if (companyData.name.startsWith('{')) {
          const parsed = JSON.parse(companyData.name);
          return parsed[lang] || parsed['az'] || companyData.name;
        }
      } catch {
        // If parsing fails, return as is
      }
    }
    return companyData.name || 'Company';
  };

  // Parse company type title
  const getCompanyTypeTitle = () => {
    if (!companyData.company_type) return '';
    
    const title = companyData.company_type.title;
    if (typeof title === 'object' && title !== null) {
      return title[lang] || title['az'] || '';
    }
    if (typeof title === 'string') {
      try {
        if (title.startsWith('{')) {
          const parsed = JSON.parse(title);
          return parsed[lang] || parsed['az'] || title;
        }
      } catch {
        // If parsing fails, return as is
      }
    }
    return title || '';
  };

  // Get company type specific labels
  const getLabels = () => {
    const type = companyData.company_type?.slug;
    const labels: any = {
      az: {
        banks: {
          title: 'Bank məlumatları',
          details: 'Bank rekvizitləri',
          voen: 'VÖEN',
          swift: 'SWIFT kodu',
          correspondent: 'Müxbir hesab',
          bankCode: 'Bank kodu',
          reuters: 'Reuters Dealing'
        },
        insurance: {
          title: 'Sığorta şirkəti',
          details: 'Lisenziya məlumatları',
          license: 'Lisenziya nömrəsi',
          types: 'Sığorta növləri'
        },
        'credit-organizations': {
          title: 'Kredit təşkilatı',
          details: 'Lisenziya məlumatları',
          license: 'Lisenziya nömrəsi'
        },
        common: {
          about: 'Haqqında',
          contact: 'Əlaqə məlumatları',
          phone: 'Telefon',
          email: 'E-poçt',
          website: 'Veb sayt',
          address: 'Ünvan',
          established: 'Təsis tarixi',
          viewWebsite: 'Sayta keç'
        }
      },
      en: {
        banks: {
          title: 'Bank Information',
          details: 'Bank Details',
          voen: 'TIN',
          swift: 'SWIFT Code',
          correspondent: 'Correspondent Account',
          bankCode: 'Bank Code',
          reuters: 'Reuters Dealing'
        },
        insurance: {
          title: 'Insurance Company',
          details: 'License Information',
          license: 'License Number',
          types: 'Insurance Types'
        },
        'credit-organizations': {
          title: 'Credit Organization',
          details: 'License Information',
          license: 'License Number'
        },
        common: {
          about: 'About',
          contact: 'Contact Information',
          phone: 'Phone',
          email: 'Email',
          website: 'Website',
          address: 'Address',
          established: 'Established',
          viewWebsite: 'Visit Website'
        }
      },
      ru: {
        banks: {
          title: 'Информация о банке',
          details: 'Банковские реквизиты',
          voen: 'ИНН',
          swift: 'SWIFT код',
          correspondent: 'Корреспондентский счет',
          bankCode: 'Код банка',
          reuters: 'Reuters Dealing'
        },
        insurance: {
          title: 'Страховая компания',
          details: 'Информация о лицензии',
          license: 'Номер лицензии',
          types: 'Виды страхования'
        },
        'credit-organizations': {
          title: 'Кредитная организация',
          details: 'Информация о лицензии',
          license: 'Номер лицензии'
        },
        common: {
          about: 'О компании',
          contact: 'Контактная информация',
          phone: 'Телефон',
          email: 'Эл. почта',
          website: 'Веб-сайт',
          address: 'Адрес',
          established: 'Дата основания',
          viewWebsite: 'Перейти на сайт'
        }
      }
    };

    const currentLang = labels[lang] || labels.az;
    const companyType = companyData.company_type?.slug || 'common';
    return {
      ...currentLang.common,
      ...(currentLang[companyType] || {})
    };
  };

  // Get company type icon
  const getCompanyIcon = () => {
    const type = companyData.company_type?.slug;
    switch (type) {
      case 'banks':
        return CreditCard;
      case 'insurance':
        return Shield;
      case 'credit-organizations':
        return Wallet;
      default:
        return Building2;
    }
  };

  const companyName = getCompanyName();
  const companyTypeTitle = getCompanyTypeTitle();
  const labels = getLabels();
  const CompanyIcon = getCompanyIcon();
  
  // Get phone number
  const phoneNumber = companyData.phones?.[0] || companyData.phone;
  
  // Get address
  const getAddress = () => {
    if (companyData.addresses && Array.isArray(companyData.addresses) && companyData.addresses.length > 0) {
      const addr = companyData.addresses[0];
      return typeof addr === 'object' ? addr.address : addr;
    }
    return companyData.address;
  };
  
  const address = getAddress();
  const website = companyData.site || companyData.website;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-[#F6F6F6] dark:bg-gray-800 py-12">
        <div className="flex justify-center items-center px-4 md:px-36">
          <div className="flex w-full max-w-5xl justify-between items-center">
            <div className="flex items-center gap-4">
              {companyData.logo ? (
                <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center">
                  <img
                    src={companyData.logo}
                    alt={companyName}
                    className="w-full h-full object-contain p-3"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center">
                  <CompanyIcon className="w-10 h-10 text-gray-400" />
                </div>
              )}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#09121F] dark:text-white">
                  {companyName}
                </h1>
                {companyTypeTitle && (
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                    {companyTypeTitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col justify-center items-center gap-8 py-12 px-4 md:px-36">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              {companyData.about && (
                <div className="bg-[#F6F6F6] dark:bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-[#09121F] dark:text-white mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-[#FF6021]" />
                    {labels.about}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {companyData.about}
                  </p>
                </div>
              )}

              {/* Type-specific Details Section */}
              {(companyData.company_type?.slug === 'banks' && (companyData.voen || companyData.swift_code || companyData.bank_code)) && (
                <div className="bg-[#F6F6F6] dark:bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-[#09121F] dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#FF6021]" />
                    {labels.details}
                  </h2>
                  <div className="space-y-3">
                    {companyData.voen && (
                      <div className="flex items-start gap-3">
                        <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{labels.voen}</p>
                          <p className="text-gray-900 dark:text-white font-medium">{companyData.voen}</p>
                        </div>
                      </div>
                    )}
                    {companyData.swift_code && (
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{labels.swift}</p>
                          <p className="text-gray-900 dark:text-white font-medium">{companyData.swift_code}</p>
                        </div>
                      </div>
                    )}
                    {companyData.bank_code && (
                      <div className="flex items-start gap-3">
                        <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{labels.bankCode}</p>
                          <p className="text-gray-900 dark:text-white font-medium">{companyData.bank_code}</p>
                        </div>
                      </div>
                    )}
                    {companyData.correspondent_account && (
                      <div className="flex items-start gap-3">
                        <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{labels.correspondent}</p>
                          <p className="text-gray-900 dark:text-white font-medium">{companyData.correspondent_account}</p>
                        </div>
                      </div>
                    )}
                    {companyData.reuters_dealing && (
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{labels.reuters}</p>
                          <p className="text-gray-900 dark:text-white font-medium">{companyData.reuters_dealing}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Insurance specific details */}
              {(companyData.company_type?.slug === 'insurance' && companyData.license_number) && (
                <div className="bg-[#F6F6F6] dark:bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-[#09121F] dark:text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#FF6021]" />
                    {labels.details}
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{labels.license}</p>
                        <p className="text-gray-900 dark:text-white font-medium">{companyData.license_number}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Credit organization specific details */}
              {(companyData.company_type?.slug === 'credit-organizations' && companyData.license_number) && (
                <div className="bg-[#F6F6F6] dark:bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-[#09121F] dark:text-white mb-4 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-[#FF6021]" />
                    {labels.details}
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{labels.license}</p>
                        <p className="text-gray-900 dark:text-white font-medium">{companyData.license_number}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Contact Info */}
            <div className="lg:col-span-1">
              <div className="bg-[#F6F6F6] dark:bg-gray-800 rounded-xl p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-[#09121F] dark:text-white mb-4">
                  {labels.contact}
                </h2>
                <div className="space-y-4">
                  {phoneNumber && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-[#FF6021] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{labels.phone}</p>
                        <p className="text-gray-900 dark:text-white font-medium">{phoneNumber}</p>
                      </div>
                    </div>
                  )}
                  
                  {companyData.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-[#FF6021] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{labels.email}</p>
                        <a 
                          href={`mailto:${companyData.email}`}
                          className="text-gray-900 dark:text-white font-medium hover:text-[#FF6021] transition-colors"
                        >
                          {companyData.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {website && (
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-[#FF6021] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{labels.website}</p>
                        <a 
                          href={website.startsWith('http') ? website : `https://${website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-900 dark:text-white font-medium hover:text-[#FF6021] transition-colors"
                        >
                          {website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[#FF6021] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{labels.address}</p>
                        <p className="text-gray-900 dark:text-white font-medium">{address}</p>
                      </div>
                    </div>
                  )}
                  
                  {companyData.establishment_date && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-[#FF6021] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{labels.established}</p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {new Date(companyData.establishment_date).getFullYear()}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {website && (
                    <a 
                      href={website.startsWith('http') ? website : `https://${website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 w-full bg-[#FF6021] text-white rounded-lg px-4 py-3 font-medium hover:bg-[#E54500] transition-colors flex items-center justify-center gap-2"
                    >
                      {labels.viewWebsite}
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}