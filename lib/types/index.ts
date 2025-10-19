export interface Translation {
  az: string;
  en?: string;
  ru?: string;
}

export interface Company {
  id: number;
  name: Translation;
  logo: string;
  about: Translation;
  site: string;
  phones: string[];
  addresses: string[];
  company_type_id: number;
  company_type?: CompanyType;
  slug: string;
  views: number;
  order: number;
  status: boolean;
  email?: string;
  establishment_date?: string;
  bank_details?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CompanyType {
  id: number;
  title: Translation;
  slug: string;
  icon?: string;
  selected_icon?: string;
  order: number;
  status: boolean;
  companies?: Company[];
}

export interface News {
  id: number;
  thumbnail_image: string;
  title: Translation;
  content: Translation;
  category_id: number;
  category?: Category;
  publish_date: string;
  slug: string;
  views: number;
  seo_title?: Translation;
  seo_keywords?: Translation;
  seo_description?: Translation;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  title: Translation;
  slug: string;
  order: number;
  status: boolean;
  seo_title?: Translation;
  seo_keywords?: Translation;
  seo_description?: Translation;
}

export interface Offer {
  id: number;
  icon?: string;
  title: Translation;
  offers_category_id: number;
  offers_category?: OffersCategory;
  company_id: number;
  company?: Company;
  annual_interest_rate: number;
  min_interest_rate?: number;
  max_interest_rate?: number;
  monthly_payment?: number;
  min_amount?: number;
  max_amount?: number;
  min_duration?: number;
  max_duration?: number;
  views: number;
  site_link?: string;
  offer_advantages?: OfferAdvantage[];
  advantages?: OfferAdvantage[];
  duration_id?: number;
  duration?: OffersDuration;
  created_at: string;
  updated_at: string;
  // Legacy fields for backward compatibility
  annual_rate_min?: number;
  annual_rate_max?: number;
  amount_min?: number;
  amount_max?: number;
  term_min?: number;
  term_max?: number;
}

export interface OffersCategory {
  id: number;
  title: Translation;
  slug: string;
  order: number;
  status: boolean;
}

export interface OfferAdvantage {
  id: number;
  title: Translation;
  offer_id: number;
  order: number;
  status: boolean;
}

export interface OffersDuration {
  id: number;
  title: string;
  order: number;
  status: boolean;
}

export interface Currency {
  id: number;
  currency: string;
  central_bank_rate: number;
  order: number;
  status: boolean;
  buy_sell_rates?: BuySellRate[];
}

export interface BuySellRate {
  id: number;
  currency_id: number;
  company_id: number;
  buy_price: number;
  sell_price: number;
  company?: Company;
}

export interface HomePageBanner {
  id: number;
  image: string;
  link?: string;
  order: number;
  status: boolean;
}

export interface HomePageSliderBanner {
  id: number;
  image: string;
  title: Translation;
  description: Translation;
  link?: string;
  link_text?: Translation;
  order: number;
  status: boolean;
}

export interface Partner {
  id: number;
  title: string;
  image: string;
  order: number;
  status: boolean;
}

export interface FAQ {
  id: number;
  question: Translation;
  answer: Translation;
  order: number;
  status: boolean;
}

export interface MetaTag {
  id: number;
  code: string;
  seo_title?: Translation;
  seo_keywords?: Translation;
  seo_description?: Translation;
}

export interface SiteImage {
  id: number;
  name: string;
  path: string;
  url: string;
}

export interface Language {
  id: number;
  title: string;
  lang_code: string;
  is_main: boolean;
  status: boolean;
  order: number;
}

export interface ContactFormData {
  ad: string;
  soyad: string;
  telefon: string;
  email: string;
  mesaj: string;
  terms: boolean;
}

export interface SiteAd {
  id: number;
  image: string;
  link?: string;
  position: string;
  order: number;
  status: boolean;
}

export interface AppDownloadSection {
  id: number;
  image: string;
  title: Translation;
  description: Translation;
  app_store_link?: string;
  play_store_link?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}