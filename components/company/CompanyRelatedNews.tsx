'use client';

import { Link } from '@/lib/navigation';
import { NewsCard } from '@/components/ui/news-card';
import apiClient from '@/lib/api/client';
import { Newspaper, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CompanyRelatedNewsProps {
  companyId: number;
  locale: string;
}

export default function CompanyRelatedNews({ companyId, locale }: CompanyRelatedNewsProps) {
  const [relatedNews, setRelatedNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedNews = async () => {
      try {
        // First try to fetch news by company_id
        let response = await apiClient.get(`/xeberler`, {
          params: {
            company_id: companyId,
            per_page: 4
          }
        });
        
        let newsData = response.data?.data || [];
        
        // If no news with company_id, fetch latest news as fallback
        if (newsData.length === 0) {
          response = await apiClient.get(`/xeberler`, {
            params: {
              per_page: 4
            }
          });
          newsData = response.data?.data || [];
        }
        
        setRelatedNews(newsData);
      } catch (error) {
        console.error('Error fetching related news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedNews();
  }, [companyId, locale]);
  
  if (loading) {
    return (
      <div className="mt-8 bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
        <div className="flex justify-center items-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
        </div>
      </div>
    );
  }

  if (relatedNews.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-brand-orange" />
          {locale === 'az' ? 'Əlaqəli Xəbərlər' : locale === 'ru' ? 'Связанные новости' : 'Related News'}
        </h2>
        <Link 
          href={`/xeberler`}
          className="text-brand-orange hover:text-brand-orange-dark transition-colors text-sm font-medium flex items-center gap-1"
        >
          {locale === 'az' ? 'Bütün xəbərlər' : locale === 'ru' ? 'Все новости' : 'All news'}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      
      {/* 2 column layout on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relatedNews.slice(0, 4).map((news: any) => (
          <NewsCard
            key={news.id}
            news={news}
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
}