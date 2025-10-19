"use client";

import { useState, useEffect } from 'react';
import { X, ArrowUpDown, Calculator } from 'lucide-react';
import { formatCryptoPrice } from '@/lib/api/crypto';

interface CryptoCalculatorProps {
  coinId: string;
  coinName: string;
  coinSymbol: string;
  currentPrice: number;
  currency: 'azn' | 'usd';
  onClose?: () => void;
}

export function CryptoCalculator({
  coinId,
  coinName,
  coinSymbol,
  currentPrice,
  currency,
  onClose
}: CryptoCalculatorProps) {
  const [cryptoAmount, setCryptoAmount] = useState<string>('1');
  const [fiatAmount, setFiatAmount] = useState<string>('');
  const [isReversed, setIsReversed] = useState(false);

  // Calculate conversions
  useEffect(() => {
    if (!isReversed && cryptoAmount) {
      const crypto = parseFloat(cryptoAmount) || 0;
      const fiat = crypto * currentPrice;
      setFiatAmount(fiat > 0 ? fiat.toFixed(2) : '');
    }
  }, [cryptoAmount, currentPrice, isReversed]);

  useEffect(() => {
    if (isReversed && fiatAmount) {
      const fiat = parseFloat(fiatAmount) || 0;
      const crypto = fiat / currentPrice;
      setCryptoAmount(crypto > 0 ? crypto.toFixed(8) : '');
    }
  }, [fiatAmount, currentPrice, isReversed]);

  const handleCryptoChange = (value: string) => {
    // Allow only numbers and decimal point
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setCryptoAmount(value);
      setIsReversed(false);
    }
  };

  const handleFiatChange = (value: string) => {
    // Allow only numbers and decimal point
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setFiatAmount(value);
      setIsReversed(true);
    }
  };

  const toggleDirection = () => {
    setIsReversed(!isReversed);
    // Clear inputs to recalculate
    if (isReversed) {
      setCryptoAmount('1');
      setFiatAmount('');
    } else {
      setFiatAmount('100');
      setCryptoAmount('');
    }
  };

  const getLocalizedText = (key: string) => {
    const texts: Record<string, string> = {
      title: 'Kriptovalyuta Kalkulyatoru',
      subtitle: `${coinName} qiymət çevirici`,
      amount: 'Miqdar',
      result: 'Nəticə',
      current_rate: 'Cari məzənnə',
      quick_amounts: 'Tez seçimlər',
      reverse: 'Tərsinə çevir',
      close: 'Bağla',
      currency_label: currency === 'azn' ? 'AZN' : 'USD',
    };
    return texts[key] || key;
  };

  const quickAmounts = isReversed 
    ? [100, 500, 1000, 5000, 10000]
    : [0.001, 0.01, 0.1, 1, 10];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {getLocalizedText('title')}
          </h3>
          <p className="text-sm text-gray-600">{getLocalizedText('subtitle')}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Input Fields */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {coinSymbol.toUpperCase()} {getLocalizedText('amount')}
            </label>
            <input
              type="text"
              value={cryptoAmount}
              onChange={(e) => handleCryptoChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                !isReversed ? 'bg-white' : 'bg-gray-50'
              }`}
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={toggleDirection}
              className="p-2 hover:bg-gray-100 rounded-lg transition-transform hover:rotate-180"
            >
              <ArrowUpDown className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getLocalizedText('currency_label')} {getLocalizedText('amount')}
            </label>
            <input
              type="text"
              value={fiatAmount}
              onChange={(e) => handleFiatChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isReversed ? 'bg-white' : 'bg-gray-50'
              }`}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            {getLocalizedText('quick_amounts')}
          </p>
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  if (isReversed) {
                    setFiatAmount(amount.toString());
                    setIsReversed(true);
                  } else {
                    setCryptoAmount(amount.toString());
                    setIsReversed(false);
                  }
                }}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
              >
                {isReversed ? (
                  `${currency === 'azn' ? '₼' : '$'}${amount}`
                ) : (
                  `${amount} ${coinSymbol.toUpperCase()}`
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Current Rate Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700 mb-1">{getLocalizedText('current_rate')}</p>
          <p className="text-lg font-semibold text-blue-900">
            1 {coinSymbol.toUpperCase()} = {formatCryptoPrice(currentPrice, currency)}
          </p>
        </div>

        {/* Result Summary */}
        {(cryptoAmount && fiatAmount) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700 mb-1">{getLocalizedText('result')}</p>
            <p className="text-xl font-bold text-green-900">
              {cryptoAmount} {coinSymbol.toUpperCase()} = {currency === 'azn' ? '₼' : '$'}{fiatAmount}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}