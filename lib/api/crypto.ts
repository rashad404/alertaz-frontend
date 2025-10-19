import apiClient from './client';

export interface CryptoMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_30d_in_currency?: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: null;
  last_updated: string;
  sparkline_in_7d?: {
    price: number[];
  };
  popular_in_azerbaijan?: boolean;
  currency?: string;
  formatted_price?: string;
  formatted_market_cap?: string;
  formatted_volume?: string;
}

export interface CoinDetails {
  id: string;
  symbol: string;
  name: string;
  image: string;
  description: string;
  market_data: {
    current_price: {
      azn: number;
      usd: number;
    };
    market_cap: {
      azn: number;
      usd: number;
    };
    total_volume: {
      azn: number;
      usd: number;
    };
    high_24h: {
      azn: number;
      usd: number;
    };
    low_24h: {
      azn: number;
      usd: number;
    };
    price_change_percentage_1h: number;
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
  };
  sparkline_7d: number[];
  local_info: {
    available: boolean;
    exchanges: string[];
    buying_guide: string;
  };
}

export interface OHLCData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface ExchangeRates {
  rates: {
    bitcoin: {
      azn: number;
      usd: number;
      azn_24h_change?: number;
      usd_24h_change?: number;
    };
    ethereum: {
      azn: number;
      usd: number;
      azn_24h_change?: number;
      usd_24h_change?: number;
    };
  };
  usd_to_azn: number;
  gold_price_azn: number;
}

export interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  name_az: string;
  thumb: string;
}

const localePath = (locale?: string) => locale ? `/${locale}` : '/az';

export const cryptoApi = {
  // Get cryptocurrency markets
  getMarkets: async (params?: {
    vs_currency?: 'azn' | 'usd';
    page?: number;
    per_page?: number;
    sparkline?: boolean;
  }, locale?: string) => {
    const response = await apiClient.get<{
      success: boolean;
      data: CryptoMarket[];
      currency: string;
      page: number;
      per_page: number;
    }>(`${localePath(locale)}/kripto/markets`, { params });
    return response.data;
  },

  // Get coin details
  getCoinDetails: async (id: string, vs_currency: 'azn' | 'usd' = 'azn', locale?: string) => {
    const response = await apiClient.get<{
      success: boolean;
      data: CoinDetails;
      currency: string;
    }>(`${localePath(locale)}/kripto/coin/${id}`, {
      params: { vs_currency }
    });
    return response.data;
  },

  // Get OHLC chart data
  getOHLCData: async (id: string, params?: {
    vs_currency?: 'azn' | 'usd';
    days?: number;
  }, locale?: string) => {
    const response = await apiClient.get<{
      success: boolean;
      data: OHLCData[];
      currency: string;
    }>(`${localePath(locale)}/kripto/coin/${id}/ohlc`, { params });
    return response.data;
  },

  // Get exchange rates
  getExchangeRates: async (locale?: string) => {
    const response = await apiClient.get<{
      success: boolean;
      data: ExchangeRates;
    }>(`${localePath(locale)}/kripto/exchange-rates`);
    return response.data;
  },

  // Search cryptocurrencies
  searchCoins: async (query: string, locale?: string) => {
    const response = await apiClient.get<{
      success: boolean;
      data: SearchResult[];
    }>(`${localePath(locale)}/kripto/search`, {
      params: { query }
    });
    return response.data;
  },

  // Get trending cryptocurrencies
  getTrending: async (locale?: string) => {
    const response = await apiClient.get<{
      success: boolean;
      data: any;
    }>(`${localePath(locale)}/kripto/trending`);
    return response.data;
  },
};

// Utility functions for formatting
export const formatCryptoPrice = (price: number, currency: 'azn' | 'usd' = 'azn'): string => {
  const symbol = currency === 'azn' ? '₼' : '$';
  
  if (price >= 1000) {
    return `${symbol}${price.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  } else if (price >= 1) {
    return `${symbol}${price.toFixed(2)}`;
  } else {
    // For small prices, show more decimal places
    const decimals = price < 0.01 ? 6 : 4;
    return `${symbol}${price.toFixed(decimals)}`;
  }
};

export const formatMarketCap = (value: number, currency: 'azn' | 'usd' = 'azn'): string => {
  const symbol = currency === 'azn' ? '₼' : '$';
  
  if (value >= 1e12) {
    return `${symbol}${(value / 1e12).toFixed(2)} trln`;
  } else if (value >= 1e9) {
    return `${symbol}${(value / 1e9).toFixed(2)} mlrd`;
  } else if (value >= 1e6) {
    return `${symbol}${(value / 1e6).toFixed(2)} mln`;
  } else if (value >= 1e3) {
    return `${symbol}${(value / 1e3).toFixed(2)} min`;
  }
  
  return `${symbol}${value.toFixed(2)}`;
};

export const formatPercentage = (value: number): string => {
  const formatted = Math.abs(value).toFixed(2);
  return value >= 0 ? `+${formatted}%` : `-${formatted}%`;
};

export const getPercentageColor = (value: number): string => {
  return value >= 0 ? 'text-green-600' : 'text-red-600';
};

export const getPercentageBgColor = (value: number): string => {
  return value >= 0 ? 'bg-green-50' : 'bg-red-50';
};