import { Metadata } from 'next';
import NewsDetailClient from './NewsDetailClient';

type Props = {
  params: Promise<{ lang: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = lang || 'az';
  
  try {
    // Fetch news data for metadata
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${locale}/xeberler/${slug}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      return {
        title: 'News Not Found | Kredit.az',
        description: 'The requested news article could not be found.'
      };
    }
    
    const data = await response.json();
    const news = data.data;
    
    const title = news.seo_title || news.title;
    const description = news.seo_description || news.title;
    const keywords = news.seo_keywords || news.hashtags?.join(', ') || '';
    
    return {
      metadataBase: new URL('https://kredit.az'),
      title: `${title} | Kredit.az`,
      description,
      keywords,
      authors: news.author ? [{ name: news.author }] : undefined,
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: news.publish_date,
        authors: news.author ? [news.author] : undefined,
        locale: locale === 'az' ? 'az_AZ' : locale === 'ru' ? 'ru_RU' : 'en_US',
        url: `https://kredit.az/${locale}/xeberler/${slug}`,
        siteName: 'Kredit.az',
        images: news.thumbnail_image ? [
          {
            url: news.thumbnail_image,
            width: 1200,
            height: 630,
            alt: news.title,
          }
        ] : [
          {
            url: '/og-news.jpg',
            width: 1200,
            height: 630,
            alt: 'Kredit.az - News',
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: news.thumbnail_image ? [news.thumbnail_image] : ['/og-news.jpg'],
        creator: news.author || '@kreditaz',
      },
      alternates: {
        canonical: `https://kredit.az/${locale}/xeberler/${slug}`,
        languages: {
          'az': `https://kredit.az/az/xeberler/${slug}`,
          'en': `https://kredit.az/en/xeberler/${slug}`,
          'ru': `https://kredit.az/ru/xeberler/${slug}`,
        }
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching news for metadata:', error);
    return {
      title: 'News | Kredit.az',
      description: 'Latest financial and business news from Azerbaijan'
    };
  }
}

export default async function NewsDetailPage({ params }: Props) {
  const { lang, slug } = await params;
  
  // Optionally fetch initial data for better SSR
  let initialData = null;
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${lang}/xeberler/${slug}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (response.ok) {
      const data = await response.json();
      initialData = data.data;
    }
  } catch (error) {
    console.error('Error fetching initial news data:', error);
  }
  
  return <NewsDetailClient params={{ lang, slug }} initialData={initialData} />;
}