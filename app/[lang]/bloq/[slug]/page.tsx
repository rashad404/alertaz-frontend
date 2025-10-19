import { Metadata } from "next";
import { Locale } from "@/i18n-config";
import { notFound } from "next/navigation";
import BlogArticleClient from "./BlogArticleClient";
import apiClient from "@/lib/api/client";

interface BlogArticlePageProps {
  params: Promise<{ lang: Locale; slug: string }>;
}

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  
  try {
    const response = await apiClient.get(`/${lang}/blogs/${slug}`);
    const blog = response.data.data;
    
    return {
      title: blog.seo_title || blog.title,
      description: blog.seo_description || blog.excerpt,
      keywords: blog.seo_keywords,
      openGraph: {
        title: blog.title,
        description: blog.excerpt,
        images: blog.featured_image ? [blog.featured_image] : [],
      },
    };
  } catch (error) {
    return {
      title: "Blog Article - Kredit.az",
      description: "Read our financial blog articles",
    };
  }
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { lang, slug } = await params;
  
  try {
    const response = await apiClient.get(`/${lang}/blogs/${slug}`);
    const blog = response.data.data;
    
    return <BlogArticleClient locale={lang} blog={blog} slug={slug} />;
  } catch (error) {
    notFound();
  }
}