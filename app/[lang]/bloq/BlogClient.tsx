"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from '@/lib/navigation';
import Image from "next/image";
import { Calendar, Clock, Eye, Tag, ChevronRight, Search } from "lucide-react";
import { format } from "date-fns";
import apiClient from "@/lib/api/client";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  author: string;
  tags: string[];
  reading_time: number;
  views: number;
  featured: boolean;
  published_at: string;
}

interface BlogResponse {
  data: BlogPost[];
  current_page: number;
  last_page: number;
  total: number;
}

interface BlogClientProps {
  locale: string;
  initialTag?: string;
  initialPage?: string;
}

export default function BlogClient({ locale, initialTag, initialPage }: BlogClientProps) {
  const [selectedTag, setSelectedTag] = useState(initialTag || "");
  const [currentPage, setCurrentPage] = useState(Number(initialPage) || 1);
  const [searchQuery, setSearchQuery] = useState("");

  const translations = {
    az: {
      title: "Blog",
      subtitle: "Maliyyə dünyası haqqında faydalı məqalələr",
      featured: "Seçilmiş Məqalələr",
      allPosts: "Bütün Məqalələr",
      readMore: "Ətraflı oxu",
      author: "Müəllif",
      readingTime: "dəq oxuma",
      views: "baxış",
      tags: "Etiketlər",
      allTags: "Hamısı",
      search: "Məqalə axtar...",
      noResults: "Heç bir məqalə tapılmadı",
      previousPage: "Əvvəlki",
      nextPage: "Növbəti",
      page: "Səhifə",
    },
    en: {
      title: "Blog",
      subtitle: "Useful articles about the financial world",
      featured: "Featured Articles",
      allPosts: "All Posts",
      readMore: "Read more",
      author: "Author",
      readingTime: "min read",
      views: "views",
      tags: "Tags",
      allTags: "All",
      search: "Search articles...",
      noResults: "No articles found",
      previousPage: "Previous",
      nextPage: "Next",
      page: "Page",
    },
    ru: {
      title: "Блог",
      subtitle: "Полезные статьи о финансовом мире",
      featured: "Избранные статьи",
      allPosts: "Все статьи",
      readMore: "Читать далее",
      author: "Автор",
      readingTime: "мин чтения",
      views: "просмотров",
      tags: "Теги",
      allTags: "Все",
      search: "Поиск статей...",
      noResults: "Статьи не найдены",
      previousPage: "Предыдущая",
      nextPage: "Следующая",
      page: "Страница",
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.az;

  // Fetch featured blogs
  const { data: featuredBlogs } = useQuery({
    queryKey: ["blogs", "featured", locale],
    queryFn: async () => {
      const response = await apiClient.get(`/blogs/featured`);
      return response.data as BlogPost[];
    },
  });

  // Fetch all blogs
  const { data: blogsData, isLoading } = useQuery({
    queryKey: ["blogs", locale, selectedTag, currentPage, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        per_page: "9",
        page: currentPage.toString(),
      });
      
      if (selectedTag) {
        params.append("tag", selectedTag);
      }
      
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      
      const response = await apiClient.get(`/blogs?${params}`);
      return response.data as BlogResponse;
    },
  });

  // Fetch tags
  const { data: tags } = useQuery({
    queryKey: ["blogs", "tags", locale],
    queryFn: async () => {
      const response = await apiClient.get(`/blogs/tags`);
      return response.data as string[];
    },
  });

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">{t.subtitle}</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </form>
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">{t.tags}:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTagClick("")}
                className={`px-4 py-2 rounded-full transition-colors ${
                  !selectedTag
                    ? "bg-brand-orange text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {t.allTags}
              </button>
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    selectedTag === tag
                      ? "bg-brand-orange text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Tag className="inline-block w-3 h-3 mr-1" />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Featured Articles */}
        {featuredBlogs && featuredBlogs.length > 0 && !selectedTag && !searchQuery && currentPage === 1 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{t.featured}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  {blog.featured_image ? (
                    <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                      <Image
                        src={blog.featured_image}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-brand-orange/20 to-brand-orange/10 flex items-center justify-center">
                      <div className="text-6xl text-brand-orange/50">📝</div>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-brand-orange transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {blog.reading_time} {t.readingTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {blog.views}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Posts */}
        <div>
          <h2 className="text-2xl font-bold mb-6">{t.allPosts}</h2>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : blogsData && blogsData.data.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogsData.data.map((blog) => (
                  <article
                    key={blog.id}
                    className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <Link href={`/blog/${blog.slug}`} className="block">
                      {blog.featured_image ? (
                        <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                          <Image
                            src={blog.featured_image}
                            alt={blog.title}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                          <div className="text-6xl text-gray-400">📄</div>
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(blog.published_at), "dd.MM.yyyy")}
                          <span className="mx-2">•</span>
                          <span>{blog.author}</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 hover:text-brand-orange transition-colors">
                          {blog.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                          {blog.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {blog.reading_time} {t.readingTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {blog.views}
                            </span>
                          </div>
                          <span className="text-brand-orange flex items-center gap-1 hover:gap-2 transition-all">
                            {t.readMore}
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {blogsData.last_page > 1 && (
                <div className="mt-8 flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t.previousPage}
                  </button>
                  
                  <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                    {t.page} {currentPage} / {blogsData.last_page}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(blogsData.last_page, currentPage + 1))}
                    disabled={currentPage === blogsData.last_page}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t.nextPage}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">{t.noResults}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}