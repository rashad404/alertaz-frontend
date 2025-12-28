"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { Link } from '@/lib/navigation';
import { ChevronRight, Filter, X } from "lucide-react";
import { useDictionary } from "@/providers/dictionary-provider";

interface Credit {
  id: number;
  slug: string;
  bank_name: string;
  credit_name: string;
  credit_image: string | null;
  about: string;
  credit_type: string;
  credit_amount: number;
  credit_amount_formatted: string;
  min_amount: number;
  min_amount_formatted: string;
  max_amount: number;
  max_amount_formatted: string;
  credit_term: number;
  credit_term_formatted: string;
  min_term_months: number;
  max_term_months: number;
  interest_rate: number;
  interest_rate_formatted: string;
  commission_rate: number;
  guarantor: string;
  collateral: string;
  method_of_purchase: string;
  description: string;
  bank_phone: string;
  bank_address: string;
  views: number;
  monthly_payment: number;
}

export function CreditCategoryClient({ 
  params, 
  category 
}: { 
  params: { lang: string };
  category: "cash" | "cards" | "auto" | "mortgage" | "business";
}) {
  const dictionary = useDictionary();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    amount: 5000,
    duration: 12,
    bankId: null as number | null,
  });

  const categoryTitles = {
    cash: dictionary.nav?.creditTypes?.cash || "Cash Credit",
    cards: dictionary.nav?.creditTypes?.cards || "Credit Cards",
    auto: dictionary.nav?.creditTypes?.auto || "Auto Credit",
    mortgage: dictionary.nav?.creditTypes?.mortgage || "Mortgage",
    business: dictionary.nav?.creditTypes?.business || "Business Credit",
  };

  // Fetch credits for this category
  // Now we use the slug directly since the API expects the slug
  const { data: credits, isLoading } = useQuery({
    queryKey: ["credits", category, params.lang],
    queryFn: async () => {
      const response = await apiClient.get(
        `/${params.lang}/credits?type=${category}`
      );
      // The API returns { credits: { data: [...], ... }, filters: {...} }
      return response.data.credits?.data || [];
    },
  });

  // Fetch banks for filter
  const { data: banks } = useQuery({
    queryKey: ["banks", params.lang],
    queryFn: async () => {
      const response = await apiClient.get(
        `/${params.lang}/banks`
      );
      // Parse bank names from JSON strings
      return response.data.data.map((bank: any) => {
        let parsedName = bank.name;
        try {
          const nameObj = JSON.parse(bank.name);
          parsedName = nameObj[params.lang] || nameObj.en || bank.name;
        } catch (e) {
          // If parsing fails, use the original name
        }
        return {
          ...bank,
          displayName: parsedName
        };
      });
    },
  });

  const filteredCredits = credits?.filter(credit => {
    // Filter by bank name instead of bank ID for now
    if (filters.bankId) {
      const selectedBank = banks?.find((b: any) => b.id === filters.bankId);
      if (selectedBank && credit.bank_name !== selectedBank.displayName && credit.bank_name !== selectedBank.short_name) return false;
    }
    if (filters.amount < credit.min_amount || filters.amount > credit.max_amount) return false;
    if (filters.duration < credit.min_term_months || filters.duration > credit.max_term_months) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6021]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href={`/${params.lang}`} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              {dictionary.breadcrumb?.home || "Home"}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href={`/${params.lang}/credits`} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              {dictionary.nav?.credits || "Credits"}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium">
              {categoryTitles[category]}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {categoryTitles[category]}
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <Filter className="w-5 h-5" />
            {dictionary.common?.filter || "Filter"}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'fixed inset-0 z-50 lg:relative lg:inset-auto' : 'hidden lg:block'} lg:w-64`}>
            <div className="bg-white dark:bg-gray-800 h-full lg:rounded-lg p-6 lg:p-6">
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h2 className="text-lg font-semibold">{dictionary.common?.filters || "Filters"}</h2>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Amount Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {dictionary.common?.amount || "Amount"}: {filters.amount} AZN
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="50000"
                    step="500"
                    value={filters.amount}
                    onChange={(e) => setFilters({ ...filters, amount: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Duration Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {dictionary.common?.duration || "Duration"}: {filters.duration} {dictionary.common?.months || "months"}
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="60"
                    step="3"
                    value={filters.duration}
                    onChange={(e) => setFilters({ ...filters, duration: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Bank Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {dictionary.common?.bank || "Bank"}
                  </label>
                  <select
                    value={filters.bankId || ""}
                    onChange={(e) => setFilters({ ...filters, bankId: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{dictionary.common?.allBanks || "All Banks"}</option>
                    {banks?.map((bank: any) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Credits List */}
          <div className="flex-1">
            <div className="grid gap-6">
              {filteredCredits?.map((credit) => (
                <div
                  key={credit.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        {credit.credit_image && (
                          <img
                            src={credit.credit_image}
                            alt={credit.bank_name}
                            className="w-16 h-16 object-contain"
                          />
                        )}
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {credit.credit_name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {credit.bank_name}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{dictionary.common?.amount || "Amount"}</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {credit.min_amount_formatted} - {credit.max_amount_formatted}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{dictionary.common?.duration || "Duration"}</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {credit.credit_term_formatted}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{dictionary.offer?.annualRate || "Interest Rate"}</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {credit.interest_rate_formatted}
                          </p>
                        </div>
                        {credit.monthly_payment && (
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{dictionary.offer?.monthlyPayment || "Monthly Payment"}</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {credit.monthly_payment} AZN
                            </p>
                          </div>
                        )}
                      </div>

                      {credit.about && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {credit.about}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/${params.lang}/credits/${category}/${credit.slug}`}
                      className="ml-4 px-6 py-3 bg-[#FF6021] hover:bg-[#E54500] text-white font-medium rounded-lg transition-colors"
                    >
                      {dictionary.offer?.details || "Details"}
                    </Link>
                  </div>
                </div>
              ))}

              {(!filteredCredits || filteredCredits.length === 0) && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    {dictionary.common?.noCreditsFound || "No credits found matching your criteria"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}