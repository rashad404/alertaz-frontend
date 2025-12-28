'use client';

import { useEffect, useState, use } from "react";
import { Link } from '@/lib/navigation';
import { BookOpen, CreditCard, Shield, PiggyBank, FileText, CheckCircle, Clock, Loader2 } from "lucide-react";
import { useDictionary } from "@/providers/dictionary-provider";

interface Guide {
  id: number;
  title: string;
  description: string;
  slug: string;
  read_time: number;
  difficulty: string;
  is_featured: boolean;
  views: number;
}

const categoryIcons: Record<string, any> = {
  loans: CreditCard,
  insurance: Shield,
  banking: PiggyBank,
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  intermediate: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  advanced: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

export default function GuidesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = use(params);
  const dictionary = useDictionary();
  const [guides, setGuides] = useState<Record<string, Guide[]>>({});
  const [popular, setPopular] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGuides() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${resolvedParams.lang}/guides`, {
          headers: {
            'Accept-Language': resolvedParams.lang,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch guides');
        }
        
        const data = await response.json();
        setGuides(data.guides || {});
        setPopular(data.popular || []);
      } catch (error) {
        console.error('Error fetching guides:', error);
        setGuides({});
        setPopular([]);
      } finally {
        setLoading(false);
      }
    }

    fetchGuides();
  }, [resolvedParams.lang]);

  // Format views
  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF6021] mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading guides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#FF6021] to-[#E54500] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold mb-4">
            {dictionary.guides || "Guides"}
          </h1>
          <p className="text-xl opacity-90 max-w-3xl">
            {dictionary.guidesHero || "Step-by-step guides to help you navigate financial services in Azerbaijan. From loan applications to insurance claims."}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {Object.entries(guides).map(([category, categoryGuides]: [string, any]) => {
              const Icon = categoryIcons[category] || BookOpen;
              return (
                <div key={category} className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <Icon className="w-6 h-6 text-[#FF6021]" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                      {dictionary.guideCategories?.[category] || category}
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {categoryGuides.map((guide: any) => (
                      <div
                        key={guide.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {guide.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              {guide.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
                                <Clock className="w-4 h-4" />
                                {guide.read_time} {dictionary.min || "min"}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                difficultyColors[guide.difficulty] || difficultyColors.beginner
                              }`}>
                                {dictionary.difficulty?.[guide.difficulty] || guide.difficulty}
                              </span>
                              {guide.is_featured && (
                                <span className="px-2 py-1 bg-[#FF6021]/10 text-[#FF6021] rounded-full text-xs">
                                  {dictionary.featured || "Featured"}
                                </span>
                              )}
                            </div>
                          </div>
                          <Link
                            href={`/${resolvedParams.lang}/guides/${guide.slug}`}
                            className="ml-4 px-4 py-2 bg-[#FF6021] hover:bg-[#E54500] text-white font-medium rounded-lg transition-colors"
                          >
                            {dictionary.readGuide || "Read"}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Popular Guides */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {dictionary.popularGuides?.title || "Popular Guides"}
              </h3>
              <div className="space-y-3">
                {popular.map((guide: any) => (
                  <Link
                    key={guide.id}
                    href={`/${resolvedParams.lang}/guides/${guide.slug}`}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {guide.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {formatViews(guide.views)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-[#FF6021] to-[#E54500] text-white rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                {dictionary.quickTips?.title || "Quick Tips"}
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    {dictionary.quickTips?.tip1 || "Always compare multiple offers before making a decision"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    {dictionary.quickTips?.tip2 || "Read all terms and conditions carefully"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    {dictionary.quickTips?.tip3 || "Keep all financial documents organized"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    {dictionary.quickTips?.tip4 || "Never share your banking passwords"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}