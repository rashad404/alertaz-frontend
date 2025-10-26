'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

type AlertService = 'crypto' | 'stocks' | 'stock' | 'website' | 'weather' | 'currency' | 'flight';
type AlertCondition = 'above' | 'below' | 'equals';
type WebsiteCondition = 'down' | 'up';

interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  image: string | null;
}

interface Stock {
  symbol: string;
  name: string;
  exchange: string;
}

interface AlertFormFieldsProps {
  service: AlertService;
  // Crypto fields
  crypto?: string;
  cryptoId?: string;
  onCryptoChange?: (symbol: string, id: string) => void;
  cryptocurrencies?: Cryptocurrency[];
  loadingCryptos?: boolean;
  // Stocks fields
  stock?: string;
  onStockChange?: (symbol: string) => void;
  stocks?: Stock[];
  // Condition/Operator
  condition?: AlertCondition;
  onConditionChange?: (condition: AlertCondition) => void;
  // Website fields
  websiteCondition?: WebsiteCondition;
  onWebsiteConditionChange?: (condition: WebsiteCondition) => void;
  // Threshold (used for URL, price, location, etc.)
  threshold?: string;
  onThresholdChange?: (value: string) => void;
  // Disabled state
  disabled?: boolean;
}

// Top 100 US stocks - same as QuickSetup
const DEFAULT_STOCKS: Stock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', exchange: 'NYSE' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', exchange: 'NYSE' },
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', exchange: 'NYSE' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE' },
  { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE' },
  { symbol: 'MA', name: 'Mastercard Inc.', exchange: 'NYSE' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', exchange: 'NYSE' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', exchange: 'NASDAQ' },
  { symbol: 'HD', name: 'The Home Depot Inc.', exchange: 'NYSE' },
  { symbol: 'CVX', name: 'Chevron Corporation', exchange: 'NYSE' },
  { symbol: 'MRK', name: 'Merck & Co. Inc.', exchange: 'NYSE' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', exchange: 'NYSE' },
  { symbol: 'KO', name: 'The Coca-Cola Company', exchange: 'NYSE' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', exchange: 'NASDAQ' },
  { symbol: 'COST', name: 'Costco Wholesale Corporation', exchange: 'NASDAQ' },
  { symbol: 'ADBE', name: 'Adobe Inc.', exchange: 'NASDAQ' },
  { symbol: 'MCD', name: 'McDonald\'s Corporation', exchange: 'NYSE' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', exchange: 'NASDAQ' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific Inc.', exchange: 'NYSE' },
  { symbol: 'ACN', name: 'Accenture plc', exchange: 'NYSE' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', exchange: 'NYSE' },
  { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ' },
  { symbol: 'NKE', name: 'Nike Inc.', exchange: 'NYSE' },
  { symbol: 'ABT', name: 'Abbott Laboratories', exchange: 'NYSE' },
  { symbol: 'ORCL', name: 'Oracle Corporation', exchange: 'NYSE' },
  { symbol: 'CRM', name: 'Salesforce Inc.', exchange: 'NYSE' },
  { symbol: 'DHR', name: 'Danaher Corporation', exchange: 'NYSE' },
  { symbol: 'VZ', name: 'Verizon Communications Inc.', exchange: 'NYSE' },
  { symbol: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ' },
  { symbol: 'TXN', name: 'Texas Instruments Inc.', exchange: 'NASDAQ' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', exchange: 'NYSE' },
  { symbol: 'PM', name: 'Philip Morris International Inc.', exchange: 'NYSE' },
  { symbol: 'DIS', name: 'The Walt Disney Company', exchange: 'NYSE' },
  { symbol: 'NEE', name: 'NextEra Energy Inc.', exchange: 'NYSE' },
  { symbol: 'CMCSA', name: 'Comcast Corporation', exchange: 'NASDAQ' },
  { symbol: 'UPS', name: 'United Parcel Service Inc.', exchange: 'NYSE' },
  { symbol: 'BMY', name: 'Bristol-Myers Squibb Company', exchange: 'NYSE' },
  { symbol: 'HON', name: 'Honeywell International Inc.', exchange: 'NASDAQ' },
  { symbol: 'UNP', name: 'Union Pacific Corporation', exchange: 'NYSE' },
  { symbol: 'T', name: 'AT&T Inc.', exchange: 'NYSE' },
  { symbol: 'LOW', name: 'Lowe\'s Companies Inc.', exchange: 'NYSE' },
];

export default function AlertFormFields({
  service,
  crypto,
  cryptoId,
  onCryptoChange,
  cryptocurrencies = [],
  loadingCryptos = false,
  stock,
  onStockChange,
  stocks = DEFAULT_STOCKS,
  condition = 'above',
  onConditionChange,
  websiteCondition = 'down',
  onWebsiteConditionChange,
  threshold,
  onThresholdChange,
  disabled = false,
}: AlertFormFieldsProps) {
  const t = useTranslations();

  const conditions = [
    { value: 'above' as AlertCondition, label: t('alerts.quickSetup.priceGoesAbove') },
    { value: 'below' as AlertCondition, label: t('alerts.quickSetup.priceGoesBelow') },
    { value: 'equals' as AlertCondition, label: t('alerts.quickSetup.priceEquals') },
  ];

  return (
    <div className="space-y-6">
      {/* Website: Condition Selector (Down/Up) */}
      {service === 'website' && (
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
            {t('alerts.quickSetup.websiteCondition')}
          </label>
          <select
            value={websiteCondition}
            onChange={(e) => onWebsiteConditionChange?.(e.target.value as WebsiteCondition)}
            disabled={disabled}
            className={`w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <option value="down">{t('alerts.quickSetup.websiteDown')}</option>
            <option value="up">{t('alerts.quickSetup.websiteUp')}</option>
          </select>
        </div>
      )}

      {/* Crypto: Select Cryptocurrency */}
      {service === 'crypto' && (
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
            {t('alerts.quickSetup.selectCrypto')}
          </label>
          <div className="relative">
            <select
              key={`crypto-select-${cryptocurrencies.length}-${crypto}`}
              value={crypto}
              onChange={(e) => {
                const selectedSymbol = e.target.value;
                const selectedCrypto = cryptocurrencies.find(c => c.symbol === selectedSymbol);
                onCryptoChange?.(selectedSymbol, selectedCrypto?.id || '');
              }}
              disabled={disabled || loadingCryptos}
              className={`w-full px-4 py-3 pr-10 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none ${
                disabled || loadingCryptos ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loadingCryptos ? (
                <option value="">Loading...</option>
              ) : cryptocurrencies.length > 0 ? (
                cryptocurrencies.map((c) => (
                  <option key={c.id} value={c.symbol}>
                    {c.name} ({c.symbol})
                  </option>
                ))
              ) : (
                <>
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="SOL">Solana (SOL)</option>
                </>
              )}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Stocks: Select Stock */}
      {(service === 'stocks' || service === 'stock') && (
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
            {t('alerts.quickSetup.selectStock')}
          </label>
          <div className="relative">
            <select
              key={`stock-select-${stocks.length}-${stock}`}
              value={stock}
              onChange={(e) => onStockChange?.(e.target.value)}
              disabled={disabled}
              className={`w-full px-4 py-3 pr-10 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {stocks.map((s) => (
                <option key={s.symbol} value={s.symbol}>
                  {s.name} ({s.symbol})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Crypto, Stocks, Currency: Operator and Price Threshold */}
      {(service === 'crypto' || service === 'stocks' || service === 'stock' || service === 'currency') && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
              {t('alerts.quickSetup.alertCondition')}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {conditions.map((cond) => (
                <button
                  key={cond.value}
                  onClick={() => onConditionChange?.(cond.value)}
                  disabled={disabled}
                  className={`px-4 py-3 rounded-2xl font-medium transition-all ${
                    condition === cond.value
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                      : 'bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:border-indigo-500'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {cond.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
              {t('alerts.quickSetup.threshold')}
            </label>
            <input
              type="text"
              value={threshold}
              onChange={(e) => onThresholdChange?.(e.target.value)}
              disabled={disabled}
              placeholder={t('alerts.quickSetup.thresholdPlaceholder')}
              className={`w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
          </div>
        </>
      )}

      {/* Website Monitoring: URL */}
      {service === 'website' && (
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
            {t('alerts.quickSetup.websiteUrl')}
          </label>
          <input
            type="url"
            value={threshold}
            onChange={(e) => onThresholdChange?.(e.target.value)}
            disabled={disabled}
            placeholder="https://example.com"
            className={`w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
        </div>
      )}

      {/* Weather: Location */}
      {service === 'weather' && (
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
            {t('alerts.quickSetup.location')}
          </label>
          <input
            type="text"
            value={threshold}
            onChange={(e) => onThresholdChange?.(e.target.value)}
            disabled={disabled}
            placeholder="Baku, Azerbaijan"
            className={`w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
        </div>
      )}

      {/* Flight: Flight Number */}
      {service === 'flight' && (
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
            {t('alerts.quickSetup.flightNumber')}
          </label>
          <input
            type="text"
            value={threshold}
            onChange={(e) => onThresholdChange?.(e.target.value)}
            disabled={disabled}
            placeholder="J2 123 or GYD-IST"
            className={`w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
        </div>
      )}
    </div>
  );
}
