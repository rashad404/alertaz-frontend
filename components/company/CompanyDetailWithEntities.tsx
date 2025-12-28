'use client';

import React, { useState } from 'react';
import { Link } from '@/lib/navigation';
import CompanyProductCards from '@/components/company/CompanyProductCards';
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
  Hash,
  Clock,
  DollarSign,
  Percent,
  Gift,
  Star,
  Users,
  Briefcase,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Banknote
} from 'lucide-react';

interface CompanyDetailWithEntitiesProps {
  params: { lang: string; slug: string; type?: string };
  companyData: any;
}

export default function CompanyDetailWithEntities({ params, companyData }: CompanyDetailWithEntitiesProps) {
  const { lang, type } = params;
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    branches: false,
    deposits: true,
    cards: true,
    loans: true,
    insurance_product: true,
    credit_loan: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Parse company name
  const getCompanyName = () => {
    if (typeof companyData.name === 'object' && companyData.name !== null) {
      return companyData.name[lang] || companyData.name['az'] || 'Company';
    }
    return companyData.name || 'Company';
  };

  // Get company type - use from URL params first, then fallback to data
  const companyType = type || companyData.company_type?.slug || companyData.company_type?.type_name || 'companies';
  
  // Get translations with dynamic details label
  const getDetailsLabel = () => {
    const labels: any = {
      az: {
        banks: 'Bank rekvizitləri',
        insurance: 'Rekvizitlər',
        'credit-organizations': 'Rekvizitlər',
        investment: 'Rekvizitlər',
        leasing: 'Rekvizitlər',
        'payment-systems': 'Rekvizitlər',
        default: 'Rekvizitlər'
      },
      en: {
        banks: 'Bank Details',
        insurance: 'Details',
        'credit-organizations': 'Details',
        investment: 'Details',
        leasing: 'Details',
        'payment-systems': 'Details',
        default: 'Details'
      },
      ru: {
        banks: 'Банковские реквизиты',
        insurance: 'Реквизиты',
        'credit-organizations': 'Реквизиты',
        investment: 'Реквизиты',
        leasing: 'Реквизиты',
        'payment-systems': 'Реквизиты',
        default: 'Реквизиты'
      }
    };
    return labels[lang]?.[companyType] || labels[lang]?.default || 'Details';
  };

  // Get translations
  const t = {
    az: {
      about: 'Haqqında',
      contact: 'Əlaqə məlumatları',
      details: getDetailsLabel(),
      branches: 'Filiallar',
      deposits: 'Əmanətlər',
      cards: 'Kredit kartları',
      loans: 'Kreditlər',
      workingHours: 'İş saatları',
      address: 'Ünvan',
      phone: 'Telefon',
      email: 'E-poçt',
      website: 'Veb sayt',
      swift: 'SWIFT kodu',
      bankCode: 'Bank kodu',
      voen: 'VÖEN',
      correspondent: 'Müxbir hesab',
      reuters: 'Reuters Dealing',
      established: 'Təsis tarixi',
      headquarters: 'Baş ofis',
      totalAssets: 'Cəmi aktivlər',
      employees: 'İşçi sayı',
      branchCount: 'Filial sayı',
      atmCount: 'ATM sayı',
      viewWebsite: 'Sayta keç',
      weekdays: 'Həftə içi',
      saturday: 'Şənbə',
      sunday: 'Bazar',
      closed: 'Bağlı',
      openNow: '24/7',
      interestRate: 'İllik faiz',
      minAmount: 'Min. məbləğ',
      term: 'Müddət',
      currency: 'Valyuta',
      features: 'Xüsusiyyətlər',
      creditLimit: 'Kredit limiti',
      gracePeriod: 'Güzəşt müddəti',
      cashback: 'Cashback',
      maxAmount: 'Maks. məbləğ',
      monthlyPayment: 'Aylıq ödəniş',
      noData: 'Məlumat yoxdur',
      creditProducts: 'Kredit məhsulları',
      insuranceProducts: 'Sığorta məhsulları'
    },
    en: {
      about: 'About',
      contact: 'Contact Information',
      details: 'Bank Details',
      branches: 'Branches',
      deposits: 'Deposits',
      cards: 'Credit Cards',
      loans: 'Loans',
      workingHours: 'Working Hours',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      website: 'Website',
      swift: 'SWIFT Code',
      bankCode: 'Bank Code',
      voen: 'TIN',
      correspondent: 'Correspondent Account',
      reuters: 'Reuters Dealing',
      established: 'Established',
      headquarters: 'Headquarters',
      totalAssets: 'Total Assets',
      employees: 'Employees',
      branchCount: 'Branches',
      atmCount: 'ATMs',
      viewWebsite: 'Visit Website',
      weekdays: 'Weekdays',
      saturday: 'Saturday',
      sunday: 'Sunday',
      closed: 'Closed',
      openNow: '24/7',
      interestRate: 'Interest Rate',
      minAmount: 'Min. Amount',
      term: 'Term',
      currency: 'Currency',
      features: 'Features',
      creditLimit: 'Credit Limit',
      gracePeriod: 'Grace Period',
      cashback: 'Cashback',
      maxAmount: 'Max. Amount',
      monthlyPayment: 'Monthly Payment',
      noData: 'No data available',
      creditProducts: 'Credit Products',
      insuranceProducts: 'Insurance Products'
    },
    ru: {
      about: 'О компании',
      contact: 'Контактная информация',
      details: 'Банковские реквизиты',
      branches: 'Филиалы',
      deposits: 'Депозиты',
      cards: 'Кредитные карты',
      loans: 'Кредиты',
      workingHours: 'Часы работы',
      address: 'Адрес',
      phone: 'Телефон',
      email: 'Эл. почта',
      website: 'Веб-сайт',
      swift: 'SWIFT код',
      bankCode: 'Код банка',
      voen: 'ИНН',
      correspondent: 'Корр. счет',
      reuters: 'Reuters Dealing',
      established: 'Дата основания',
      headquarters: 'Головной офис',
      totalAssets: 'Активы',
      employees: 'Сотрудники',
      branchCount: 'Филиалы',
      atmCount: 'Банкоматы',
      viewWebsite: 'Перейти на сайт',
      weekdays: 'Будни',
      saturday: 'Суббота',
      sunday: 'Воскресенье',
      closed: 'Закрыто',
      openNow: '24/7',
      interestRate: 'Процентная ставка',
      minAmount: 'Мин. сумма',
      term: 'Срок',
      currency: 'Валюта',
      features: 'Особенности',
      creditLimit: 'Кредитный лимит',
      gracePeriod: 'Льготный период',
      cashback: 'Кэшбэк',
      maxAmount: 'Макс. сумма',
      monthlyPayment: 'Ежемесячный платеж',
      noData: 'Нет данных',
      creditProducts: 'Кредитные продукты',
      insuranceProducts: 'Страховые продукты'
    }
  }[lang] || t.az;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('az-AZ', {
      style: 'currency',
      currency: 'AZN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + ' mlrd';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + ' mln';
    }
    return num.toLocaleString();
  };

  const parseWorkingHours = (hours: any) => {
    if (!hours) return null;
    if (typeof hours === 'string') {
      try {
        return JSON.parse(hours);
      } catch {
        return hours;
      }
    }
    return hours;
  };

  const getName = (field: any) => {
    if (typeof field === 'object' && field !== null) {
      return field[lang] || field['az'] || '';
    }
    return field || '';
  };

  // Get breadcrumb labels
  const getBreadcrumbLabel = () => {
    const labels: any = {
      az: {
        home: 'Ana səhifə',
        companies: 'Şirkətlər',
        banks: 'Banklar',
        insurance: 'Sığorta şirkətləri',
        'credit-organizations': 'Kredit təşkilatları',
        investment: 'İnvestisiya şirkətləri',
        leasing: 'Lizinq şirkətləri',
        'payment-systems': 'Ödəniş sistemləri'
      },
      en: {
        home: 'Home',
        companies: 'Companies',
        banks: 'Banks',
        insurance: 'Insurance Companies',
        'credit-organizations': 'Credit Organizations',
        investment: 'Investment Companies',
        leasing: 'Leasing Companies',
        'payment-systems': 'Payment Systems'
      },
      ru: {
        home: 'Главная',
        companies: 'Компании',
        banks: 'Банки',
        insurance: 'Страховые компании',
        'credit-organizations': 'Кредитные организации',
        investment: 'Инвестиционные компании',
        leasing: 'Лизинговые компании',
        'payment-systems': 'Платежные системы'
      }
    };
    return labels[lang] || labels.az;
  };

  const breadcrumbLabels = getBreadcrumbLabel();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900" suppressHydrationWarning>
      {/* Header with breadcrumbs and company info */}
      <div className="bg-[#F6F6F6] dark:bg-gray-800 py-8">
        <div className="flex justify-center items-center px-4 md:px-36">
          <div className="w-full max-w-5xl">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 mb-6 text-sm">
              <Link href={"/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                {breadcrumbLabels.home}
              </Link>
              <span className="text-gray-400">›</span>
              <Link href={`/sirketler`} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                {breadcrumbLabels.companies}
              </Link>
              <span className="text-gray-400">›</span>
              <Link href={`/sirketler/${companyType}`} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                {breadcrumbLabels[companyType] || companyType}
              </Link>
              <span className="text-gray-400">›</span>
              <span className="text-[#FF6021] font-medium">
                {getCompanyName()}
              </span>
            </div>

            {/* Company Header Info */}
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* Logo */}
              {companyData.logo && (
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-white dark:bg-gray-700 rounded-lg shadow-md flex items-center justify-center p-4">
                    <img
                      src={companyData.logo}
                      alt={getCompanyName()}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
              
              {/* Company Info */}
              <div className="flex-1">
                <h1 className="text-[#09121F] dark:text-white text-3xl md:text-4xl font-bold mb-2">
                  {getCompanyName()}
                </h1>
              
              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {companyData.total_assets && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                      <TrendingUp className="w-4 h-4" />
                      {t.totalAssets}
                    </div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                      {formatLargeNumber(companyData.total_assets)} ₼
                    </div>
                  </div>
                )}
                
                {companyData.branches_count && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                      <Building2 className="w-4 h-4" />
                      {t.branchCount}
                    </div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                      {companyData.branches_count}
                    </div>
                  </div>
                )}
                
                {companyData.atm_count && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                      <CreditCard className="w-4 h-4" />
                      {t.atmCount}
                    </div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                      {companyData.atm_count}
                    </div>
                  </div>
                )}
                
                {companyData.employees_count && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                      <Users className="w-4 h-4" />
                      {t.employees}
                    </div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                      {formatLargeNumber(companyData.employees_count)}
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col justify-center items-center gap-8 py-12 px-4 md:px-36">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - About & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            {companyData.about && (
              <div className="bg-[#F6F6F6] dark:bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  {t.about}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {companyData.about}
                </p>
              </div>
            )}

            {/* Company Details */}
            <div className="bg-[#F6F6F6] dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t.details}
              </h2>
              <div className="space-y-3">
                {/* Bank-specific fields */}
                {companyType === 'banks' && (
                  <>
                    {companyData.swift_code && (
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">{t.swift}:</span>
                        <span className="font-mono font-semibold text-gray-900 dark:text-white">
                          {companyData.swift_code}
                        </span>
                      </div>
                    )}
                    {companyData.bank_code && (
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">{t.bankCode}:</span>
                        <span className="font-mono font-semibold text-gray-900 dark:text-white">
                          {companyData.bank_code}
                        </span>
                      </div>
                    )}
                    {companyData.correspondent_account && (
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">{t.correspondent}:</span>
                        <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                          {companyData.correspondent_account}
                        </span>
                      </div>
                    )}
                    {companyData.reuters_dealing && (
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">{t.reuters}:</span>
                        <span className="font-mono font-semibold text-gray-900 dark:text-white">
                          {companyData.reuters_dealing}
                        </span>
                      </div>
                    )}
                  </>
                )}
                
                {/* Insurance-specific fields */}
                {companyType === 'insurance' && (
                  <>
                    {companyData.license_number && (
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Lisenziya №:</span>
                        <span className="font-mono font-semibold text-gray-900 dark:text-white">
                          {companyData.license_number}
                        </span>
                      </div>
                    )}
                    {companyData.regulator_number && (
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Tənzimləyici №:</span>
                        <span className="font-mono font-semibold text-gray-900 dark:text-white">
                          {companyData.regulator_number}
                        </span>
                      </div>
                    )}
                    {companyData.claim_process_time && (
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">İddia müddəti:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {companyData.claim_process_time} gün
                        </span>
                      </div>
                    )}
                  </>
                )}
                
                {/* Credit Organization-specific fields */}
                {companyType === 'credit-organizations' && (
                  <>
                    {companyData.license_number && (
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Lisenziya №:</span>
                        <span className="font-mono font-semibold text-gray-900 dark:text-white">
                          {companyData.license_number}
                        </span>
                      </div>
                    )}
                    {companyData.max_loan_amount && (
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Maks. kredit:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(companyData.max_loan_amount)}
                        </span>
                      </div>
                    )}
                    {companyData.approval_time && (
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Təsdiq müddəti:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {companyData.approval_time} gün
                        </span>
                      </div>
                    )}
                  </>
                )}
                
                {/* Investment Company-specific fields */}
                {companyType === 'investment' && (
                  <>
                    {companyData.license_number && (
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Lisenziya №:</span>
                        <span className="font-mono font-semibold text-gray-900 dark:text-white">
                          {companyData.license_number}
                        </span>
                      </div>
                    )}
                    {companyData.aum && (
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">İdarə olunan aktivlər:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatLargeNumber(companyData.aum)} ₼
                        </span>
                      </div>
                    )}
                    {companyData.investment_types && (
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">İnvestisiya növləri:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {Array.isArray(companyData.investment_types) ? companyData.investment_types.join(', ') : companyData.investment_types}
                        </span>
                      </div>
                    )}
                  </>
                )}
                
                {/* Leasing Company-specific fields */}
                {companyType === 'leasing' && (
                  <>
                    {companyData.license_number && (
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Lisenziya №:</span>
                        <span className="font-mono font-semibold text-gray-900 dark:text-white">
                          {companyData.license_number}
                        </span>
                      </div>
                    )}
                    {companyData.min_down_payment && (
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Min. ilkin ödəniş:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {companyData.min_down_payment}%
                        </span>
                      </div>
                    )}
                    {companyData.max_term_months && (
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Maks. müddət:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {companyData.max_term_months} ay
                        </span>
                      </div>
                    )}
                  </>
                )}
                
                {/* Common fields for all company types */}
                {companyData.voen && (
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">{t.voen}:</span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-white">
                      {companyData.voen}
                    </span>
                  </div>
                )}
                {companyData.license_date && (
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Lisenziya tarixi:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {companyData.license_date.split('T')[0]}
                    </span>
                  </div>
                )}
                {companyData.founding_date && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600 dark:text-gray-400">{t.established}:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {companyData.founding_date.split('-')[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Products moved outside to full width */}

            {/* Loans moved to full width section */}

            {/* Branches */}
            {companyData.entities.branch && companyData.entities.branch.length > 0 && (
              <div className="bg-[#F6F6F6] dark:bg-gray-800 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('branches')}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        {t.branches} ({companyData.entities.branch.length})
                      </h2>
                      {expandedSections.branches ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    {expandedSections.branches && (
                      <div className="p-6 pt-0 grid gap-4">
                        {companyData.entities.branch.map((branch: any, index: number) => (
                          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                                  {getName(branch.name || branch.entity_name)}
                                </h3>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                                    <span className="text-gray-600 dark:text-gray-300">
                                      {getName(branch.address)}
                                    </span>
                                  </div>
                                  {branch.phone && (
                                    <div className="flex items-center gap-2">
                                      <Phone className="w-4 h-4 text-gray-500" />
                                      <span className="text-gray-600 dark:text-gray-300">
                                        {branch.phone}
                                      </span>
                                    </div>
                                  )}
                                  {branch.working_hours && (
                                    <div className="flex items-start gap-2">
                                      <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
                                      <div className="text-gray-600 dark:text-gray-300">
                                        {branch.is_24_7 ? (
                                          <span className="font-semibold text-green-600">{t.openNow}</span>
                                        ) : (
                                          <div>
                                            {parseWorkingHours(branch.working_hours) && (
                                              <div className="space-y-1">
                                                <div>{t.weekdays}: {parseWorkingHours(branch.working_hours).weekdays}</div>
                                                <div>{t.saturday}: {parseWorkingHours(branch.working_hours).saturday}</div>
                                                <div>{t.sunday}: {parseWorkingHours(branch.working_hours).sunday === 'closed' ? t.closed : parseWorkingHours(branch.working_hours).sunday}</div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
            )}

            {/* Products moved outside to full width */}
          </div>

          {/* Right Column - Contact Info */}
          <div className="lg:col-span-1">
            <div className="bg-[#F6F6F6] dark:bg-gray-800 rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.contact}
              </h2>
              <div className="space-y-4">
                {companyData.phones && companyData.phones.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{t.phone}</span>
                    </div>
                    {companyData.phones.map((phone: string, index: number) => (
                      <a
                        key={index}
                        href={`tel:${phone}`}
                        className="block text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-semibold"
                      >
                        {phone}
                      </a>
                    ))}
                  </div>
                )}

                {companyData.email && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{t.email}</span>
                    </div>
                    <a
                      href={`mailto:${companyData.email}`}
                      className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {companyData.email}
                    </a>
                  </div>
                )}

                {(companyData.website || companyData.site) && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                      <Globe className="w-4 h-4" />
                      <span className="text-sm">{t.website}</span>
                    </div>
                    <a
                      href={companyData.website || companyData.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {(companyData.website || companyData.site)?.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}

                {companyData.headquarters && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{t.headquarters}</span>
                    </div>
                    <p className="text-gray-900 dark:text-white">
                      {companyData.headquarters}
                    </p>
                  </div>
                )}

                {companyData.founding_date && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{t.established}</span>
                    </div>
                    <p className="text-gray-900 dark:text-white">
                      {companyData.founding_date.split('-')[0]}
                    </p>
                  </div>
                )}

                {(companyData.website || companyData.site) && (
                  <a
                    href={companyData.website || companyData.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                    {t.viewWebsite}
                  </a>
                )}
              </div>
            </div>
          </div>
          </div> {/* Close grid */}
        </div> {/* Close max-w-5xl */}
      </div> {/* Close flex container */}

      {/* Products Section - Full Width Like Related News */}
      {companyData.entities && (
        <>
          {/* Insurance Products (for insurance companies) */}
          {companyData.entities.insurance_product && companyData.entities.insurance_product.length > 0 && (
            <div className="flex justify-center px-4 sm:px-8 lg:px-36 mb-8">
              <div className="w-full max-w-5xl">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                    <Shield className="w-5 h-5 text-brand-orange" />
                    {t.insuranceProducts} ({companyData.entities.insurance_product.length})
                  </h2>
                  <CompanyProductCards 
                    products={companyData.entities.insurance_product}
                    locale={lang}
                    productType="insurance_product"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Credit Loans (for credit organizations) */}
          {companyData.entities.credit_loan && companyData.entities.credit_loan.length > 0 && (
            <div className="flex justify-center px-4 sm:px-8 lg:px-36 mb-8">
              <div className="w-full max-w-5xl">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                    <DollarSign className="w-5 h-5 text-brand-orange" />
                    {t.creditProducts} ({companyData.entities.credit_loan.length})
                  </h2>
                  <CompanyProductCards 
                    products={companyData.entities.credit_loan}
                    locale={lang}
                    productType="credit_loan"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Deposits */}
          {companyData.entities.deposit && companyData.entities.deposit.length > 0 && (
            <div className="flex justify-center px-4 sm:px-8 lg:px-36 mb-8">
              <div className="w-full max-w-5xl">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                    <Wallet className="w-5 h-5 text-brand-orange" />
                    {t.deposits} ({companyData.entities.deposit.length})
                  </h2>
                  <CompanyProductCards 
                    products={companyData.entities.deposit}
                    locale={lang}
                    productType="deposit"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Credit Cards */}
          {companyData.entities.credit_card && companyData.entities.credit_card.length > 0 && (
            <div className="flex justify-center px-4 sm:px-8 lg:px-36 mb-8">
              <div className="w-full max-w-5xl">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                    <CreditCard className="w-5 h-5 text-brand-orange" />
                    {t.cards} ({companyData.entities.credit_card.length})
                  </h2>
                  <CompanyProductCards 
                    products={companyData.entities.credit_card}
                    locale={lang}
                    productType="credit_card"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Loans */}
          {companyData.entities.loan && companyData.entities.loan.length > 0 && (
            <div className="flex justify-center px-4 sm:px-8 lg:px-36 mb-8">
              <div className="w-full max-w-5xl">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                    <Banknote className="w-5 h-5 text-brand-orange" />
                    {t.loans} ({companyData.entities.loan.length})
                  </h2>
                  <CompanyProductCards 
                    products={companyData.entities.loan}
                    locale={lang}
                    productType="loan"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}