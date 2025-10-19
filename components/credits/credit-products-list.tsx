'use client';

import React, { useState } from 'react';
import { Scale, Plus, Grid3X3, List, Search, SlidersHorizontal, ChevronRight, TrendingDown, Building2, Clock, Percent, Banknote, Calendar, Check, X } from 'lucide-react';
import { useEntityComparison } from '@/contexts/entity-comparison-context';
import { getEntityTypeDisplayName } from '@/lib/entity-types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface CreditProduct {
  id: number;
  entity_id: number;
  entity_name: string;
  entity_type: string;
  company_id: number;
  company_name: string;
  company_slug: string;
  company_logo?: string;
  // Credit-specific attributes
  interest_rate?: string;
  min_amount?: number;
  max_amount?: number;
  max_term_months?: number;
  loan_type?: string;
  requirements?: string;
  processing_time?: string;
  monthly_payment?: number;
  commission?: number;
  // Additional attributes from EAV
  attributes?: Record<string, any>;
}

interface CreditProductsListProps {
  products: CreditProduct[];
  locale: string;
  creditType: string;
  creditTypeName: string;
}

export default function CreditProductsList({ 
  products, 
  locale, 
  creditType,
  creditTypeName 
}: CreditProductsListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('interest_rate');
  const { addToComparison, removeFromComparison, isInComparison, canAddMore } = useEntityComparison();

  // Filter products based on search
  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.entity_name.toLowerCase().includes(searchLower) ||
      product.company_name.toLowerCase().includes(searchLower) ||
      product.loan_type?.toLowerCase().includes(searchLower)
    );
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'interest_rate':
        return (parseFloat(a.interest_rate || '999') - parseFloat(b.interest_rate || '999'));
      case 'min_amount':
        return (a.min_amount || 0) - (b.min_amount || 0);
      case 'max_amount':
        return (b.max_amount || 0) - (a.max_amount || 0);
      case 'company':
        return a.company_name.localeCompare(b.company_name);
      default:
        return 0;
    }
  });

  // Convert loan_type to proper display entity type for comparison
  const getLoanTypeDisplayKey = (loanType: string): string => {
    const loanTypeMapping: Record<string, string> = {
      'cash': 'cash_loans',
      'student': 'education_loans', 
      'business': 'business_loans',
      'express': 'credit_lines',
      'pawn': 'pawnshop_loans',
      'auto': 'auto_loans',
      'mortgage': 'mortgage_loans'
    };
    
    return loanTypeMapping[loanType] || loanType;
  };

  const handleCompareToggle = (product: CreditProduct) => {
    console.log('=== handleCompareToggle START ===');
    console.log('Product received:', product);
    
    if (!product) {
      console.error('Product is undefined!');
      return;
    }
    
    if (!product.entity_id) {
      console.error('Product entity_id is undefined!', product);
      return;
    }
    
    // Convert loan_type to proper display key for comparison
    const rawLoanType = product.loan_type || product.entity_type;
    const comparisonEntityType = getLoanTypeDisplayKey(rawLoanType);
    
    console.log('Product entity_id:', product.entity_id);
    console.log('Product company_id:', product.company_id);
    console.log('comparisonEntityType:', comparisonEntityType);
    console.log('creditTypeName:', creditTypeName);
    
    const entityItem = {
      entityId: product.entity_id,
      entityType: comparisonEntityType,
      entityTypeName: creditTypeName || 'Cash Loans',
      entityName: product.entity_name || 'Unknown',
      companyId: product.company_id,
      companyName: product.company_name || 'Unknown',
      companySlug: product.company_slug || '',
      companyType: 'credit_organization',
      attributes: {
        interest_rate: product.interest_rate,
        min_amount: product.min_amount,
        max_amount: product.max_amount,
        max_term_months: product.max_term_months,
        ...product.attributes
      }
    };
    
    console.log('EntityItem to add:', entityItem);

    if (isInComparison(product.entity_id, comparisonEntityType)) {
      console.log('Removing from comparison');
      removeFromComparison(product.entity_id, comparisonEntityType);
    } else {
      console.log('Adding to comparison');
      const result = addToComparison(entityItem);
      console.log('addToComparison result:', result);
    }
    console.log('=== handleCompareToggle END ===');
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '0';
    return new Intl.NumberFormat('az-AZ', {
      style: 'currency',
      currency: 'AZN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const translations = {
    az: {
      search: 'Axtar...',
      sortBy: 'Sırala',
      interestRate: 'Faiz dərəcəsi',
      minAmount: 'Minimum məbləğ',
      maxAmount: 'Maksimum məbləğ',
      company: 'Şirkət',
      viewDetails: 'Ətraflı',
      addToCompare: 'Müqayisə et',
      removeFromCompare: 'Çıxar',
      maxCompareReached: 'Maksimum müqayisə sayına çatdınız',
      from: 'dan',
      to: 'dək',
      months: 'ay',
      noProducts: 'Məhsul tapılmadı',
      term: 'Müddət',
      amount: 'Məbləğ',
      perYear: 'illik'
    },
    en: {
      search: 'Search...',
      sortBy: 'Sort by',
      interestRate: 'Interest rate',
      minAmount: 'Minimum amount',
      maxAmount: 'Maximum amount',
      company: 'Company',
      viewDetails: 'Details',
      addToCompare: 'Compare',
      removeFromCompare: 'Remove',
      maxCompareReached: 'Maximum comparison limit reached',
      from: 'from',
      to: 'to',
      months: 'months',
      noProducts: 'No products found',
      term: 'Term',
      amount: 'Amount',
      perYear: 'per year'
    },
    ru: {
      search: 'Поиск...',
      sortBy: 'Сортировать',
      interestRate: 'Процентная ставка',
      minAmount: 'Минимальная сумма',
      maxAmount: 'Максимальная сумма',
      company: 'Компания',
      viewDetails: 'Детали',
      addToCompare: 'Сравнить',
      removeFromCompare: 'Удалить',
      maxCompareReached: 'Достигнут максимум для сравнения',
      from: 'от',
      to: 'до',
      months: 'месяцев',
      noProducts: 'Продукты не найдены',
      term: 'Срок',
      amount: 'Сумма',
      perYear: 'годовых'
    }
  };

  const t = translations[locale as keyof typeof translations] || translations.az;

  return (
    <div className="space-y-8">
      {/* Filters and Controls - Modern Glass Design */}
      <div className="">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search - Enhanced Design */}
          <div className="flex-1">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-orange transition-colors" />
              <input
                type="text"
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all"
              />
            </div>
          </div>

          {/* Sort - Modern Dropdown */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200/50 dark:border-gray-700/50 rounded-xl">
              <SlidersHorizontal className="w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-gray-900 dark:text-white focus:outline-none cursor-pointer font-medium"
              >
                <option value="interest_rate">{t.interestRate}</option>
                <option value="min_amount">{t.minAmount}</option>
                <option value="max_amount">{t.maxAmount}</option>
                <option value="company">{t.company}</option>
              </select>
            </div>
          </div>

          {/* View Mode - Pill Style Toggle */}
          <div className="flex items-center bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "px-4 py-2.5 rounded-lg transition-all duration-300",
                viewMode === 'grid' 
                  ? "bg-white dark:bg-gray-700 text-brand-orange shadow-lg scale-105" 
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "px-4 py-2.5 rounded-lg transition-all duration-300",
                viewMode === 'list' 
                  ? "bg-white dark:bg-gray-700 text-brand-orange shadow-lg scale-105" 
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-xl text-gray-500 dark:text-gray-400">{t.noProducts}</p>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View - Modern Card Design
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedProducts.map((product) => {
            // Use the same mapped entity type for checking as we use for adding
            const comparisonEntityType = getLoanTypeDisplayKey(product.loan_type || product.entity_type);
            const inComparison = isInComparison(product.entity_id, comparisonEntityType);
            const canAdd = canAddMore(comparisonEntityType);

            return (
              <div
                key={product.entity_id}
                className="group relative bg-white dark:bg-gray-800/50 backdrop-blur rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
              >
                {/* Quick Compare Badge */}
                <button
                  onClick={() => handleCompareToggle(product)}
                  disabled={!inComparison && !canAdd}
                  className={cn(
                    "absolute top-4 right-4 z-10 w-10 h-10 rounded-full backdrop-blur-xl transition-all duration-300 flex items-center justify-center",
                    inComparison
                      ? "bg-red-500/90 text-white hover:bg-red-600 shadow-lg"
                      : canAdd
                      ? "bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-brand-orange hover:text-white hover:shadow-lg"
                      : "bg-gray-200/50 text-gray-400 cursor-not-allowed"
                  )}
                  title={!canAdd && !inComparison ? t.maxCompareReached : ''}
                >
                  {inComparison ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </button>

                {/* Card Content */}
                <div className="p-6">
                  {/* Company Info */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {product.company_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {product.entity_name}
                    </p>
                  </div>

                  {/* Interest Rate - Hero Feature */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-brand-orange">
                        {product.interest_rate || '—'}%
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t.perYear}</span>
                    </div>
                  </div>

                  {/* Key Features */}
                  <div className="space-y-4 mb-6">
                    {/* Amount */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
                        <Banknote className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t.amount}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(product.min_amount)} - {formatCurrency(product.max_amount)}
                        </p>
                      </div>
                    </div>

                    {/* Term */}
                    {product.max_term_months && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t.term}</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {product.max_term_months} {t.months}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Processing Time */}
                    {product.processing_time && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Processing</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {product.processing_time}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/${locale}/sirketler/kredit-teskilatlari/${creditType}/${product.entity_id}`}
                    className="block w-full px-4 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-xl font-medium hover:bg-black dark:hover:bg-gray-600 transition-all duration-300 text-center group-hover:shadow-lg"
                  >
                    {t.viewDetails}
                    <ChevronRight className="inline-block w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // List View - Modern Horizontal Cards
        <div className="space-y-4">
          {sortedProducts.map((product) => {
            // Use the same mapped entity type for checking as we use for adding
            const comparisonEntityType = getLoanTypeDisplayKey(product.loan_type || product.entity_type);
            const inComparison = isInComparison(product.entity_id, comparisonEntityType);
            const canAdd = canAddMore(comparisonEntityType);

            return (
              <div
                key={product.entity_id}
                className="group bg-white dark:bg-gray-800/50 backdrop-blur rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Company Info - Left Side */}
                  <div className="lg:w-64 p-6 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-700/50">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {product.company_name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {product.entity_name}
                        </p>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-brand-orange">
                            {product.interest_rate || '—'}%
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{t.perYear}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Details - Center */}
                  <div className="flex-1 p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {/* Amount */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Banknote className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t.amount}</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(product.min_amount)} - {formatCurrency(product.max_amount)}
                        </p>
                      </div>

                      {/* Term */}
                      {product.max_term_months && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t.term}</p>
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {product.max_term_months} {t.months}
                          </p>
                        </div>
                      )}

                      {/* Processing Time */}
                      {product.processing_time && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Processing</p>
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {product.processing_time}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions - Right Side */}
                  <div className="p-6 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-700/50 flex flex-col justify-center gap-3 lg:w-48">
                    <button
                      onClick={() => handleCompareToggle(product)}
                      disabled={!inComparison && !canAdd}
                      className={cn(
                        "px-4 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2",
                        inComparison
                          ? "bg-red-500 text-white hover:bg-red-600 shadow-lg"
                          : canAdd
                          ? "bg-brand-orange/10 text-brand-orange hover:bg-brand-orange hover:text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                      )}
                      title={!canAdd && !inComparison ? t.maxCompareReached : ''}
                    >
                      {inComparison ? (
                        <>
                          <Check className="w-4 h-4" />
                          {t.removeFromCompare}
                        </>
                      ) : (
                        <>
                          <Scale className="w-4 h-4" />
                          {t.addToCompare}
                        </>
                      )}
                    </button>

                    <Link
                      href={`/${locale}/sirketler/kredit-teskilatlari/${creditType}/${product.entity_id}`}
                      className="px-4 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-xl font-medium hover:bg-black dark:hover:bg-gray-600 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {t.viewDetails}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}