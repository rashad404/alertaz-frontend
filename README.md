# Kredit.az Frontend - Comprehensive Documentation

## Table of Contents
- [Languages & Frameworks](#languages--frameworks)
- [Project Structure](#project-structure)
- [Dark/Light Mode Implementation](#darklight-mode-implementation)
- [Multi-Language Support](#multi-language-support)
- [CSS Architecture](#css-architecture)
- [Application Flow Diagram](#application-flow-diagram)
- [Key Components](#key-components)
- [API Integration](#api-integration)
- [Common Issues & Solutions](#common-issues--solutions)
- [Summary](#summary)

## Languages & Frameworks

### Core Technologies
- **Next.js**: 15.4.4 (App Router)
- **React**: 19.1.0
- **TypeScript**: ^5
- **Tailwind CSS**: ^4
- **Node.js**: 18+ (recommended)

### Key Dependencies
- **next-themes**: ^0.4.6 (Dark mode support)
- **@tanstack/react-query**: ^5.83.0 (Server state management)
- **axios**: ^1.11.0 (HTTP client)
- **lucide-react**: ^0.526.0 (Icons)
- **clsx**: ^2.1.1 & **tailwind-merge**: ^3.3.1 (Class name utilities)
- **react-hook-form**: ^7.61.1 (Form handling)
- **zod**: ^4.0.10 (Schema validation)

### Development Dependencies
- **@tailwindcss/postcss**: ^4.1.11
- **autoprefixer**: ^10.4.21
- **eslint**: ^9
- **@types/react**: ^19
- **@types/node**: ^20.19.9

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── [lang]/            # Dynamic language routing
│   │   ├── layout.tsx     # Language-specific layout with providers
│   │   ├── page.tsx       # Home page
│   │   ├── news/          # News section
│   │   ├── banks/         # Banks section
│   │   ├── credits/       # Credits section
│   │   └── insurance/     # Insurance section
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Root page (redirects to default locale)
│   └── globals.css        # Global styles & CSS variables
├── components/
│   ├── layout/            # Layout components
│   │   ├── header.tsx     # Main navigation header
│   │   └── footer.tsx     # Site footer
│   ├── sections/          # Page sections
│   │   ├── hero-section.tsx
│   │   ├── categories-section.tsx
│   │   ├── currency-rates.tsx
│   │   ├── latest-news.tsx
│   │   ├── popular-offers.tsx
│   │   ├── partner-banks.tsx
│   │   └── app-download-section.tsx
│   └── ui/                # Reusable UI components
│       ├── language-switcher.tsx
│       ├── theme-toggle.tsx
│       ├── news-card.tsx
│       ├── offer-card.tsx
│       └── logo.tsx
├── providers/             # React context providers
│   ├── theme-provider.tsx # Dark mode provider
│   ├── dictionary-provider.tsx # Translation provider
│   └── query-provider.tsx # React Query provider
├── lib/                   # Utilities and helpers
│   ├── api/              # API configuration
│   │   ├── client.ts     # Axios instance
│   │   └── endpoints.ts  # API endpoints
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── messages/             # Translation files
│   ├── az.json          # Azerbaijani
│   ├── en.json          # English
│   └── ru.json          # Russian
├── public/              # Static assets
├── i18n-config.ts       # Internationalization config
├── middleware.ts        # Next.js middleware for locale routing
├── tailwind.config.ts   # Tailwind configuration
└── next.config.ts       # Next.js configuration
```

## Dark/Light Mode Implementation

### 1. Configuration
The dark mode is implemented using `next-themes` with Tailwind CSS class-based switching.

**tailwind.config.ts:**
```typescript
export default {
  darkMode: "class", // Enable class-based dark mode
  // ... rest of config
}
```

### 2. Theme Provider Setup
**providers/theme-provider.tsx:**
```typescript
"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }) {
  return (
    <NextThemesProvider
      attribute="class"           // Adds 'dark' class to html element
      defaultTheme="light"        // Default theme
      enableSystem={false}        // Disable system preference detection
      enableColorScheme={true}    // Enable color-scheme CSS property
      storageKey="kredit-theme"   // LocalStorage key
    >
      {children}
    </NextThemesProvider>
  );
}
```

### 3. Root Layout Integration
**app/layout.tsx:**
```typescript
export default function RootLayout({ children }) {
  return (
    <html lang="az" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 4. Theme Toggle Component
**components/ui/theme-toggle.tsx:**
```typescript
const { theme, setTheme } = useTheme();
// Toggle between light and dark themes
```

### 5. CSS Variables
**app/globals.css:**
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* Light mode variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* Dark mode variables */
  }
}
```

### 6. Usage in Components
```typescript
// Using Tailwind's dark variant
<div className="bg-white dark:bg-gray-900">
  <p className="text-black dark:text-white">Content</p>
</div>
```

## Multi-Language Support

### 1. Language Configuration
**i18n-config.ts:**
```typescript
export const i18n = {
  defaultLocale: 'az',
  locales: ['az', 'en', 'ru'],
} as const;

export type Locale = (typeof i18n)['locales'][number];
```

### 2. Middleware for Locale Routing
**middleware.ts:**
```typescript
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if locale is in pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    );
  }
}
```

### 3. Dictionary System
**get-dictionary.ts:**
```typescript
const dictionaries = {
  az: () => import('./messages/az.json').then((module) => module.default),
  en: () => import('./messages/en.json').then((module) => module.default),
  ru: () => import('./messages/ru.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => dictionaries[locale]();
```

### 4. Dictionary Provider
**providers/dictionary-provider.tsx:**
```typescript
const DictionaryContext = createContext<Dictionary | null>(null);

export function DictionaryProvider({ children, dictionary }) {
  return (
    <DictionaryContext.Provider value={dictionary}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const dictionary = useContext(DictionaryContext);
  if (!dictionary) {
    throw new Error('useDictionary must be used within a DictionaryProvider');
  }
  return dictionary;
}
```

### 5. Language Layout
**app/[lang]/layout.tsx:**
```typescript
export default async function LangLayout({ children, params }) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  return (
    <DictionaryProvider dictionary={dictionary}>
      <QueryProvider>
        <div className="min-h-screen">
          <Header locale={lang} />
          <main>{children}</main>
          <Footer locale={lang} />
        </div>
      </QueryProvider>
    </DictionaryProvider>
  );
}
```

### 6. Language Switcher
**components/ui/language-switcher.tsx:**
```typescript
const handleLanguageChange = (newLocale: Locale) => {
  const currentPathname = pathname.replace(`/${locale}`, "");
  const newPath = `/${newLocale}${currentPathname}`;
  router.push(newPath);
};
```

### 7. Translation Files Structure
**messages/[locale].json:**
```json
{
  "nav": {
    "news": "News",
    "banks": "Banks",
    "credits": "Credits"
  },
  "home": {
    "latestNews": "Latest news",
    "popularOffers": "Popular offers"
  }
}
```

## CSS Architecture

### 1. Tailwind Configuration
**Key customizations in tailwind.config.ts:**
- Custom color palette with brand colors
- Extended spacing values
- Custom font family (Inter)
- CSS variables integration
- Dark mode class strategy

### 2. Global Styles
**app/globals.css:**
```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* CSS Variables for theming */
@layer base {
  :root {
    /* Light mode colors */
  }
  .dark {
    /* Dark mode colors */
  }
}
```

### 3. Utility Classes
- **clsx**: Conditional class names
- **tailwind-merge**: Merge Tailwind classes without conflicts

**lib/utils/index.ts:**
```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Application Flow Diagram

```
User Request
     │
     ▼
Next.js Middleware
     │ (Locale detection & routing)
     ▼
Root Layout (app/layout.tsx)
     │ (Theme Provider)
     ▼
Language Layout (app/[lang]/layout.tsx)
     │ (Dictionary Provider + Query Provider)
     ├───> Header Component
     │      │ (Navigation + Language Switcher)
     │      └───> Theme Toggle
     │
     ├───> Page Component (app/[lang]/page.tsx)
     │      │
     │      ├───> Hero Section
     │      │      └───> API: getSliderBanners()
     │      │
     │      ├───> Categories Section
     │      │      └───> API: getCategories()
     │      │
     │      ├───> Currency Rates
     │      │      └───> API: getCurrencyRates()
     │      │
     │      ├───> Latest News
     │      │      └───> API: getNews()
     │      │
     │      ├───> Popular Offers
     │      │      └───> API: getOffers()
     │      │
     │      └───> Partner Banks
     │             └───> API: getPartnerBanks()
     │
     └───> Footer Component
            └───> Newsletter Subscription
```

## Key Components

### 1. Layout Components
- **Header**: Main navigation with language switcher and theme toggle
- **Footer**: Site footer with links and newsletter

### 2. Section Components
- **HeroSection**: Banner slider with news highlights
- **CategoriesSection**: Service category grid
- **CurrencyRates**: Live exchange rates display
- **LatestNews**: News grid with category filtering
- **PopularOffers**: Credit/loan offers carousel
- **PartnerBanks**: Bank partners grid

### 3. UI Components
- **LanguageSwitcher**: Dropdown for language selection
- **ThemeToggle**: Dark/light mode switcher
- **NewsCard**: News item display card
- **OfferCard**: Credit offer display card

## API Integration

### 1. Axios Client Configuration
**lib/api/client.ts:**
```typescript
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 2. API Endpoints
**lib/api/endpoints.ts:**
```typescript
export const newsApi = {
  getAll: (locale: string) => apiClient.get(`/xeberler?locale=${locale}`),
  getByCategory: (category: string, locale: string) => 
    apiClient.get(`/xeberler/category/${category}?locale=${locale}`),
};
```

### 3. React Query Integration
```typescript
const { data, isLoading } = useQuery({
  queryKey: ["news", locale],
  queryFn: () => newsApi.getAll(locale),
});
```

## Common Issues & Solutions

### 1. Hydration Errors
**Issue**: Mismatch between server and client rendering
**Solution**: 
- Add `suppressHydrationWarning` to html and body tags
- Use `mounted` state for client-only components
- Ensure consistent data between server and client

### 2. Dark Mode Flash
**Issue**: White flash before dark mode loads
**Solution**:
- Use `suppressHydrationWarning` on html element
- Store theme preference in localStorage
- Apply theme class before React hydration

### 3. Locale Routing Issues
**Issue**: 404 errors with locale routes
**Solution**:
- Ensure middleware matcher excludes static files
- Use dynamic [lang] folder structure
- Properly await params in async components

### 4. Translation Loading
**Issue**: Translations not updating on language change
**Solution**:
- Use dictionary provider pattern
- Pass locale to all components
- Ensure proper key dependencies in React Query

### 5. CSS Specificity
**Issue**: Tailwind classes not applying correctly
**Solution**:
- Use `tailwind-merge` for class merging
- Avoid conflicting utility classes
- Use CSS variables for dynamic values

## Summary

This Next.js 15 frontend application implements a robust multi-language financial portal with dark mode support. Key architectural decisions include:

1. **App Router**: Leverages Next.js 15's app directory for better performance and nested layouts
2. **Type Safety**: Full TypeScript implementation with strict typing
3. **Internationalization**: Custom dictionary-based system without heavy i18n libraries
4. **Theming**: Class-based dark mode with CSS variables for flexibility
5. **State Management**: React Query for server state, Context API for client state
6. **Styling**: Tailwind CSS v4 with custom configuration and utility classes
7. **Component Architecture**: Clear separation between layout, sections, and UI components

The application follows modern React patterns with server components by default, client components where needed, and proper error boundaries. The middleware handles locale routing efficiently, while providers manage theme and translation state across the application.

For future projects, this architecture provides a solid foundation that can be easily extended with additional features while maintaining performance and developer experience.