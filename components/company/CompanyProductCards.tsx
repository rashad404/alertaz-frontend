'use client';

import { Link } from '@/lib/navigation';
import { ChevronRight, TrendingUp, Clock, DollarSign, Percent, Calendar, Building2 } from 'lucide-react';

interface CompanyProductCardsProps {
  products: any[];
  locale: string;
  productType: 'credit_loan' | 'deposit' | 'credit_card' | 'loan' | 'insurance_product';
}

export default function CompanyProductCards({ products, locale, productType }: CompanyProductCardsProps) {
  
  const getProductLink = (product: any) => {
    switch (productType) {
      case 'credit_loan':
        // Credit loans use entity_id and have detail pages in the EAV system
        return `/${locale}/sirketler/kredit-teskilatlari/nagd-kreditler/${product.entity_id || product.id}`;
      case 'deposit':
      case 'credit_card':
      case 'loan':
      case 'insurance_product':
        // These don't have detail pages - return null to disable the link
        return null;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: any) => {
    if (!amount) return '0';
    return Number(amount).toLocaleString() + ' AZN';
  };

  const getProductName = (product: any) => {
    // Handle translatable fields that might be JSON
    const getName = (field: any) => {
      if (!field) return null;
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          if (typeof parsed === 'object' && parsed[locale]) {
            return parsed[locale];
          }
          return field;
        } catch {
          return field;
        }
      }
      if (typeof field === 'object' && field[locale]) {
        return field[locale];
      }
      return field;
    };

    return getName(product.entity_name) || 
           getName(product.loan_name) || 
           getName(product.deposit_name) || 
           getName(product.card_name) || 
           getName(product.product_name) || 
           'Product';
  };

  const t = {
    az: {
      interestRate: 'İllik faiz',
      amount: 'Məbləğ',
      term: 'Müddət',
      minAmount: 'Min. məbləğ',
      maxAmount: 'Maks. məbləğ',
      viewDetails: 'Ətraflı',
      month: 'ay',
      gracePeriod: 'Güzəşt müddəti',
      creditLimit: 'Kredit limiti',
      days: 'gün'
    },
    en: {
      interestRate: 'Interest Rate',
      amount: 'Amount',
      term: 'Term',
      minAmount: 'Min. Amount',
      maxAmount: 'Max. Amount',
      viewDetails: 'View Details',
      month: 'months',
      gracePeriod: 'Grace Period',
      creditLimit: 'Credit Limit',
      days: 'days'
    },
    ru: {
      interestRate: 'Процентная ставка',
      amount: 'Сумма',
      term: 'Срок',
      minAmount: 'Мин. сумма',
      maxAmount: 'Макс. сумма',
      viewDetails: 'Подробнее',
      month: 'месяцев',
      gracePeriod: 'Льготный период',
      creditLimit: 'Кредитный лимит',
      days: 'дней'
    }
  }[locale] || {};

  const renderProductCard = (product: any) => {
    switch (productType) {
      case 'credit_loan':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all hover:border-brand-orange">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getProductName(product)}
              </h3>
              {product.interest_rate && (
                <span className="px-3 py-1 bg-brand-orange/10 text-brand-orange rounded-full text-sm font-medium">
                  {product.interest_rate}%
                </span>
              )}
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t.amount}:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(product.min_amount)} - {formatCurrency(product.max_amount)}
                </span>
              </div>
              {product.max_term_months && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t.term}:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {product.max_term_months} {t.month}
                  </span>
                </div>
              )}
            </div>

            {getProductLink(product) && (
              <Link
                href={getProductLink(product)}
                className="block w-full px-4 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-lg font-medium hover:bg-black dark:hover:bg-gray-600 transition-all text-center"
              >
                {t.viewDetails}
                <ChevronRight className="inline-block w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
        );

      case 'deposit':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all hover:border-brand-orange">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getProductName(product)}
              </h3>
              {product.interest_rate && (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                  {product.interest_rate}%
                </span>
              )}
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t.minAmount}:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(product.min_amount)}
                </span>
              </div>
              {product.term_months && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t.term}:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {product.term_months} {t.month}
                  </span>
                </div>
              )}
            </div>

            {getProductLink(product) && (
              <Link
                href={getProductLink(product)}
                className="block w-full px-4 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-lg font-medium hover:bg-black dark:hover:bg-gray-600 transition-all text-center"
              >
                {t.viewDetails}
                <ChevronRight className="inline-block w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
        );

      case 'credit_card':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all hover:border-brand-orange">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {getProductName(product)}
              </h3>
              {product.card_type && (
                <span className="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-medium">
                  {product.card_type}
                </span>
              )}
            </div>
            
            <div className="space-y-3 mb-4">
              {product.credit_limit && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t.creditLimit}:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(product.credit_limit)}
                  </span>
                </div>
              )}
              {product.grace_period && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t.gracePeriod}:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {product.grace_period} {t.days}
                  </span>
                </div>
              )}
            </div>

            {getProductLink(product) && (
              <Link
                href={getProductLink(product)}
                className="block w-full px-4 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-lg font-medium hover:bg-black dark:hover:bg-gray-600 transition-all text-center"
              >
                {t.viewDetails}
                <ChevronRight className="inline-block w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
        );

      case 'loan':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all hover:border-brand-orange">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getProductName(product)}
              </h3>
              {product.interest_rate && (
                <span className="px-3 py-1 bg-brand-orange/10 text-brand-orange rounded-full text-sm font-medium">
                  {product.interest_rate}%
                </span>
              )}
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t.amount}:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(product.min_amount)} - {formatCurrency(product.max_amount)}
                </span>
              </div>
              {product.max_term_months && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t.term}:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {product.max_term_months} {t.month}
                  </span>
                </div>
              )}
            </div>

            {getProductLink(product) && (
              <Link
                href={getProductLink(product)}
                className="block w-full px-4 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-lg font-medium hover:bg-black dark:hover:bg-gray-600 transition-all text-center"
              >
                {t.viewDetails}
                <ChevronRight className="inline-block w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
        );

      case 'insurance_product':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all hover:border-brand-orange">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getProductName(product)}
              </h3>
              {product.insurance_type && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {product.insurance_type}
                </p>
              )}
            </div>
            
            <div className="space-y-3 mb-4">
              {product.coverage_amount && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t.amount}:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(product.coverage_amount)}
                  </span>
                </div>
              )}
              {product.premium && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Premium:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(product.premium)}
                  </span>
                </div>
              )}
            </div>

            {getProductLink(product) && (
              <Link
                href={getProductLink(product)}
                className="block w-full px-4 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-lg font-medium hover:bg-black dark:hover:bg-gray-600 transition-all text-center"
              >
                {t.viewDetails}
                <ChevronRight className="inline-block w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product, index) => (
        <div key={product.id || product.entity_id || index}>
          {renderProductCard(product)}
        </div>
      ))}
    </div>
  );
}