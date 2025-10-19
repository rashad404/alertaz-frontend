import apiClient from './client';
import type {
  Company,
  CompanyType,
  News,
  Category,
  Offer,
  OffersCategory,
  Currency,
  HomePageBanner,
  HomePageSliderBanner,
  Partner,
  FAQ,
  MetaTag,
  Language,
  ContactFormData,
  SiteAd,
  AppDownloadSection,
  PaginatedResponse,
} from '@/lib/types';

// Helper function to build locale path
const localePath = (locale?: string) => locale ? `/${locale}` : '';

// Language endpoints
export const languageApi = {
  getAll: () => apiClient.get<Language[]>('/languages'),
};

// Company endpoints
export const companyApi = {
  getTypes: (locale?: string) => 
    apiClient.get<CompanyType[]>(`${localePath(locale)}/company-types`),
  
  getCompaniesByType: (type: string, locale?: string) => 
    apiClient.get<Company[]>(`${localePath(locale)}/company-types/${type}/sirketler`),
  
  getAllBanks: (locale?: string) => 
    apiClient.get<Company[]>(`${localePath(locale)}/banks`),
  
  getBankBySlug: (slug: string, locale?: string) => 
    apiClient.get<Company>(`${localePath(locale)}/banks/${slug}`),
};

// News endpoints
export const newsApi = {
  getByCategory: (categorySlug?: string, locale?: string, params?: Record<string, unknown>) => 
    apiClient.get<PaginatedResponse<News>>(
      `${localePath(locale)}/xeberler/category${categorySlug ? `/${categorySlug}` : ''}`,
      { params }
    ),
  
  getCategories: (locale?: string) => 
    apiClient.get<Category[]>(`${localePath(locale)}/xeberler/kategoriler`),
  
  getBySlug: (slug: string, locale?: string) =>
    apiClient.get<News>(`${localePath(locale)}/xeberler/${slug}`),
};

// Offers endpoints
export const offersApi = {
  getAll: (locale?: string, params?: Record<string, unknown>) => 
    apiClient.get<PaginatedResponse<Offer>>(`${localePath(locale)}/teklifler`, { params }),
  
  getCategories: (locale?: string) => 
    apiClient.get<OffersCategory[]>(`${localePath(locale)}/teklifler/kategoriler`),
  
  getById: (id: number, locale?: string) =>
    apiClient.get<Offer>(`${localePath(locale)}/teklifler/${id}`),
};

// Home page endpoints
export const homeApi = {
  getSliderBanners: (locale?: string) => 
    apiClient.get<HomePageSliderBanner[]>(`${localePath(locale)}/home/slider-banners`),
  
  getBanners: (locale?: string) => 
    apiClient.get<HomePageBanner[]>(`${localePath(locale)}/home/banners`),
  
  getSliderNews: (locale?: string) => 
    apiClient.get<any[]>(`${localePath(locale)}/home-slider-news`),
  
  getAds: (locale?: string) =>
    apiClient.get<SiteAd[]>(`${localePath(locale)}/home/ads`),
  
  getRecommendedBanks: (locale?: string) =>
    apiClient.get<Company[]>(`${localePath(locale)}/recommended-banks`),
};

// Currency endpoints
export const currencyApi = {
  getRates: (locale?: string) => 
    apiClient.get<Currency[]>(`${localePath(locale)}/currencies`),
};

// Site endpoints
export const siteApi = {
  getImages: (locale?: string) => 
    apiClient.get<any>(`${localePath(locale)}/site-images`),
  
  getAds: (locale?: string) => 
    apiClient.get<SiteAd[]>(`${localePath(locale)}/site-ads`),
  
  getMetaTag: (code: string, locale?: string) => 
    apiClient.get<MetaTag>(`${localePath(locale)}/meta-tag/${code}`),
  
  getPartners: (locale?: string) =>
    apiClient.get<Partner[]>(`${localePath(locale)}/partners`),
  
  getFaqs: (locale?: string) =>
    apiClient.get<FAQ[]>(`${localePath(locale)}/sual-cavab`),
  
  getAppDownloadSection: (locale?: string) =>
    apiClient.get<AppDownloadSection>(`${localePath(locale)}/app-download-section`),
};

// Contact endpoint
export const contactApi = {
  submit: (data: ContactFormData, locale?: string) => 
    apiClient.post(`${localePath(locale)}/elaqe`, data),
};

// Search endpoint
export const searchApi = {
  search: (query: string, locale?: string) =>
    apiClient.get(`${localePath(locale)}/search`, { params: { q: query } }),
};