'use client';

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Clock, Eye, ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { useDictionary } from "@/providers/dictionary-provider";
import { notFound } from "next/navigation";

interface Guide {
  id: number;
  title: string;
  content: string;
  slug: string;
  read_time: number;
  difficulty: string;
  is_featured: boolean;
  views: number;
  category: string;
  created_at: string;
}


const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  intermediate: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  advanced: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

export default function GuideDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const resolvedParams = use(params);
  const dictionary = useDictionary();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [relatedGuides, setRelatedGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    async function fetchGuideData() {
      try {
        // Fetch main guide
        const guideResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${resolvedParams.lang}/guides/${resolvedParams.slug}`, {
          headers: {
            'Accept-Language': resolvedParams.lang,
          },
        });
        
        if (!guideResponse.ok) {
          if (guideResponse.status === 404) {
            setNotFoundError(true);
            return;
          }
          throw new Error('Failed to fetch guide');
        }
        
        const guideData = await guideResponse.json();
        setGuide(guideData);

        // Fetch related guides
        if (guideData.category) {
          try {
            const relatedResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${resolvedParams.lang}/guides/category/${guideData.category}`, {
              headers: {
                'Accept-Language': resolvedParams.lang,
              },
            });
            
            if (relatedResponse.ok) {
              const related = await relatedResponse.json();
              setRelatedGuides(related.filter((g: Guide) => g.slug !== resolvedParams.slug).slice(0, 3));
            }
          } catch (error) {
            console.error('Error fetching related guides:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching guide:', error);
        setNotFoundError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchGuideData();
  }, [resolvedParams.lang, resolvedParams.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF6021] mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading guide...</p>
        </div>
      </div>
    );
  }

  if (notFoundError || !guide) {
    notFound();
  }
  
  // Format views
  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };
  
  // Render markdown-like content
  const renderContent = (content: string) => {
    // First, replace escaped newlines with actual newlines
    const processedContent = content.replace(/\\n/g, '\n');
    // Split content by lines
    const lines = processedContent.split('\n');
    const elements = [];
    let currentList: string[] = [];
    let listType: 'ul' | 'ol' | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for headers
      if (line.startsWith('## ')) {
        // Close any open list
        if (currentList.length > 0 && listType) {
          elements.push(
            listType === 'ul' ? (
              <ul key={`list-${i}`} className="list-disc list-inside space-y-2 mb-4">
                {currentList.map((item, idx) => (
                  <li key={idx} className="text-gray-600 dark:text-gray-400">{item}</li>
                ))}
              </ul>
            ) : (
              <ol key={`list-${i}`} className="list-decimal list-inside space-y-2 mb-4">
                {currentList.map((item, idx) => (
                  <li key={idx} className="text-gray-600 dark:text-gray-400">{item}</li>
                ))}
              </ol>
            )
          );
          currentList = [];
          listType = null;
        }
        
        elements.push(
          <h2 key={`h2-${i}`} className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${i}`} className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('- ')) {
        // Unordered list item
        listType = 'ul';
        currentList.push(line.replace('- ', ''));
      } else if (line.match(/^\d+\. /)) {
        // Ordered list item
        listType = 'ol';
        currentList.push(line.replace(/^\d+\. /, ''));
      } else if (line.trim() === '') {
        // Empty line - close any open list
        if (currentList.length > 0 && listType) {
          elements.push(
            listType === 'ul' ? (
              <ul key={`list-${i}`} className="list-disc list-inside space-y-2 mb-4">
                {currentList.map((item, idx) => (
                  <li key={idx} className="text-gray-600 dark:text-gray-400">{item}</li>
                ))}
              </ul>
            ) : (
              <ol key={`list-${i}`} className="list-decimal list-inside space-y-2 mb-4">
                {currentList.map((item, idx) => (
                  <li key={idx} className="text-gray-600 dark:text-gray-400">{item}</li>
                ))}
              </ol>
            )
          );
          currentList = [];
          listType = null;
        }
      } else if (line.trim()) {
        // Regular paragraph
        elements.push(
          <p key={`p-${i}`} className="text-gray-600 dark:text-gray-400 mb-4">
            {line}
          </p>
        );
      }
    }
    
    // Close any remaining list
    if (currentList.length > 0 && listType) {
      elements.push(
        listType === 'ul' ? (
          <ul key={`list-end`} className="list-disc list-inside space-y-2 mb-4">
            {currentList.map((item, idx) => (
              <li key={idx} className="text-gray-600 dark:text-gray-400">{item}</li>
            ))}
          </ul>
        ) : (
          <ol key={`list-end`} className="list-decimal list-inside space-y-2 mb-4">
            {currentList.map((item, idx) => (
              <li key={idx} className="text-gray-600 dark:text-gray-400">{item}</li>
            ))}
          </ol>
        )
      );
    }
    
    return elements;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href={`/${resolvedParams.lang}`} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              {"Home"}
            </Link>
            <span className="text-gray-400">/</span>
            <Link href={`/${resolvedParams.lang}/guides`} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              {dictionary.guides || "Guides"}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 dark:text-white capitalize">{guide.category}</span>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {guide.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              {guide.description}
            </p>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
                <Clock className="w-4 h-4" />
                {guide.read_time} {dictionary.minRead || "min read"}
              </span>
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
                <Eye className="w-4 h-4" />
                {formatViews(guide.views)} {dictionary.views || "views"}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                difficultyColors[guide.difficulty] || difficultyColors.beginner
              }`}>
                {dictionary.difficulty?.[guide.difficulty] || guide.difficulty}
              </span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs capitalize">
                {dictionary.guideCategories?.[guide.category] || guide.category}
              </span>
            </div>
          </div>
          
          {/* Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            {renderContent(guide.content)}
          </div>
        </article>
        
        {/* Related Guides */}
        {relatedGuides.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {dictionary.relatedGuides || "Related Guides"}
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedGuides.map((related: any) => (
                <Link
                  key={related.id}
                  href={`/${resolvedParams.lang}/guides/${related.slug}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {related.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {related.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {related.read_time} min
                    </span>
                    <span className={`px-2 py-0.5 rounded-full ${
                      difficultyColors[related.difficulty] || difficultyColors.beginner
                    }`}>
                      {dictionary.difficulty?.[related.difficulty] || related.difficulty}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Back to Guides */}
        <div className="mt-12">
          <Link
            href={`/${resolvedParams.lang}/guides`}
            className="inline-flex items-center gap-2 text-[#FF6021] hover:text-[#E54500] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {dictionary.backToGuides || "Back to Guides"}
          </Link>
        </div>
      </div>
    </div>
  );
}