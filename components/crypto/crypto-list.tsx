"use client";

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/lib/navigation';
import Image from 'next/image';
import { Search, TrendingUp, TrendingDown, DollarSign, Info, RefreshCw } from 'lucide-react';
import { cryptoApi, formatCryptoPrice, formatMarketCap, formatPercentage, getPercentageColor } from '@/lib/api/crypto';
import { cn } from '@/lib/utils';
import { Sparkline } from './sparkline';

interface CryptoListProps {
  locale: string;
}

export function CryptoList({ locale }: CryptoListProps) {
  const [currency, setCurrency] = useState<'azn' | 'usd'>('usd');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Save currency preference
  useEffect(() => {
    const saved = localStorage.getItem('crypto_currency');
    if (saved === 'usd' || saved === 'azn') {
      setCurrency(saved);
    } else {
      // Set default to USD if nothing saved
      setCurrency('usd');
      localStorage.setItem('crypto_currency', 'usd');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('crypto_currency', currency);
  }, [currency]);

  // Fetch market data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['crypto-markets', currency, page],
    queryFn: () => cryptoApi.getMarkets({
      vs_currency: currency,
      page,
      per_page: 50,
      sparkline: true
    }, locale),
    refetchInterval: autoRefresh ? 60000 : false, // Auto-refresh every 60 seconds
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  // Search functionality
  const { data: searchResults } = useQuery({
    queryKey: ['crypto-search', searchQuery],
    queryFn: () => cryptoApi.searchCoins(searchQuery, locale),
    enabled: searchQuery.length >= 2,
  });

  // Filter coins based on search
  const filteredCoins = searchQuery.length >= 2 && searchResults?.data
    ? data?.data.filter(coin => 
        searchResults.data.some(result => result.id === coin.id)
      )
    : data?.data;

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'azn' ? 'usd' : 'azn');
  };

  const getLocalizedText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      az: {
        title: 'Kriptovalyuta Bazarı',
        subtitle: 'Canlı qiymətlər və bazar məlumatları',
        search_placeholder: 'Kriptovalyuta axtar... (Bitcoin, Ethereum)',
        rank: '№',
        name: 'Ad',
        price: 'Qiymət',
        change_24h: '24s',
        change_7d: '7g',
        market_cap: 'Bazar Dəyəri',
        volume: 'Həcm (24s)',
        chart_7d: '7 Günlük',
        popular: 'Azərbaycanda Populyar',
        currency_toggle: currency === 'azn' ? 'USD-yə keç' : 'AZN-ə keç',
        auto_refresh: 'Avtomatik yenilə',
        loading: 'Yüklənir...',
        error: 'Məlumat yüklənərkən xəta baş verdi',
        retry: 'Yenidən cəhd et',
        no_results: 'Heç bir nəticə tapılmadı',
        page_info: `Səhifə ${page}`,
        next_page: 'Növbəti',
        prev_page: 'Əvvəlki',
        learn_more: 'Ətraflı',
        calculator: 'Kalkulyator',
        how_to_buy: 'Necə almaq olar?',
        what_is_crypto: 'Kriptovalyuta nədir?',
        crypto_description: 'Kriptovalyuta rəqəmsal və ya virtual valyutadır. Bitcoin 2009-cu ildə yaradılan ilk kriptovalyutadır. Azərbaycanda kriptovalyuta almaq üçün Binance, KuCoin kimi beynəlxalq birjaları istifadə edə bilərsiniz.',
      },
      en: {
        title: 'Cryptocurrency Market',
        subtitle: 'Live prices and market data',
        search_placeholder: 'Search cryptocurrency... (Bitcoin, Ethereum)',
        rank: '#',
        name: 'Name',
        price: 'Price',
        change_24h: '24h',
        change_7d: '7d',
        market_cap: 'Market Cap',
        volume: 'Volume (24h)',
        chart_7d: '7 Days',
        popular: 'Popular in Azerbaijan',
        currency_toggle: currency === 'azn' ? 'Switch to USD' : 'Switch to AZN',
        auto_refresh: 'Auto refresh',
        loading: 'Loading...',
        error: 'Error loading data',
        retry: 'Try again',
        no_results: 'No results found',
        page_info: `Page ${page}`,
        next_page: 'Next',
        prev_page: 'Previous',
        learn_more: 'Learn more',
        calculator: 'Calculator',
        how_to_buy: 'How to buy?',
        what_is_crypto: 'What is cryptocurrency?',
        crypto_description: 'Cryptocurrency is a digital or virtual currency. Bitcoin was the first cryptocurrency created in 2009. In Azerbaijan, you can use international exchanges like Binance, KuCoin to buy cryptocurrency.',
      },
      ru: {
        title: 'Криптовалютный рынок',
        subtitle: 'Актуальные цены и рыночные данные',
        search_placeholder: 'Поиск криптовалюты... (Bitcoin, Ethereum)',
        rank: '№',
        name: 'Название',
        price: 'Цена',
        change_24h: '24ч',
        change_7d: '7д',
        market_cap: 'Рыночная кап.',
        volume: 'Объем (24ч)',
        chart_7d: '7 дней',
        popular: 'Популярно в Азербайджане',
        currency_toggle: currency === 'azn' ? 'Переключить на USD' : 'Переключить на AZN',
        auto_refresh: 'Автообновление',
        loading: 'Загрузка...',
        error: 'Ошибка при загрузке данных',
        retry: 'Попробовать снова',
        no_results: 'Ничего не найдено',
        page_info: `Страница ${page}`,
        next_page: 'Следующая',
        prev_page: 'Предыдущая',
        learn_more: 'Подробнее',
        calculator: 'Калькулятор',
        how_to_buy: 'Как купить?',
        what_is_crypto: 'Что такое криптовалюта?',
        crypto_description: 'Криптовалюта — это цифровая или виртуальная валюта. Bitcoin был первой криптовалютой, созданной в 2009 году. В Азербайджане вы можете использовать международные биржи, такие как Binance, KuCoin, для покупки криптовалюты.',
      },
    };
    const currentLocale = locale || 'az';
    return texts[currentLocale]?.[key] || texts.az[key] || key;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">{getLocalizedText('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{getLocalizedText('error')}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {getLocalizedText('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
        <h1 className="text-3xl font-bold mb-2">{getLocalizedText('title')}</h1>
        <p className="text-blue-100">{getLocalizedText('subtitle')}</p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <p className="text-sm text-blue-100">Bitcoin</p>
            <p className="text-xl font-bold">
              {formatCryptoPrice(data?.data.find(c => c.id === 'bitcoin')?.current_price || 0, currency)}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <p className="text-sm text-blue-100">Ethereum</p>
            <p className="text-xl font-bold">
              {formatCryptoPrice(data?.data.find(c => c.id === 'ethereum')?.current_price || 0, currency)}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <p className="text-sm text-blue-100">1 USD</p>
            <p className="text-xl font-bold">₼1.70</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <p className="text-sm text-blue-100">Qızıl (1q)</p>
            <p className="text-xl font-bold">₼85</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder={getLocalizedText('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Currency Toggle */}
        <button
          onClick={toggleCurrency}
          className="px-6 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <DollarSign className="h-5 w-5" />
          <span>{getLocalizedText('currency_toggle')}</span>
        </button>

        {/* Auto Refresh Toggle */}
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={cn(
            "px-6 py-3 rounded-lg flex items-center justify-center gap-2",
            autoRefresh 
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-white text-gray-700 border border-gray-200"
          )}
        >
          <RefreshCw className={cn("h-5 w-5", autoRefresh && "animate-spin")} />
          <span>{getLocalizedText('auto_refresh')}</span>
        </button>
      </div>

      {/* Popular in Azerbaijan */}
      {!searchQuery && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {getLocalizedText('popular')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {['Bitcoin (BTC)', 'Ethereum (ETH)', 'Tether (USDT)', 'BNB'].map((coin) => (
              <span key={coin} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                {coin}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Crypto Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {getLocalizedText('rank')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {getLocalizedText('name')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {getLocalizedText('price')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {getLocalizedText('change_24h')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  {getLocalizedText('change_7d')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  {getLocalizedText('market_cap')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                  {getLocalizedText('volume')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  {getLocalizedText('chart_7d')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCoins?.map((coin) => (
                <tr key={coin.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {coin.market_cap_rank}
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/crypto/${coin.id}`} className="flex items-center gap-3">
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900 hover:text-blue-600">
                          {coin.name}
                        </p>
                        <p className="text-xs text-gray-500 uppercase">{coin.symbol}</p>
                      </div>
                      {coin.popular_in_azerbaijan && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          Popular
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-right font-medium">
                    {formatCryptoPrice(coin.current_price, currency)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={cn(
                      "inline-flex items-center gap-1 font-medium",
                      getPercentageColor(coin.price_change_percentage_24h)
                    )}>
                      {coin.price_change_percentage_24h >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {formatPercentage(coin.price_change_percentage_24h)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right hidden md:table-cell">
                    <span className={cn(
                      "font-medium",
                      getPercentageColor(coin.price_change_percentage_7d_in_currency || 0)
                    )}>
                      {formatPercentage(coin.price_change_percentage_7d_in_currency || 0)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-gray-600 hidden lg:table-cell">
                    {formatMarketCap(coin.market_cap, currency)}
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-gray-600 hidden xl:table-cell">
                    {formatMarketCap(coin.total_volume, currency)}
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <div className="w-24 h-10">
                      {coin.sparkline_in_7d && (
                        <Sparkline
                          data={coin.sparkline_in_7d.price}
                          color={coin.price_change_percentage_7d_in_currency >= 0 ? '#10b981' : '#ef4444'}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
          <p className="text-sm text-gray-700">{getLocalizedText('page_info')}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {getLocalizedText('prev_page')}
            </button>
            <button
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {getLocalizedText('next_page')}
            </button>
          </div>
        </div>
      </div>

      {/* Educational Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Info className="h-5 w-5" />
          {getLocalizedText('what_is_crypto')}
        </h3>
        <p className="text-blue-800 mb-4">
          {getLocalizedText('crypto_description')}
        </p>
        <Link
          href="/crypto/guide"
          className="inline-flex items-center gap-2 text-blue-700 font-medium hover:text-blue-900"
        >
          {getLocalizedText('how_to_buy')}
          <TrendingUp className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}