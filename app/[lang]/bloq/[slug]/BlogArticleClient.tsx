"use client";

import { useQuery } from "@tanstack/react-query";
import { Link } from '@/lib/navigation';
import Image from "next/image";
import { Calendar, Clock, Eye, User, Tag, ArrowLeft, Share2, Facebook, Twitter } from "lucide-react";
import { format } from "date-fns";
import apiClient from "@/lib/api/client";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  author: string;
  tags: string[];
  reading_time: number;
  views: number;
  featured: boolean;
  published_at: string;
  seo_title: string;
  seo_keywords: string;
  seo_description: string;
}

interface BlogArticleClientProps {
  locale: string;
  blog: BlogPost;
  slug: string;
}

export default function BlogArticleClient({ locale, blog, slug }: BlogArticleClientProps) {
  const translations = {
    az: {
      backToBlog: "Bloqa qayıt",
      author: "Müəllif",
      readingTime: "dəqiqə oxuma müddəti",
      views: "baxış",
      share: "Paylaş",
      relatedArticles: "Oxşar məqalələr",
      readMore: "Ətraflı oxu",
      tags: "Etiketlər",
    },
    en: {
      backToBlog: "Back to Blog",
      author: "Author",
      readingTime: "min read",
      views: "views",
      share: "Share",
      relatedArticles: "Related Articles",
      readMore: "Read more",
      tags: "Tags",
    },
    ru: {
      backToBlog: "Вернуться к блогу",
      author: "Автор",
      readingTime: "мин чтения",
      views: "просмотров",
      share: "Поделиться",
      relatedArticles: "Похожие статьи",
      readMore: "Читать далее",
      tags: "Теги",
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.az;

  // Fetch related blogs
  const { data: relatedBlogs } = useQuery({
    queryKey: ["blogs", "related", locale, slug],
    queryFn: async () => {
      const response = await apiClient.get(`/blogs/${slug}/related`);
      return response.data as BlogPost[];
    },
  });

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = blog.title;
    
    switch (platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, "_blank");
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      {blog.featured_image && (
        <div className="relative h-96 bg-gray-200 dark:bg-gray-800">
          <Image
            src={blog.featured_image}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href={`/blog`}
            className="inline-flex items-center gap-2 text-brand-orange hover:text-brand-orange/80 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            {t.backToBlog}
          </Link>

          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 mb-6">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{format(new Date(blog.published_at), "dd.MM.yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{blog.reading_time} {t.readingTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>{blog.views} {t.views}</span>
              </div>
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Share Buttons */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">{t.share}:</span>
              <button
                onClick={() => handleShare("facebook")}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                aria-label="Share on Facebook"
              >
                <Facebook className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare("twitter")}
                className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                aria-label="Share on Twitter"
              >
                <Twitter className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare("copy")}
                className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                aria-label="Copy link"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Article Content */}
          <article className="prose prose-lg dark:prose-invert max-w-none mb-12">
            {blog.excerpt && (
              <div className="text-xl text-gray-600 dark:text-gray-400 mb-8 font-medium">
                {blog.excerpt}
              </div>
            )}
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </article>

          {/* Related Articles */}
          {relatedBlogs && relatedBlogs.length > 0 && (
            <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-2xl font-bold mb-6">{t.relatedArticles}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedBlogs.map((relatedBlog) => (
                  <Link
                    key={relatedBlog.id}
                    href={`/blog/${relatedBlog.slug}`}
                    className="group bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {relatedBlog.featured_image ? (
                      <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
                        <Image
                          src={relatedBlog.featured_image}
                          alt={relatedBlog.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        <div className="text-5xl text-gray-400">📄</div>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 group-hover:text-brand-orange transition-colors line-clamp-2">
                        {relatedBlog.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {relatedBlog.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {relatedBlog.reading_time} {t.readingTime}
                        </span>
                        <span className="text-brand-orange">{t.readMore} →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}