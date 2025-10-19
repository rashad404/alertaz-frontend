'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpDown, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api/client';
import Script from 'next/script';
import { parseTranslatedContent } from '@/lib/utils/translation';

interface Currency {
  id: number;
  currency: string;
  central_bank_rate: string;
}

interface BankRate {
  bank_id: number;
  bank_name: string;
  bank_logo: string | null;
  buy_price: number;
  sell_price: number;
  spread?: number;
}

interface CurrencyRate {
  id: number;
  currency: string;
  central_bank_rate: string;
  bank_rates: BankRate[];
}

interface CurrencyCalculatorClientProps {
  params: { lang: string };
}

const CurrencyCalculatorClient = ({ params }: CurrencyCalculatorClientProps) => {
  const locale = params.lang || 'az';
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('AZN');
  const [amount, setAmount] = useState<string>('100');
  const [operation, setOperation] = useState<'buy' | 'sell'>('buy');
  const [selectedBank, setSelectedBank] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);

  // Translations
  const translations = {
    az: {
      title: 'Valyuta Kalkulyatoru',
      breadcrumbHome: 'Ana səhifə',
      breadcrumbCurrent: 'Valyuta Kalkulyatoru',
      amount: 'Məbləğ',
      from: 'Bu valyutadan',
      to: 'Bu valyutaya',
      operation: 'Əməliyyat',
      buy: 'Alış',
      sell: 'Satış',
      bank: 'Bank',
      allBanks: 'Bütün banklar (Mərkəzi Bank)',
      calculate: 'Hesabla',
      result: 'Nəticə',
      exchangeRates: 'Valyuta məzənnələri',
      centralBankRate: 'Mərkəzi Bank məzənnəsi',
      bankRates: 'Bank məzənnələri',
      buyPrice: 'Alış',
      sellPrice: 'Satış',
      spread: 'Fərq',
      loading: 'Yüklənir...',
      noData: 'Məlumat yoxdur',
      swap: 'Dəyişdir'
    },
    en: {
      title: 'Currency Calculator',
      breadcrumbHome: 'Home',
      breadcrumbCurrent: 'Currency Calculator',
      amount: 'Amount',
      from: 'From',
      to: 'To',
      operation: 'Operation',
      buy: 'Buy',
      sell: 'Sell',
      bank: 'Bank',
      allBanks: 'All banks (Central Bank)',
      calculate: 'Calculate',
      result: 'Result',
      exchangeRates: 'Exchange Rates',
      centralBankRate: 'Central Bank Rate',
      bankRates: 'Bank Rates',
      buyPrice: 'Buy',
      sellPrice: 'Sell',
      spread: 'Spread',
      loading: 'Loading...',
      noData: 'No data',
      swap: 'Swap'
    },
    ru: {
      title: 'Валютный калькулятор',
      breadcrumbHome: 'Главная',
      breadcrumbCurrent: 'Валютный калькулятор',
      amount: 'Сумма',
      from: 'Из',
      to: 'В',
      operation: 'Операция',
      buy: 'Покупка',
      sell: 'Продажа',
      bank: 'Банк',
      allBanks: 'Все банки (Центральный банк)',
      calculate: 'Рассчитать',
      result: 'Результат',
      exchangeRates: 'Курсы валют',
      centralBankRate: 'Курс ЦБ',
      bankRates: 'Банковские курсы',
      buyPrice: 'Покупка',
      sellPrice: 'Продажа',
      spread: 'Разница',
      loading: 'Загрузка...',
      noData: 'Нет данных',
      swap: 'Поменять'
    }
  };
  
  const t = translations[locale as keyof typeof translations] || translations.az;

  // Fetch currencies
  const { data: currencies, isLoading: currenciesLoading } = useQuery({
    queryKey: ['currencies', locale],
    queryFn: async () => {
      const response = await apiClient.get(`/${locale}/currencies`);
      return (response.data?.data || response.data || []) as Currency[];
    }
  });

  // Fetch currency rates with bank prices
  const { data: rates, isLoading: ratesLoading } = useQuery({
    queryKey: ['currencyRates', locale],
    queryFn: async () => {
      const response = await apiClient.get(`/${locale}/currencies/rates`);
      return response.data.data as CurrencyRate[];
    }
  });

  // Get banks from the rates data
  const banks = React.useMemo(() => {
    if (!rates) return [];
    
    const bankMap = new Map<number, { id: number; name: string; logo: string | null }>();
    
    rates.forEach(rate => {
      rate.bank_rates.forEach(bankRate => {
        if (!bankMap.has(bankRate.bank_id)) {
          bankMap.set(bankRate.bank_id, {
            id: bankRate.bank_id,
            name: bankRate.bank_name,
            logo: bankRate.bank_logo
          });
        }
      });
    });
    
    return Array.from(bankMap.values());
  }, [rates]);

  // Available currencies including AZN
  const availableCurrencies = React.useMemo(() => {
    if (!currencies || !Array.isArray(currencies)) {
      return ['AZN', 'USD', 'EUR'];
    }
    const currs = [...currencies.map(c => c.currency), 'AZN'];
    return [...new Set(currs)];
  }, [currencies]);

  // Calculate conversion
  const handleCalculate = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      const response = await apiClient.post(`/${locale}/currencies/calculate`, {
        from_currency: fromCurrency,
        to_currency: toCurrency,
        amount: parseFloat(amount),
        operation,
        bank_id: selectedBank
      });

      if (response.data.success) {
        setResult(response.data.data.result);
      }
    } catch (error) {
      console.error('Calculation error:', error);
      setResult(null);
    }
  };

  // Auto-calculate when inputs change
  useEffect(() => {
    if (amount && fromCurrency && toCurrency) {
      handleCalculate();
    }
  }, [amount, fromCurrency, toCurrency, operation, selectedBank]);

  // Swap currencies
  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t.title,
    description: 'Currency exchange calculator for Azerbaijan',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'AZN'
    }
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
        name: t.breadcrumbCurrent,
        item: `https://kredit.az/${locale}/calculator/currency`
      }
    ]
  };

  if (currenciesLoading || ratesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF6021]" />
          <span className="text-gray-900 dark:text-white">{t.loading}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      <Script id="breadcrumb-schema" type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </Script>

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="bg-[#F6F6F6] dark:bg-gray-800 py-12">
          <div className="flex justify-center items-center px-4 md:px-36">
            <div className="flex w-full max-w-5xl justify-between items-center">
              <h1 className="text-[#09121F] dark:text-white text-3xl md:text-5xl font-bold">
                {t.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col justify-center items-center gap-8 py-12 px-4 md:px-36">
          <div className="w-full max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calculator Section */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                <div className="space-y-6">
                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.amount}
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF6021] focus:border-transparent"
                      placeholder="100"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Currency Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t.from}
                      </label>
                      <select
                        value={fromCurrency}
                        onChange={(e) => setFromCurrency(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF6021] focus:border-transparent"
                      >
                        {availableCurrencies.map(curr => (
                          <option key={curr} value={curr}>{curr}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t.to}
                      </label>
                      <select
                        value={toCurrency}
                        onChange={(e) => setToCurrency(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF6021] focus:border-transparent"
                      >
                        {availableCurrencies.map(curr => (
                          <option key={curr} value={curr}>{curr}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleSwap}
                      className="p-3 rounded-full bg-[#FF6021] text-white hover:bg-brand-orange-dark transition-colors"
                      aria-label={t.swap}
                    >
                      <ArrowUpDown className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Operation Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.operation}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setOperation('buy')}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                          operation === 'buy'
                            ? 'bg-[#FF6021] text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {t.buy}
                      </button>
                      <button
                        onClick={() => setOperation('sell')}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                          operation === 'sell'
                            ? 'bg-[#FF6021] text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {t.sell}
                      </button>
                    </div>
                  </div>

                  {/* Bank Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.bank}
                    </label>
                    <select
                      value={selectedBank || ''}
                      onChange={(e) => setSelectedBank(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF6021] focus:border-transparent"
                    >
                      <option value="">{t.allBanks}</option>
                      {banks.map(bank => (
                        <option key={bank.id} value={bank.id}>{parseTranslatedContent(bank.name, locale)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Result */}
                  {result !== null && (
                    <div className="p-4 bg-[#FF6021]/10 dark:bg-[#FF6021]/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.result}</p>
                      <p className="text-2xl font-bold text-[#FF6021]">
                        {result.toFixed(4)} {toCurrency}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Exchange Rates Table */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  {t.exchangeRates}
                </h2>
                
                <div className="space-y-4">
                  {rates?.map(rate => (
                    <div key={rate.id} className="bg-white dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {rate.currency}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {t.centralBankRate}: {rate.central_bank_rate}
                        </span>
                      </div>
                      
                      {rate.bank_rates.length > 0 ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                            <span>{t.bank}</span>
                            <span className="text-center">{t.buyPrice}</span>
                            <span className="text-right">{t.sellPrice}</span>
                          </div>
                          {rate.bank_rates.map(bankRate => (
                            <div key={bankRate.bank_id} className="grid grid-cols-3 gap-2 text-sm">
                              <span className="text-gray-700 dark:text-gray-300 truncate">
                                {parseTranslatedContent(bankRate.bank_name, locale)}
                              </span>
                              <span className="text-center text-green-600 dark:text-green-400">
                                {bankRate.buy_price}
                              </span>
                              <span className="text-right text-red-600 dark:text-red-400">
                                {bankRate.sell_price}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.noData}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CurrencyCalculatorClient;