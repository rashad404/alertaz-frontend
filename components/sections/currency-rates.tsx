"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUp, ChevronRight } from "lucide-react";
import { Link } from '@/lib/navigation';
import { useDictionary } from "@/providers/dictionary-provider";
import { currencyApi } from "@/lib/api/endpoints";
import { cn } from "@/lib/utils";

interface CurrencyRatesProps {
  locale: string;
}

export function CurrencyRates({ locale }: CurrencyRatesProps) {
  const dictionary = useDictionary();
  const t = dictionary.currency;

  const { data: currencies } = useQuery({
    queryKey: ["currencies", locale],
    queryFn: () => currencyApi.getRates(locale),
  });

  // Default currencies for when API is not available
  const defaultCurrencies = [
    { id: 1, currency: 'USD', central_bank_rate: 1.7000 },
    { id: 2, currency: 'EUR', central_bank_rate: 2.1000 },
    { id: 3, currency: 'RUB', central_bank_rate: 0.0170 },
    { id: 4, currency: 'TRY', central_bank_rate: 0.0520 },
  ];

  const currencyData = Array.isArray(currencies?.data) && currencies.data.length > 0 ? currencies.data : defaultCurrencies;

  // Mock data for rate changes - in real app this would come from API
  const rateChanges: Record<string, { change: number; trend: "up" | "down" | "stable" }> = {
    USD: { change: 0.2, trend: "up" },
    EUR: { change: -0.2, trend: "down" },
    RUB: { change: 0.2, trend: "stable" },
    TRY: { change: -8.25, trend: "down" },
  };

  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    stable: "text-blue-500",
  };

  return (
    <div className="border-t border-b border-gray-100 dark:border-gray-800 py-4 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
          {currencyData.slice(0, 4).map((currency) => {
            const change = rateChanges[currency.currency] || { change: 0, trend: "stable" };
            
            return (
              <div
                key={currency.id}
                className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 flex items-center space-x-2 flex-shrink-0"
              >
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  {currency.currency}
                </span>
                <span className="text-black dark:text-white text-sm font-medium">
                  {currency.central_bank_rate.toFixed(4)}
                </span>
                <span className={cn("text-xs", trendColors[change.trend])}>
                  %{Math.abs(change.change).toFixed(1)}
                </span>
                <ArrowUp
                  className={cn(
                    "w-3 h-3",
                    trendColors[change.trend],
                    change.trend === "down" && "rotate-180"
                  )}
                />
              </div>
            );
          })}
        </div>
        
        <Link
          href={'/kalkulyator/valyuta'}
          className="hidden sm:flex items-center space-x-1 border border-black/50 dark:border-gray-600 text-black dark:text-white px-3 py-2 rounded-lg text-sm opacity-50 hover:opacity-100 transition-opacity"
        >
          <span>{t.exchangeRates}</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}