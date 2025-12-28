"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from '@/lib/navigation';
import Image from "next/image";
import { homeApi, newsApi } from "@/lib/api/endpoints";
import { getTranslation, getImageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  locale: string;
}

export function HeroSection({ locale }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentNewsSlide, setCurrentNewsSlide] = useState(0);
  const [newsImageError, setNewsImageError] = useState(false);
  const [bannerImageError, setBannerImageError] = useState(false);
  const [adImageError, setAdImageError] = useState(false);
  
  // Touch/drag state
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const minSwipeDistance = 50;
  
  // Timer refs for auto-rotation
  const newsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bannerTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch slider banners
  const { data: banners } = useQuery({
    queryKey: ["home-slider-banners", locale],
    queryFn: () => homeApi.getSliderBanners(locale),
  });

  // Fetch slider news
  const { data: sliderNews } = useQuery({
    queryKey: ["home-slider-news", locale],
    queryFn: () => homeApi.getSliderNews(locale),
  });

  // Fetch home ads
  const { data: homeAds } = useQuery({
    queryKey: ["home-ads", locale],
    queryFn: () => homeApi.getAds(locale),
  });

  // Swipe handlers for banner
  const onBannerTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onBannerTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onBannerTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    const bannersArray = banners?.data?.data || banners?.data || [];
    
    if (isLeftSwipe && bannersArray.length > 1) {
      setCurrentSlide((prev) => (prev + 1) % bannersArray.length);
      setBannerImageError(false);
    }
    if (isRightSwipe && bannersArray.length > 1) {
      setCurrentSlide((prev) => (prev - 1 + bannersArray.length) % bannersArray.length);
      setBannerImageError(false);
    }
  };

  // Mouse drag handlers for banner
  const onBannerMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setTouchStart(e.clientX);
  };

  const onBannerMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTouchEnd(e.clientX);
  };

  const onBannerMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    const bannersArray = banners?.data?.data || banners?.data || [];
    
    if (isLeftSwipe && bannersArray.length > 1) {
      setCurrentSlide((prev) => (prev + 1) % bannersArray.length);
      setBannerImageError(false);
    }
    if (isRightSwipe && bannersArray.length > 1) {
      setCurrentSlide((prev) => (prev - 1 + bannersArray.length) % bannersArray.length);
      setBannerImageError(false);
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Swipe handlers for news
  const onNewsTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onNewsTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onNewsTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && sliderNews?.data?.length > 1) {
      setCurrentNewsSlide((prev) => (prev + 1) % sliderNews.data.length);
      setNewsImageError(false);
      // Reset the auto-rotation timer
      if (newsTimerRef.current) {
        clearInterval(newsTimerRef.current);
        newsTimerRef.current = null;
      }
    }
    if (isRightSwipe && sliderNews?.data?.length > 1) {
      setCurrentNewsSlide((prev) => (prev - 1 + sliderNews.data.length) % sliderNews.data.length);
      setNewsImageError(false);
      // Reset the auto-rotation timer
      if (newsTimerRef.current) {
        clearInterval(newsTimerRef.current);
        newsTimerRef.current = null;
      }
    }
  };

  // Mouse drag handlers for news
  const onNewsMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setTouchStart(e.clientX);
  };

  const onNewsMouseMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) return;
    setTouchEnd(e.clientX);
  };

  const onNewsMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) return;
    setIsDragging(false);
    
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && sliderNews?.data?.length > 1) {
      setCurrentNewsSlide((prev) => (prev + 1) % sliderNews.data.length);
      setNewsImageError(false);
      // Reset the auto-rotation timer
      if (newsTimerRef.current) {
        clearInterval(newsTimerRef.current);
        newsTimerRef.current = null;
      }
    }
    if (isRightSwipe && sliderNews?.data?.length > 1) {
      setCurrentNewsSlide((prev) => (prev - 1 + sliderNews.data.length) % sliderNews.data.length);
      setNewsImageError(false);
      // Reset the auto-rotation timer
      if (newsTimerRef.current) {
        clearInterval(newsTimerRef.current);
        newsTimerRef.current = null;
      }
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Auto-rotate banners
  useEffect(() => {
    const bannersArray = banners?.data?.data || banners?.data || [];
    if (!bannersArray || bannersArray.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % bannersArray.length;
        return isNaN(next) ? 0 : next;
      });
      setBannerImageError(false); // Reset error state when changing slides
    }, 5000);

    return () => clearInterval(interval);
  }, [banners]);

  // Auto-rotate news with reset capability
  useEffect(() => {
    if (!sliderNews?.data || sliderNews.data.length <= 1) return;
    
    // Function to start/restart the timer
    const startNewsTimer = () => {
      // Clear existing timer if any
      if (newsTimerRef.current) {
        clearInterval(newsTimerRef.current);
      }
      
      // Start new timer
      newsTimerRef.current = setInterval(() => {
        setCurrentNewsSlide((prev) => (prev + 1) % sliderNews.data.length);
        setNewsImageError(false);
      }, 6000); // Changed to 6 seconds as requested
    };
    
    // Start initial timer
    startNewsTimer();
    
    // Cleanup
    return () => {
      if (newsTimerRef.current) {
        clearInterval(newsTimerRef.current);
      }
    };
  }, [sliderNews, currentNewsSlide]); // Added currentNewsSlide to dependencies to restart timer on manual change

  const bannersData = banners?.data?.data || banners?.data || [];
  const currentBanner = bannersData[currentSlide] || bannersData[0];
  const currentNewsItem = sliderNews?.data?.[currentNewsSlide];
  const currentNews = currentNewsItem?.news || currentNewsItem; // Handle both old and new API formats
  
  // Find the ad for hero section placement
  // Handle both possible response structures
  let adsArray = [];
  if (homeAds?.data) {
    if (Array.isArray(homeAds.data)) {
      adsArray = homeAds.data;
    } else if (homeAds.data.data && Array.isArray(homeAds.data.data)) {
      adsArray = homeAds.data.data;
    }
  }
  
  const mainAd = adsArray.find((ad: any) => ad.place === 'hero_section' && ad.is_active !== false) || 
                  adsArray.find((ad: any) => ad.place === 'home_slider' && ad.is_active !== false) ||
                  adsArray[0]; // Fallback to first ad if no specific placement found

  // Check if there are any active banners
  const hasActiveBanners = bannersData.length > 0 && bannersData.some((banner: any) => banner.is_active !== false);

  return (
    <div className="py-2">
      {/* Main Banner - Full Width - Only show if there are active banners */}
      {hasActiveBanners && (
        <div className="mb-8">
          <div 
          className="relative rounded-xl bg-[#EFEFFD] overflow-hidden h-80 select-none"
          onTouchStart={onBannerTouchStart}
          onTouchMove={onBannerTouchMove}
          onTouchEnd={onBannerTouchEnd}
          onMouseDown={onBannerMouseDown}
          onMouseMove={onBannerMouseMove}
          onMouseUp={onBannerMouseUp}
          onMouseLeave={() => setIsDragging(false)}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            <div className="absolute inset-0">
              <div className="absolute top-6 right-48 w-36 h-30 rounded-full bg-bg-light-orange opacity-60"></div>
              <div className="absolute bottom-0 left-1/3 w-16 h-14 rounded-full bg-bg-light-blue opacity-60"></div>
            </div>
            <div className="relative h-full flex items-center px-8 lg:px-11">
              <div className="flex-1">
                {currentBanner ? (
                  <h1 className="text-2xl lg:text-3xl font-medium leading-tight mb-6 lg:mb-8">
                    <span className="text-brand-orange font-bold">
                      {getTranslation(currentBanner.title, locale).split('\n')[0]}
                    </span>
                    <br />
                    <span className="text-black dark:text-white">
                      {getTranslation(currentBanner.title, locale).split('\n')[1]}
                    </span>
                  </h1>
                ) : (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                )}
                {currentBanner?.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {getTranslation(currentBanner.description, locale)}
                  </p>
                )}
                {currentBanner?.link && (
                  currentBanner.link.startsWith('http') ? (
                    <a
                      href={currentBanner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 bg-brand-orange hover:bg-brand-orange-dark text-white px-5 py-3 rounded-lg transition-colors"
                    >
                      <span className="font-medium">
                        {getTranslation(currentBanner?.link_text || { az: "Fürsəti dəyərləndir", en: "Take advantage", ru: "Воспользоваться возможностью" }, locale)}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <Link
                      href={currentBanner.link}
                      className="inline-flex items-center space-x-2 bg-brand-orange hover:bg-brand-orange-dark text-white px-5 py-3 rounded-lg transition-colors"
                    >
                      <span className="font-medium">
                        {getTranslation(currentBanner?.link_text || { az: "Fürsəti dəyərləndir", en: "Take advantage", ru: "Воспользоваться возможностью" }, locale)}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )
                )}
              </div>
              <div className="hidden lg:block flex-shrink-0 ml-6">
                {currentBanner?.image ? (
                  <img
                    src={bannerImageError ? "/news-placeholder.svg" : currentBanner.image}
                    alt={getTranslation(currentBanner.title, locale)}
                    className="h-64 w-auto object-contain"
                    onError={() => setBannerImageError(true)}
                  />
                ) : (
                  <div className="w-64 h-64 bg-gray-200 animate-pulse rounded"></div>
                )}
              </div>
            </div>
            
            {/* Banner dots */}
            {bannersData?.length > 1 && (
              <div className="absolute bottom-6 left-11 flex items-center space-x-2">
                {bannersData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={cn(
                      "w-3 h-3 rounded-full transition-colors",
                      index === currentSlide ? "bg-brand-orange" : "bg-gray-400"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* News and Ad Grid */}
      <div className={`grid grid-cols-1 ${mainAd ? 'lg:grid-cols-12' : ''} gap-4 mb-8`}>
        {/* Featured News */}
        <div className={mainAd ? 'lg:col-span-8' : ''}>
          {currentNews ? (
            <Link href={`/xeberler/${currentNews.slug}`} className="block">
              <div 
                className="relative rounded-xl overflow-hidden bg-gray-100 h-80 cursor-pointer group select-none"
                onTouchStart={onNewsTouchStart}
                onTouchMove={onNewsTouchMove}
                onTouchEnd={onNewsTouchEnd}
                onMouseDown={onNewsMouseDown}
                onMouseMove={onNewsMouseMove}
                onMouseUp={onNewsMouseUp}
                onMouseLeave={() => setIsDragging(false)}
              >
                <img
                  src={newsImageError ? "/news-placeholder.svg" : getImageUrl(currentNews.thumbnail_image)}
                  alt={(() => {
                    const title = currentNews.title;
                    if (typeof title === 'string') {
                      try {
                        const parsed = JSON.parse(title);
                        return parsed[locale] || parsed.az || "";
                      } catch {
                        return title;
                      }
                    }
                    return getTranslation(title, locale);
                  })()}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={() => setNewsImageError(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="bg-brand-orange text-white px-2 py-1 rounded text-xs">
                      {(() => {
                        const categoryTitle = currentNews.category?.title;
                        if (typeof categoryTitle === 'string') {
                          try {
                            const parsed = JSON.parse(categoryTitle);
                            return parsed[locale] || parsed.az || "Xəbər";
                          } catch {
                            return categoryTitle || "Xəbər";
                          }
                        }
                        return getTranslation(categoryTitle || { az: "Xəbər" }, locale);
                      })()}
                    </span>
                    <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs">
                      {(() => {
                        const date = new Date(currentNews.publish_date);
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const year = date.getFullYear();
                        return `${day}.${month}.${year}`;
                      })()}
                    </span>
                  </div>
                  <h3 className="text-white text-lg lg:text-xl font-bold leading-tight group-hover:underline pr-20">
                    {(() => {
                      const title = currentNews.title;
                      let titleText = "";
                      if (typeof title === 'string') {
                        try {
                          const parsed = JSON.parse(title);
                          titleText = parsed[locale] || parsed.az || "";
                        } catch {
                          titleText = title;
                        }
                      } else {
                        titleText = getTranslation(title, locale);
                      }
                      // Truncate if too long
                      return titleText.length > 80 ? titleText.substring(0, 77) + "..." : titleText;
                    })()}
                  </h3>
                </div>
                
                {/* News dots */}
                {sliderNews?.data?.length > 1 && (
                  <div className="absolute bottom-6 right-6 z-10">
                    <div className="flex items-center space-x-2">
                      {sliderNews.data.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentNewsSlide(index);
                            setNewsImageError(false);
                            // Reset the auto-rotation timer when clicking dots
                            if (newsTimerRef.current) {
                              clearInterval(newsTimerRef.current);
                              newsTimerRef.current = null;
                            }
                          }}
                          className={cn(
                            "w-3 h-3 rounded-full transition-colors hover:scale-125",
                            index === currentNewsSlide ? "bg-brand-orange" : "bg-gray-400"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-gray-100 h-80">
              <img
                src="/news-placeholder.svg"
                alt="News placeholder"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Ad Space - Only show if ad exists */}
        {mainAd && (mainAd.image || mainAd.iframe) && (
          <div className="hidden lg:block lg:col-span-4">
            <div className="rounded-xl overflow-hidden h-80">
              {mainAd.iframe ? (
                <div 
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{ __html: mainAd.iframe }}
                />
              ) : mainAd.url ? (
                <a href={mainAd.url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={adImageError ? "/news-placeholder.svg" : getImageUrl(mainAd.image)}
                    alt="Advertisement"
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                    onError={() => setAdImageError(true)}
                  />
                </a>
              ) : (
                <img
                  src={adImageError ? "/news-placeholder.svg" : getImageUrl(mainAd.image)}
                  alt="Advertisement"
                  className="w-full h-full object-cover"
                  onError={() => setAdImageError(true)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}