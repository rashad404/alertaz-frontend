'use client';

import React, { useState } from 'react';
import { Link } from '@/lib/navigation';
import { ChevronRight, Calculator, FileText, Phone, MapPin, Clock, Check, ArrowLeft, Building2, CreditCard } from 'lucide-react';
import { getTranslation, getImageUrl, formatCurrency, calculateMonthlyPayment } from '@/lib/utils';
import type { Offer } from '@/lib/types';

interface OfferDetailClientProps {
  params: { lang: string; id: string };
  offerData: any; // Using any since this is credit data, not offer data
}

const OfferDetailClient = ({ params, offerData }: OfferDetailClientProps) => {
  const locale = params.lang || 'az';
  const [calculatorAmount, setCalculatorAmount] = useState(
    parseFloat(offerData.min_amount || offerData.amount_min || '1000')
  );
  const [calculatorTerm, setCalculatorTerm] = useState(
    parseInt(offerData.min_duration || offerData.term_min || '12')
  );
  const [imageError, setImageError] = useState(false);

  // Translations
  const translations = {
    az: {
      breadcrumbHome: 'Ana səhifə',
      breadcrumbOffers: 'Kredit təklifləri',
      offerType: 'Kredit növü',
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
      similarOffers: 'Oxşar təkliflər',
      back: 'Geri'
    },
    en: {
      breadcrumbHome: 'Home',
      breadcrumbOffers: 'Credit offers',
      offerType: 'Credit type',
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
      similarOffers: 'Similar offers',
      back: 'Back'
    },
    ru: {
      breadcrumbHome: 'Главная',
      breadcrumbOffers: 'Кредитные предложения',
      offerType: 'Тип кредита',
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
      workingHours: 'Часы работы',
      address: 'Адрес',
      phone: 'Телефон',
      month: 'месяцев',
      azn: 'AZN',
      description: 'Описание',
      conditions: 'Условия',
      similarOffers: 'Похожие предложения',
      back: 'Назад'
    }
  };

  const t = translations[locale as keyof typeof translations] || translations.az;

  // Calculate monthly payment with current calculator values
  const monthlyPayment = calculateMonthlyPayment(
    calculatorAmount,
    parseFloat(offerData.min_interest_rate || offerData.annual_rate_min || '10'),
    calculatorTerm
  );

  const offerTitle = getTranslation(offerData.title, locale);
  const companyName = offerData.company ? getTranslation(offerData.company.name, locale) : '';
  
  const minAmount = parseFloat(offerData.min_amount || offerData.amount_min || '1000');
  const maxAmount = parseFloat(offerData.max_amount || offerData.amount_max || '50000');
  const minTerm = parseInt(offerData.min_duration || offerData.term_min || '6');
  const maxTerm = typeof offerData.max_duration === 'number' 
    ? offerData.max_duration 
    : parseInt(
        offerData.max_duration?.toString().replace(' ay', '') || 
        (typeof offerData.duration?.title === 'string' 
          ? offerData.duration.title.replace(' ay', '') 
          : offerData.duration?.title ? getTranslation(offerData.duration.title, locale).replace(' ay', '') : '') || 
        offerData.term_max || 
        '60'
      );
  const interestRate = parseFloat(offerData.min_interest_rate || offerData.annual_rate_min || offerData.annual_interest_rate || '10');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex w-full justify-center px-4 sm:px-8 lg:px-36 py-8">
        <div className="w-full max-w-5xl">
        {/* Back button */}
        <Link
          href={'/credits'}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.back}
        </Link>

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <Link href={'/'} className="hover:text-[#FF6021] transition-colors">
            {t.breadcrumbHome}
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link href={'/offers'} className="hover:text-[#FF6021] transition-colors">
            {t.breadcrumbOffers}
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-[#FF6021] font-medium">{offerTitle}</span>
        </nav>
        </div>
      </div>

      {/* Hero Section */}
      <header className="flex w-full justify-center px-4 sm:px-8 lg:px-36 py-8 bg-gradient-to-r from-[#FF6021]/10 to-[#E54500]/10 dark:from-[#FF6021]/5 dark:to-[#E54500]/5">
        <div className="flex w-full max-w-5xl flex-col gap-6">
          <div className="flex items-start gap-6 flex-col sm:flex-row">
            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-700 flex items-center justify-center shadow-lg border border-[#E6E6E6] dark:border-gray-600">
              {offerData.company?.logo ? (
                <img
                  src={imageError ? "/news-placeholder.svg" : getImageUrl(offerData.company.logo)}
                  alt={companyName}
                  className="w-16 h-16 object-contain"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Building2 className="w-12 h-12 text-[#FF6021]" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-[#FF6021]" />
                <span className="text-[#FF6021] font-medium text-sm">
                  {offerData.category ? getTranslation(offerData.category.title, locale) : t.offerType}
                </span>
              </div>
              <h1 className="text-[#09121F] dark:text-white text-3xl sm:text-4xl font-bold mb-3">
                {offerTitle}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <Link 
                  href={`/sirketler/banklar/${offerData.company?.slug || ''}`}
                  className="text-gray-600 dark:text-gray-400 text-lg hover:text-[#FF6021] transition-colors underline"
                >
                  {companyName}
                </Link>
              </div>
              
              {/* Key metrics */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">{t.interestRate}:</span>
                  <span className="text-[#09121F] dark:text-white font-bold">
                    {interestRate}%
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">{t.amount}:</span>
                  <span className="text-[#09121F] dark:text-white font-bold">
                    {formatCurrency(minAmount)} - {formatCurrency(maxAmount)}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">{t.term}:</span>
                  <span className="text-[#09121F] dark:text-white font-bold">
                    {maxTerm} {t.month}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Quick Apply Button */}
            <div className="flex flex-col gap-2">
              <button 
                className="px-6 py-3 rounded-xl bg-gray-400 dark:bg-gray-600 text-white font-bold cursor-not-allowed opacity-75"
                disabled
                title={locale === 'az' ? 'Tezliklə' : locale === 'ru' ? 'Скоро' : 'Coming soon'}
              >
                {t.applyNow} 🚀
                <span className="text-xs block mt-1">
                  {locale === 'az' ? 'Tezliklə' : locale === 'ru' ? 'Скоро' : 'Coming soon'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex w-full justify-center px-4 sm:px-8 lg:px-36 py-8">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Main info */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                {/* Key metrics section removed from here since it's now in the hero */}

                {/* Conditions */}
                <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t.conditions}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">{t.minAmount}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(minAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">{t.maxAmount}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(maxAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">{t.minTerm}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {minTerm} {t.month}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">{t.maxTerm}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {maxTerm} {t.month}
                    </span>
                  </div>
                </div>
              </div>

              {/* Advantages */}
              {((offerData.advantages && offerData.advantages.length > 0) || 
                (offerData.offer_advantages && offerData.offer_advantages.length > 0)) && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {t.advantages}
                  </h2>
                  <div className="space-y-3">
                    {(offerData.advantages || offerData.offer_advantages || []).map((advantage: any, index: number) => (
                      <div key={advantage.id || index} className="flex items-start space-x-3">
                        <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {typeof advantage === 'object' && advantage.title 
                            ? getTranslation(advantage.title, locale) 
                            : advantage}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {offerData.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {t.description}
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300">
                      {getTranslation(offerData.description, locale)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column - Calculator and CTA */}
          <div className="lg:col-span-1">
            {/* Calculator */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                {t.calculator}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {t.amount}
                  </label>
                  <input
                    type="range"
                    min={minAmount}
                    max={maxAmount}
                    step="100"
                    value={calculatorAmount}
                    onChange={(e) => setCalculatorAmount(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatCurrency(minAmount)}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(calculatorAmount)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatCurrency(maxAmount)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {t.term}
                  </label>
                  <input
                    type="range"
                    min={minTerm}
                    max={maxTerm}
                    step="1"
                    value={calculatorTerm}
                    onChange={(e) => setCalculatorTerm(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      {minTerm} {t.month}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {calculatorTerm} {t.month}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {maxTerm} {t.month}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t.monthlyPayment}:
                    </span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(parseFloat(monthlyPayment))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <button
                className="w-full bg-gray-400 dark:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium cursor-not-allowed opacity-75 mb-4"
                disabled
                title={locale === 'az' ? 'Tezliklə' : locale === 'ru' ? 'Скоро' : 'Coming soon'}
              >
                {t.applyNow} 🚀
                <span className="text-xs block mt-1">
                  {locale === 'az' ? 'Tezliklə' : locale === 'ru' ? 'Скоро' : 'Coming soon'}
                </span>
              </button>
              
              {offerData.company && (
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    {t.contactBank}
                  </h4>
                  
                  {offerData.company.phones && offerData.company.phones.length > 0 && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {offerData.company.phones[0]}
                      </span>
                    </div>
                  )}
                  
                  {offerData.company.addresses && (
                    <div className="flex items-start space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {Array.isArray(offerData.company.addresses) && offerData.company.addresses.length > 0
                          ? (typeof offerData.company.addresses[0] === 'object' 
                              ? offerData.company.addresses[0].address 
                              : offerData.company.addresses[0])
                          : (typeof offerData.company.addresses === 'object' && offerData.company.addresses.address
                              ? offerData.company.addresses.address
                              : '')}
                      </span>
                    </div>
                  )}
                  
                  {offerData.company.business_hours && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {typeof offerData.company.business_hours === 'object' && offerData.company.business_hours.monday
                          ? `${t.workingHours}: ${offerData.company.business_hours.monday}`
                          : ''}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetailClient;