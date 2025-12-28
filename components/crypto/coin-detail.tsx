"use client";

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/lib/navigation';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Info, 
  Calculator,
  Clock,
  Activity,
  BarChart3,
  RefreshCw,
  Share2,
  Star
} from 'lucide-react';
import { cryptoApi, formatCryptoPrice, formatMarketCap, formatPercentage, getPercentageColor } from '@/lib/api/crypto';
import { cn } from '@/lib/utils';
import { PriceChart } from './price-chart';
import { CryptoCalculator } from './crypto-calculator';

interface CoinDetailProps {
  coinId: string;
  locale: string;
}

export function CoinDetail({ coinId, locale }: CoinDetailProps) {
  const [currency, setCurrency] = useState<'azn' | 'usd'>('usd');
  const [timeframe, setTimeframe] = useState<'1' | '7' | '30' | '90' | '365'>('7');
  const [showCalculator, setShowCalculator] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load currency preference
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

  // Fetch coin details
  const { data: coinData, isLoading, error, refetch } = useQuery({
    queryKey: ['crypto-coin', coinId, currency],
    queryFn: () => cryptoApi.getCoinDetails(coinId, currency, locale),
    refetchInterval: autoRefresh ? 60000 : false,
    staleTime: 30000,
  });

  // Fetch OHLC data for chart
  const { data: chartData } = useQuery({
    queryKey: ['crypto-ohlc', coinId, currency, timeframe],
    queryFn: () => cryptoApi.getOHLCData(coinId, {
      vs_currency: currency,
      days: parseInt(timeframe)
    }, locale),
    staleTime: 60000,
  });

  const getLocalizedText = (key: string) => {
    const texts: Record<string, string> = {
      back: 'Geriyə',
      loading: 'Yüklənir...',
      error: 'Məlumat yüklənərkən xəta baş verdi',
      retry: 'Yenidən cəhd et',
      price: 'Qiymət',
      market_cap: 'Bazar Dəyəri',
      volume_24h: 'Həcm (24s)',
      high_24h: 'Maksimum (24s)',
      low_24h: 'Minimum (24s)',
      change_1h: '1 saat',
      change_24h: '24 saat',
      change_7d: '7 gün',
      change_30d: '30 gün',
      circulating_supply: 'Dövriyyədə',
      total_supply: 'Ümumi təklif',
      max_supply: 'Maksimum təklif',
      calculator: 'Kalkulyator',
      share: 'Paylaş',
      favorite: 'Sevimlilərə əlavə et',
      auto_refresh: 'Avtomatik yenilə',
      currency_toggle: currency === 'azn' ? 'USD-yə keç' : 'AZN-ə keç',
      timeframe_1d: '1 Gün',
      timeframe_7d: '7 Gün',
      timeframe_30d: '30 Gün',
      timeframe_90d: '90 Gün',
      timeframe_1y: '1 İl',
      about: 'Haqqında',
      local_exchanges: 'Azərbaycanda haradan almaq olar?',
      buying_guide: 'Alış təlimatı',
      available_on: 'Mövcud birjalar',
      price_statistics: 'Qiymət Statistikaları',
      supply_info: 'Təklif Məlumatları',
    };
    return texts[key] || key;
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

  if (error || !coinData?.data) {
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

  const coin = coinData.data;
  const currentPrice = currency === 'azn' ? coin.market_data.current_price.azn : coin.market_data.current_price.usd;
  const marketCap = currency === 'azn' ? coin.market_data.market_cap.azn : coin.market_data.market_cap.usd;
  const volume = currency === 'azn' ? coin.market_data.total_volume.azn : coin.market_data.total_volume.usd;
  const high24h = currency === 'azn' ? coin.market_data.high_24h.azn : coin.market_data.high_24h.usd;
  const low24h = currency === 'azn' ? coin.market_data.low_24h.azn : coin.market_data.low_24h.usd;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/crypto"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{getLocalizedText('back')}</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Calculator className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <Share2 className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <Star className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex items-start gap-6">
          <img
            src={coin.image}
            alt={coin.name}
            className="w-16 h-16 rounded-full"
          />
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{coin.name}</h1>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium uppercase">
                {coin.symbol}
              </span>
              {coin.local_info.available && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  Azərbaycanda mövcud
                </span>
              )}
            </div>
            
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold">
                {formatCryptoPrice(currentPrice, currency)}
              </span>
              <span className={cn(
                "text-2xl font-medium flex items-center gap-1",
                getPercentageColor(coin.market_data.price_change_percentage_24h)
              )}>
                {coin.market_data.price_change_percentage_24h >= 0 ? (
                  <TrendingUp className="h-6 w-6" />
                ) : (
                  <TrendingDown className="h-6 w-6" />
                )}
                {formatPercentage(coin.market_data.price_change_percentage_24h)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setCurrency(prev => prev === 'azn' ? 'usd' : 'azn')}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">{getLocalizedText('currency_toggle')}</span>
            </button>
            
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(
                "px-4 py-2 rounded-lg flex items-center gap-2",
                autoRefresh 
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gray-100 text-gray-700"
              )}
            >
              <RefreshCw className={cn("h-4 w-4", autoRefresh && "animate-spin")} />
              <span className="text-sm">{getLocalizedText('auto_refresh')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calculator Modal */}
      {showCalculator && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <CryptoCalculator
            coinId={coin.id}
            coinName={coin.name}
            coinSymbol={coin.symbol}
            currentPrice={currentPrice}
            currency={currency}
            onClose={() => setShowCalculator(false)}
          />
        </div>
      )}

      {/* Price Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Qiymət Qrafiki
          </h2>
          
          <div className="flex gap-2">
            {(['1', '7', '30', '90', '365'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={cn(
                  "px-3 py-1 rounded-lg text-sm font-medium",
                  timeframe === tf
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {tf === '1' && getLocalizedText('timeframe_1d')}
                {tf === '7' && getLocalizedText('timeframe_7d')}
                {tf === '30' && getLocalizedText('timeframe_30d')}
                {tf === '90' && getLocalizedText('timeframe_90d')}
                {tf === '365' && getLocalizedText('timeframe_1y')}
              </button>
            ))}
          </div>
        </div>
        
        {chartData?.data && (
          <PriceChart
            data={chartData.data}
            currency={currency}
            height={400}
          />
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Price Statistics */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {getLocalizedText('price_statistics')}
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">{getLocalizedText('market_cap')}</span>
              <span className="font-medium">{formatMarketCap(marketCap, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{getLocalizedText('volume_24h')}</span>
              <span className="font-medium">{formatMarketCap(volume, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{getLocalizedText('high_24h')}</span>
              <span className="font-medium text-green-600">{formatCryptoPrice(high24h, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{getLocalizedText('low_24h')}</span>
              <span className="font-medium text-red-600">{formatCryptoPrice(low24h, currency)}</span>
            </div>
            
            <div className="pt-3 border-t space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{getLocalizedText('change_1h')}</span>
                <span className={cn("font-medium", getPercentageColor(coin.market_data.price_change_percentage_1h))}>
                  {formatPercentage(coin.market_data.price_change_percentage_1h)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{getLocalizedText('change_7d')}</span>
                <span className={cn("font-medium", getPercentageColor(coin.market_data.price_change_percentage_7d))}>
                  {formatPercentage(coin.market_data.price_change_percentage_7d)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{getLocalizedText('change_30d')}</span>
                <span className={cn("font-medium", getPercentageColor(coin.market_data.price_change_percentage_30d))}>
                  {formatPercentage(coin.market_data.price_change_percentage_30d)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Supply Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Info className="h-5 w-5" />
            {getLocalizedText('supply_info')}
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">{getLocalizedText('circulating_supply')}</span>
              <span className="font-medium">
                {coin.market_data.circulating_supply?.toLocaleString() || 'N/A'} {coin.symbol.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{getLocalizedText('total_supply')}</span>
              <span className="font-medium">
                {coin.market_data.total_supply?.toLocaleString() || 'N/A'} {coin.symbol.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{getLocalizedText('max_supply')}</span>
              <span className="font-medium">
                {coin.market_data.max_supply?.toLocaleString() || '∞'} {coin.symbol.toUpperCase()}
              </span>
            </div>
            
            {coin.market_data.circulating_supply && coin.market_data.max_supply && (
              <div className="pt-3 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Dövriyyə nisbəti</span>
                  <span className="font-medium">
                    {((coin.market_data.circulating_supply / coin.market_data.max_supply) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(coin.market_data.circulating_supply / coin.market_data.max_supply) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Local Exchange Information */}
      {coin.local_info && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <Info className="h-5 w-5" />
            {getLocalizedText('local_exchanges')}
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-blue-800 font-medium mb-2">{getLocalizedText('available_on')}:</p>
              <div className="flex flex-wrap gap-2">
                {coin.local_info.exchanges.map((exchange) => (
                  <span key={exchange} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {exchange}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-blue-800 font-medium mb-2">{getLocalizedText('buying_guide')}:</p>
              <p className="text-blue-700">{coin.local_info.buying_guide}</p>
            </div>
          </div>
        </div>
      )}

      {/* About Section */}
      {coin.description && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">{getLocalizedText('about')} {coin.name}</h3>
          <div 
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: coin.description }}
          />
        </div>
      )}
    </div>
  );
}