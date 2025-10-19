'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { ChevronRight, Calculator, FileText, Phone, MapPin, Clock, Check } from 'lucide-react';

interface CreditDetailClientProps {
  params: { lang: string; slug: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  creditData: any;
}

const CreditDetailClient = ({ params, creditData }: CreditDetailClientProps) => {
  const locale = params.lang || 'az';
  const [calculatorAmount, setCalculatorAmount] = useState(creditData.min_amount || 1000);
  const [calculatorTerm, setCalculatorTerm] = useState(creditData.min_term_months || 12);

  // Calculate monthly payment
  const calculateMonthlyPayment = () => {
    const principal = calculatorAmount;
    const monthlyRate = creditData.interest_rate / 100 / 12;
    const numPayments = calculatorTerm;
    
    if (monthlyRate === 0) {
      return (principal / numPayments).toFixed(2);
    }
    
    const monthlyPayment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return monthlyPayment.toFixed(2);
  };

  // Translations
  const translations = {
    az: {
      breadcrumbHome: 'Ana səhifə',
      breadcrumbCredits: 'Kreditlər',
      creditType: 'Kredit növü',
      amount: 'Məbləğ',
      interestRate: 'İllik faiz',
      term: 'Müddət',
      monthlyPayment: 'Aylıq ödəniş',
      minAmount: 'Minimum məbləğ',
      maxAmount: 'Maksimum məbləğ',
      minTerm: 'Minimum müddət',
      maxTerm: 'Maksimum müddət',
      requirements: 'Tələblər',
      documents: 'Lazımi sənədlər',
      advantages: 'Üstünlüklər',
      calculator: 'Kredit kalkulyatoru',
      calculate: 'Hesabla',
      applyNow: 'İndi müraciət et',
      contactBank: 'Bank ilə əlaqə',
      workingHours: 'İş saatları',
      address: 'Ünvan',
      phone: 'Telefon',
      month: 'ay',
      azn: 'AZN',
      description: 'Təsvir',
      conditions: 'Şərtlər',
      similarCredits: 'Oxşar kreditlər'
    },
    en: {
      breadcrumbHome: 'Home',
      breadcrumbCredits: 'Credits',
      creditType: 'Credit type',
      amount: 'Amount',
      interestRate: 'Annual rate',
      term: 'Term',
      monthlyPayment: 'Monthly payment',
      minAmount: 'Minimum amount',
      maxAmount: 'Maximum amount',
      minTerm: 'Minimum term',
      maxTerm: 'Maximum term',
      requirements: 'Requirements',
      documents: 'Required documents',
      advantages: 'Advantages',
      calculator: 'Credit calculator',
      calculate: 'Calculate',
      applyNow: 'Apply now',
      contactBank: 'Contact bank',
      workingHours: 'Working hours',
      address: 'Address',
      phone: 'Phone',
      month: 'months',
      azn: 'AZN',
      description: 'Description',
      conditions: 'Conditions',
      similarCredits: 'Similar credits'
    },
    ru: {
      breadcrumbHome: 'Главная',
      breadcrumbCredits: 'Кредиты',
      creditType: 'Тип кредита',
      amount: 'Сумма',
      interestRate: 'Годовая ставка',
      term: 'Срок',
      monthlyPayment: 'Ежемесячный платеж',
      minAmount: 'Минимальная сумма',
      maxAmount: 'Максимальная сумма',
      minTerm: 'Минимальный срок',
      maxTerm: 'Максимальный срок',
      requirements: 'Требования',
      documents: 'Необходимые документы',
      advantages: 'Преимущества',
      calculator: 'Кредитный калькулятор',
      calculate: 'Рассчитать',
      applyNow: 'Подать заявку',
      contactBank: 'Связаться с банком',
      workingHours: 'Рабочие часы',
      address: 'Адрес',
      phone: 'Телефон',
      month: 'месяцев',
      azn: 'AZN',
      description: 'Описание',
      conditions: 'Условия',
      similarCredits: 'Похожие кредиты'
    }
  };

  const t = translations[locale as keyof typeof translations] || translations.az;

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: creditData.credit_name,
    description: creditData.description || `${creditData.credit_name} - ${creditData.bank_name}`,
    provider: {
      '@type': 'BankOrCreditUnion',
      name: creditData.bank_name,
      telephone: creditData.bank_phone,
      address: creditData.bank_address
    },
    interestRate: creditData.interest_rate,
    annualPercentageRate: creditData.interest_rate,
    feesAndCommissionsSpecification: creditData.commission_rate ? `${creditData.commission_rate}%` : '0%',
    url: `https://kredit.az/${locale}/credits/${creditData.slug}`
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: t.breadcrumbHome,
        item: `https://kredit.az/${locale}`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t.breadcrumbCredits,
        item: `https://kredit.az/${locale}/credits`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: creditData.credit_name,
        item: `https://kredit.az/${locale}/credits/${creditData.slug}`
      }
    ]
  };

  return (
    <>
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      <Script id="breadcrumb-schema" type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </Script>

      <main className="min-h-screen bg-white dark:bg-gray-900">
        {/* Breadcrumb */}
        <nav className="flex w-full justify-center px-4 sm:px-8 lg:px-36 py-4" aria-label="Breadcrumb">
          <div className="flex w-full max-w-5xl items-center gap-2 text-sm">
            <Link href={`/${locale}`} className="text-gray-600 dark:text-gray-400 hover:text-[#FF6021] transition-colors">
              {t.breadcrumbHome}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href={`/${locale}/credits`} className="text-gray-600 dark:text-gray-400 hover:text-[#FF6021] transition-colors">
              {t.breadcrumbCredits}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-[#FF6021] font-medium">{creditData.credit_name}</span>
          </div>
        </nav>

        {/* Header */}
        <header className="flex w-full justify-center px-4 sm:px-8 lg:px-36 py-8">
          <div className="flex w-full max-w-5xl flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-[#E6E6E6] dark:bg-gray-700 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#09121F] dark:text-gray-400">
                  {creditData.bank_name.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-[#09121F] dark:text-white text-3xl sm:text-4xl font-bold">
                  {creditData.credit_name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg mt-1">{creditData.bank_name}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <section className="flex w-full justify-center px-4 sm:px-8 lg:px-36 py-4">
          <div className="flex w-full max-w-5xl gap-8 flex-col lg:flex-row">
            {/* Left Column - Credit Details */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Key Information Card */}
              <div className="rounded-2xl border border-[#E6E6E6] dark:border-gray-700 bg-[#F6F6F6] dark:bg-gray-800 p-6">
                <h2 className="text-[#09121F] dark:text-white text-2xl font-bold mb-6">{t.conditions}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2 p-4 rounded-xl bg-white dark:bg-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{t.amount}</span>
                    <span className="text-[#09121F] dark:text-white text-xl font-bold">
                      {creditData.min_amount_formatted} - {creditData.max_amount_formatted}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 p-4 rounded-xl bg-white dark:bg-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{t.interestRate}</span>
                    <span className="text-[#09121F] dark:text-white text-xl font-bold">
                      {creditData.interest_rate_formatted}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 p-4 rounded-xl bg-white dark:bg-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{t.term}</span>
                    <span className="text-[#09121F] dark:text-white text-xl font-bold">
                      {creditData.min_term_months} - {creditData.max_term_months} {t.month}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 p-4 rounded-xl bg-white dark:bg-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{t.creditType}</span>
                    <span className="text-[#09121F] dark:text-white text-xl font-bold">
                      {creditData.credit_type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {creditData.description && (
                <div className="rounded-2xl border border-[#E6E6E6] dark:border-gray-700 bg-[#F6F6F6] dark:bg-gray-800 p-6">
                  <h2 className="text-[#09121F] dark:text-white text-2xl font-bold mb-4">{t.description}</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {creditData.description}
                  </p>
                </div>
              )}

              {/* Requirements */}
              <div className="rounded-2xl border border-[#E6E6E6] dark:border-gray-700 bg-[#F6F6F6] dark:bg-gray-800 p-6">
                <h2 className="text-[#09121F] dark:text-white text-2xl font-bold mb-4">{t.requirements}</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#FF6021] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Minimum yaş həddi: 18</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#FF6021] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Azərbaycan vətəndaşlığı</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#FF6021] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Stabil gəlir mənbəyi</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#FF6021] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Kredit tarixçəsi</span>
                  </li>
                </ul>
              </div>

              {/* Documents */}
              <div className="rounded-2xl border border-[#E6E6E6] dark:border-gray-700 bg-[#F6F6F6] dark:bg-gray-800 p-6">
                <h2 className="text-[#09121F] dark:text-white text-2xl font-bold mb-4">{t.documents}</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-[#FF6021] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Şəxsiyyət vəsiqəsi</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-[#FF6021] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">İş yerindən arayış</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-[#FF6021] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Maaş arayışı (son 6 ay)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-[#FF6021] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Zamin (tələb olunduqda)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column - Calculator & Contact */}
            <aside className="flex flex-col gap-6 w-full lg:w-[380px] lg:sticky lg:top-4 lg:self-start">
              {/* Calculator Card */}
              <div className="rounded-2xl border border-[#FF6021] bg-[#E9F2EE] dark:bg-gray-800 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Calculator className="w-6 h-6 text-[#FF6021]" />
                  <h3 className="text-[#09121F] dark:text-white text-xl font-bold">{t.calculator}</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[#09121F] dark:text-gray-300 text-sm font-medium block mb-2">
                      {t.amount} ({t.azn})
                    </label>
                    <input
                      type="number"
                      min={creditData.min_amount}
                      max={creditData.max_amount}
                      value={calculatorAmount}
                      onChange={(e) => setCalculatorAmount(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-[#E6E6E6] dark:border-gray-600 bg-white dark:bg-gray-700 text-[#09121F] dark:text-white"
                    />
                    <input
                      type="range"
                      min={creditData.min_amount}
                      max={creditData.max_amount}
                      value={calculatorAmount}
                      onChange={(e) => setCalculatorAmount(Number(e.target.value))}
                      className="w-full mt-2"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[#09121F] dark:text-gray-300 text-sm font-medium block mb-2">
                      {t.term} ({t.month})
                    </label>
                    <input
                      type="number"
                      min={creditData.min_term_months}
                      max={creditData.max_term_months}
                      value={calculatorTerm}
                      onChange={(e) => setCalculatorTerm(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-[#E6E6E6] dark:border-gray-600 bg-white dark:bg-gray-700 text-[#09121F] dark:text-white"
                    />
                    <input
                      type="range"
                      min={creditData.min_term_months}
                      max={creditData.max_term_months}
                      value={calculatorTerm}
                      onChange={(e) => setCalculatorTerm(Number(e.target.value))}
                      className="w-full mt-2"
                    />
                  </div>
                  
                  <div className="pt-4 border-t border-[#FF6021]/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">{t.monthlyPayment}:</span>
                      <span className="text-[#09121F] dark:text-white text-2xl font-bold">
                        {calculateMonthlyPayment()} {t.azn}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <button className="w-full py-4 px-6 rounded-xl bg-[#FF6021] hover:bg-[#E54500] text-white font-bold text-lg transition-colors">
                {t.applyNow}
              </button>

              {/* Contact Card */}
              <div className="rounded-2xl border border-[#E6E6E6] dark:border-gray-700 bg-[#F6F6F6] dark:bg-gray-800 p-6">
                <h3 className="text-[#09121F] dark:text-white text-xl font-bold mb-4">{t.contactBank}</h3>
                
                <div className="space-y-4">
                  {creditData.bank_phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-[#FF6021] mt-0.5" />
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{t.phone}</p>
                        <p className="text-[#09121F] dark:text-white font-medium">{creditData.bank_phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {creditData.bank_address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[#FF6021] mt-0.5" />
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{t.address}</p>
                        <p className="text-[#09121F] dark:text-white font-medium">{creditData.bank_address}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#FF6021] mt-0.5" />
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{t.workingHours}</p>
                      <p className="text-[#09121F] dark:text-white font-medium">09:00 - 18:00</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
};

export default CreditDetailClient;