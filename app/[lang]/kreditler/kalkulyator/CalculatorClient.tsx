'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, ChevronLeft, Download, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import axios from 'axios';

interface CalculatorClientProps {
  params: { lang: string };
}

interface PaymentScheduleItem {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

const CalculatorClient = ({ params }: CalculatorClientProps) => {
  const locale = params.lang || 'az';
  
  // Calculator state
  const [amount, setAmount] = useState(10000);
  const [interestRate, setInterestRate] = useState(12);
  const [termMonths, setTermMonths] = useState(24);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [schedule, setSchedule] = useState<PaymentScheduleItem[]>([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate payment
  const calculatePayment = async () => {
    setIsCalculating(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/${locale}/kreditler/calculate`, {
        amount,
        rate: interestRate,
        term: termMonths
      });
      
      const data = response.data.data;
      setMonthlyPayment(data.monthly_payment);
      setTotalPayment(data.total_payment);
      setTotalInterest(data.total_interest);
      setSchedule(data.schedule);
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Auto-calculate on value change
  useEffect(() => {
    const timer = setTimeout(() => {
      calculatePayment();
    }, 300);
    return () => clearTimeout(timer);
  }, [amount, interestRate, termMonths]);

  // Translations
  const translations = {
    az: {
      title: 'Kredit Kalkulyatoru',
      breadcrumbHome: 'Ana səhifə',
      breadcrumbCredits: 'Kreditlər',
      breadcrumbCalculator: 'Kalkulyator',
      amount: 'Kredit məbləği',
      interestRate: 'İllik faiz dərəcəsi',
      term: 'Kredit müddəti',
      monthlyPayment: 'Aylıq ödəniş',
      totalPayment: 'Ümumi ödəniş',
      totalInterest: 'Ümumi faiz',
      month: 'ay',
      year: 'il',
      azn: 'AZN',
      percent: '%',
      paymentSchedule: 'Ödəniş qrafiki',
      showSchedule: 'Qrafiki göstər',
      hideSchedule: 'Qrafiki gizlət',
      monthNumber: 'Ay',
      payment: 'Ödəniş',
      principal: 'Əsas borc',
      interest: 'Faiz',
      remainingBalance: 'Qalan borc',
      downloadSchedule: 'Qrafiki yüklə',
      creditInfo: 'Kredit məlumatı',
      description: 'Kredit kalkulyatoru ilə müxtəlif şərtlər üzrə aylıq ödənişlərinizi hesablayın',
      tips: 'Məsləhətlər',
      tip1: 'Faiz dərəcəsi nə qədər aşağı olarsa, ümumi ödəniş bir o qədər az olar',
      tip2: 'Müddət artdıqca aylıq ödəniş azalır, lakin ümumi faiz artır',
      tip3: 'İlkin ödəniş etmək ümumi faiz məbləğini azaldır',
      compareCredits: 'Kreditləri müqayisə et',
      viewCredits: 'Bütün kreditlər'
    },
    en: {
      title: 'Credit Calculator',
      breadcrumbHome: 'Home',
      breadcrumbCredits: 'Credits',
      breadcrumbCalculator: 'Calculator',
      amount: 'Loan amount',
      interestRate: 'Annual interest rate',
      term: 'Loan term',
      monthlyPayment: 'Monthly payment',
      totalPayment: 'Total payment',
      totalInterest: 'Total interest',
      month: 'months',
      year: 'years',
      azn: 'AZN',
      percent: '%',
      paymentSchedule: 'Payment schedule',
      showSchedule: 'Show schedule',
      hideSchedule: 'Hide schedule',
      monthNumber: 'Month',
      payment: 'Payment',
      principal: 'Principal',
      interest: 'Interest',
      remainingBalance: 'Remaining balance',
      downloadSchedule: 'Download schedule',
      creditInfo: 'Credit information',
      description: 'Calculate your monthly payments with different terms using the credit calculator',
      tips: 'Tips',
      tip1: 'The lower the interest rate, the less the total payment',
      tip2: 'Longer term reduces monthly payment but increases total interest',
      tip3: 'Making a down payment reduces the total interest amount',
      compareCredits: 'Compare credits',
      viewCredits: 'View all credits'
    },
    ru: {
      title: 'Кредитный калькулятор',
      breadcrumbHome: 'Главная',
      breadcrumbCredits: 'Кредиты',
      breadcrumbCalculator: 'Калькулятор',
      amount: 'Сумма кредита',
      interestRate: 'Годовая процентная ставка',
      term: 'Срок кредита',
      monthlyPayment: 'Ежемесячный платеж',
      totalPayment: 'Общая сумма платежей',
      totalInterest: 'Общая сумма процентов',
      month: 'месяцев',
      year: 'лет',
      azn: 'AZN',
      percent: '%',
      paymentSchedule: 'График платежей',
      showSchedule: 'Показать график',
      hideSchedule: 'Скрыть график',
      monthNumber: 'Месяц',
      payment: 'Платеж',
      principal: 'Основной долг',
      interest: 'Проценты',
      remainingBalance: 'Остаток долга',
      downloadSchedule: 'Скачать график',
      creditInfo: 'Информация о кредите',
      description: 'Рассчитайте ежемесячные платежи с различными условиями с помощью кредитного калькулятора',
      tips: 'Советы',
      tip1: 'Чем ниже процентная ставка, тем меньше общая сумма платежей',
      tip2: 'Более длительный срок уменьшает ежемесячный платеж, но увеличивает общую сумму процентов',
      tip3: 'Первоначальный взнос уменьшает общую сумму процентов',
      compareCredits: 'Сравнить кредиты',
      viewCredits: 'Все кредиты'
    }
  };

  const t = translations[locale as keyof typeof translations] || translations.az;

  // Structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t.title,
    description: t.description,
    url: `https://kredit.az/${locale}/credits/calculator`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'AZN'
    }
  };

  return (
    <>
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>

      <main className="min-h-screen bg-white dark:bg-gray-900">
        {/* Breadcrumb */}
        <nav className="flex w-full justify-center px-4 sm:px-8 lg:px-36 py-4" aria-label="Breadcrumb">
          <div className="flex w-full max-w-5xl items-center gap-2 text-sm">
            <Link href={`/${locale}`} className="text-gray-600 dark:text-gray-400 hover:text-[#FF6021] transition-colors">
              {t.breadcrumbHome}
            </Link>
            <span className="text-gray-400">&gt;</span>
            <Link href={`/${locale}/credits`} className="text-gray-600 dark:text-gray-400 hover:text-[#FF6021] transition-colors">
              {t.breadcrumbCredits}
            </Link>
            <span className="text-gray-400">&gt;</span>
            <span className="text-[#FF6021] font-medium">{t.breadcrumbCalculator}</span>
          </div>
        </nav>

        {/* Header */}
        <header className="flex w-full justify-center px-4 sm:px-8 lg:px-36 py-8">
          <div className="flex w-full max-w-5xl flex-col gap-4">
            <div className="flex items-center gap-3">
              <Calculator className="w-10 h-10 text-[#FF6021]" />
              <h1 className="text-[#09121F] dark:text-white text-3xl sm:text-4xl font-bold">
                {t.title}
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">{t.description}</p>
          </div>
        </header>

        {/* Calculator Section */}
        <section className="flex w-full justify-center px-4 sm:px-8 lg:px-36 py-4">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Calculator Inputs */}
            <div className="lg:col-span-2">
              <div className="bg-[#F6F6F6] dark:bg-gray-800 rounded-2xl p-6 sm:p-8">
                {/* Amount Input */}
                <div className="mb-8">
                  <label className="flex items-center justify-between mb-4">
                    <span className="text-[#09121F] dark:text-white font-medium">{t.amount}</span>
                    <span className="text-2xl font-bold text-[#09121F] dark:text-white">
                      {amount.toLocaleString()} {t.azn}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="200000"
                    step="1000"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-[#FF6021]"
                  />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <span>1,000 {t.azn}</span>
                    <span>200,000 {t.azn}</span>
                  </div>
                </div>

                {/* Interest Rate Input */}
                <div className="mb-8">
                  <label className="flex items-center justify-between mb-4">
                    <span className="text-[#09121F] dark:text-white font-medium">{t.interestRate}</span>
                    <span className="text-2xl font-bold text-[#09121F] dark:text-white">
                      {interestRate}{t.percent}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="0.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-[#FF6021]"
                  />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <span>5{t.percent}</span>
                    <span>30{t.percent}</span>
                  </div>
                </div>

                {/* Term Input */}
                <div className="mb-8">
                  <label className="flex items-center justify-between mb-4">
                    <span className="text-[#09121F] dark:text-white font-medium">{t.term}</span>
                    <span className="text-2xl font-bold text-[#09121F] dark:text-white">
                      {termMonths} {t.month} ({(termMonths / 12).toFixed(1)} {t.year})
                    </span>
                  </label>
                  <input
                    type="range"
                    min="6"
                    max="360"
                    step="6"
                    value={termMonths}
                    onChange={(e) => setTermMonths(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-[#FF6021]"
                  />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <span>6 {t.month}</span>
                    <span>360 {t.month}</span>
                  </div>
                </div>

                {/* Results */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-300 dark:border-gray-600">
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-[#FF6021]" />
                      <span className="text-gray-600 dark:text-gray-400 text-sm">{t.monthlyPayment}</span>
                    </div>
                    <p className="text-2xl font-bold text-[#FF6021]">
                      {monthlyPayment.toLocaleString()} {t.azn}
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-600 dark:text-gray-400 text-sm">{t.totalPayment}</span>
                    </div>
                    <p className="text-2xl font-bold text-[#09121F] dark:text-white">
                      {totalPayment.toLocaleString()} {t.azn}
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                      <span className="text-gray-600 dark:text-gray-400 text-sm">{t.totalInterest}</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-500">
                      {totalInterest.toLocaleString()} {t.azn}
                    </p>
                  </div>
                </div>

                {/* Schedule Toggle */}
                <div className="mt-6">
                  <button
                    onClick={() => setShowSchedule(!showSchedule)}
                    className="w-full py-3 px-4 bg-[#FF6021] hover:bg-[#E54500] text-white font-bold rounded-xl transition-colors"
                  >
                    {showSchedule ? t.hideSchedule : t.showSchedule}
                  </button>
                </div>
              </div>

              {/* Payment Schedule */}
              {showSchedule && schedule.length > 0 && (
                <div className="mt-8 bg-[#F6F6F6] dark:bg-gray-800 rounded-2xl p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-[#09121F] dark:text-white mb-6">{t.paymentSchedule}</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-300 dark:border-gray-600">
                          <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-400">{t.monthNumber}</th>
                          <th className="text-right py-3 px-2 text-gray-600 dark:text-gray-400">{t.payment}</th>
                          <th className="text-right py-3 px-2 text-gray-600 dark:text-gray-400">{t.principal}</th>
                          <th className="text-right py-3 px-2 text-gray-600 dark:text-gray-400">{t.interest}</th>
                          <th className="text-right py-3 px-2 text-gray-600 dark:text-gray-400">{t.remainingBalance}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedule.slice(0, 12).map((item) => (
                          <tr key={item.month} className="border-b border-gray-200 dark:border-gray-700">
                            <td className="py-3 px-2 text-[#09121F] dark:text-white">{item.month}</td>
                            <td className="text-right py-3 px-2 text-[#09121F] dark:text-white">
                              {item.payment.toLocaleString()}
                            </td>
                            <td className="text-right py-3 px-2 text-[#09121F] dark:text-white">
                              {item.principal.toLocaleString()}
                            </td>
                            <td className="text-right py-3 px-2 text-orange-500">
                              {item.interest.toLocaleString()}
                            </td>
                            <td className="text-right py-3 px-2 text-[#09121F] dark:text-white">
                              {item.balance.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {schedule.length > 12 && (
                      <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
                        ... və daha {schedule.length - 12} ay
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Tips and Actions */}
            <div className="lg:col-span-1">
              {/* Tips Card */}
              <div className="bg-[#E9F2EE] dark:bg-gray-800 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-bold text-[#09121F] dark:text-white mb-4">{t.tips}</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6021] mt-1">•</span>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{t.tip1}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6021] mt-1">•</span>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{t.tip2}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6021] mt-1">•</span>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{t.tip3}</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href={`/${locale}/credits`}
                  className="block w-full text-center py-3 px-4 bg-[#FF6021] hover:bg-[#E54500] text-white font-bold rounded-xl transition-colors"
                >
                  {t.viewCredits}
                </Link>
                <Link
                  href={`/${locale}/credits/compare`}
                  className="block w-full text-center py-3 px-4 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-[#09121F] dark:text-white font-bold rounded-xl border border-gray-300 dark:border-gray-600 transition-colors"
                >
                  {t.compareCredits}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default CalculatorClient;