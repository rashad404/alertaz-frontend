'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Search, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Link } from '@/lib/navigation';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

interface FaqPageContent {
  id: number;
  title: string;
  description: string;
  image?: string;
  image_alt_text?: string;
}

const FaqPage = () => {
  const params = useParams();
  const locale = params.lang || 'az';
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  // Fetch FAQ items
  const { data: faqData, isLoading: faqLoading } = useQuery({
    queryKey: ['faqs', locale],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/faq`);
      return response.data.data as FaqItem[];
    }
  });

  // Fetch FAQ page content
  const { data: pageContent, isLoading: pageLoading } = useQuery({
    queryKey: ['faqPageContent', locale],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/faq/page-content`);
      return response.data.data as FaqPageContent;
    }
  });

  // Filter FAQs based on search
  const filteredFaqs = faqData?.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Toggle FAQ item expansion
  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Expand all / Collapse all
  const expandAll = () => {
    setExpandedItems(filteredFaqs.map(faq => faq.id));
  };

  const collapseAll = () => {
    setExpandedItems([]);
  };

  // Translations
  const translations = {
    az: {
      breadcrumbHome: 'Ana səhifə',
      breadcrumbCurrent: 'Tez-tez verilən suallar',
      searchPlaceholder: 'Sual axtar...',
      expandAll: 'Hamısını aç',
      collapseAll: 'Hamısını bağla',
      noResults: 'Heç bir nəticə tapılmadı',
      loading: 'Yüklənir...',
      contactPrompt: 'Sualınızın cavabını tapa bilmədinizsə?',
      contactButton: 'Bizimlə əlaqə saxlayın',
      foundQuestions: 'sual tapıldı'
    },
    en: {
      breadcrumbHome: 'Home',
      breadcrumbCurrent: 'FAQ',
      searchPlaceholder: 'Search questions...',
      expandAll: 'Expand all',
      collapseAll: 'Collapse all',
      noResults: 'No results found',
      loading: 'Loading...',
      contactPrompt: "Couldn't find an answer to your question?",
      contactButton: 'Contact us',
      foundQuestions: 'questions found'
    },
    ru: {
      breadcrumbHome: 'Главная',
      breadcrumbCurrent: 'Часто задаваемые вопросы',
      searchPlaceholder: 'Поиск вопросов...',
      expandAll: 'Развернуть все',
      collapseAll: 'Свернуть все',
      noResults: 'Результатов не найдено',
      loading: 'Загрузка...',
      contactPrompt: 'Не нашли ответ на свой вопрос?',
      contactButton: 'Свяжитесь с нами',
      foundQuestions: 'вопросов найдено'
    }
  };

  const t = translations[locale as keyof typeof translations] || translations.az;

  if (faqLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
          <span className="text-gray-900 dark:text-white">{t.loading}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header with title and breadcrumb */}
      <div className="bg-gray-50 dark:bg-gray-800 py-12">
        <div className="flex justify-center items-center px-4 md:px-36">
          <div className="flex w-full max-w-5xl justify-between items-center">
            <div>
              <h1 className="text-black dark:text-white text-3xl md:text-5xl font-bold mb-2">
                {pageContent?.title || t.breadcrumbCurrent}
              </h1>
              {pageContent?.description && (
                <p className="text-gray-600 dark:text-gray-400 text-lg mt-4 max-w-3xl">
                  {pageContent.description}
                </p>
              )}
            </div>
            <div className="hidden md:flex items-center gap-1">
              <Link href={"/" className="text-black dark:text-gray-300 hover:text-brand-orange dark:hover:text-brand-orange transition-colors">
                {t.breadcrumbHome}
              </Link>
              <span className="mx-2 text-gray-600 dark:text-gray-400">›</span>
              <span className="text-brand-orange underline">
                {t.breadcrumbCurrent}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col justify-center items-center gap-8 py-12 px-4 md:px-36">
        <div className="w-full max-w-4xl">
          
          {/* Search and Controls */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:border-brand-orange dark:focus:border-brand-orange"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={expandAll}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 transition-colors"
                >
                  {t.expandAll}
                </button>
                <button
                  onClick={collapseAll}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 transition-colors"
                >
                  {t.collapseAll}
                </button>
              </div>
            </div>
            
            {searchQuery && (
              <p className="text-gray-600 dark:text-gray-400">
                {filteredFaqs.length} {t.foundQuestions}
              </p>
            )}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">{t.noResults}</p>
              </div>
            ) : (
              filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg dark:hover:shadow-2xl bg-white dark:bg-gray-800"
                >
                  <button
                    onClick={() => toggleExpanded(faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white pr-4">
                      {faq.question}
                    </h3>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform flex-shrink-0 ${
                        expandedItems.includes(faq.id) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      expandedItems.includes(faq.id)
                        ? 'max-h-96 opacity-100'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-4 pt-2">
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl text-center">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t.contactPrompt}</h3>
            <Link
              href={`/elaqe`}
              className="inline-flex items-center px-8 py-3 bg-brand-orange text-white rounded-lg hover:bg-brand-orange-dark transition-colors"
            >
              {t.contactButton}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;