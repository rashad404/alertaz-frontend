# Frontend: Next.js Application

## Directory Structure
```
frontend/
├── app/
│   ├── [lang]/           # Dynamic language routing
│   │   ├── layout.tsx    # Language layout with providers
│   │   ├── page.tsx      # Homepage
│   │   ├── offers/       # Offers section
│   │   │   └── [id]/    # Dynamic offer detail
│   │   ├── banks/        # Banks listing
│   │   ├── credits/      # Credits section
│   │   └── news/         # News section
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── layout/          # Header, Footer
│   ├── sections/        # Page sections
│   └── ui/              # Reusable components
├── lib/
│   ├── api/             # API client setup
│   └── utils/           # Helper functions
└── messages/            # Translation files (az, en, ru)
```

## Routing Patterns
### Language Routes
- Default (az): `/banks` (no prefix)
- English: `/en/banks`
- Russian: `/ru/banks`

### Dynamic Routes
```typescript
// app/[lang]/offers/[id]/page.tsx
export default async function OfferDetail({ params }) {
  const { lang, id } = await params;
  // Fetch offer by id
}
```

## Component Patterns
### Server Components (Default)
```typescript
// Async data fetching
export default async function Page({ params }) {
  const { lang } = await params;
  const data = await fetch(`${API_URL}/${lang}/teklifler`);
  return <div>{/* Render */}</div>;
}
```

### Client Components
```typescript
"use client";  // Required at top

import { useState, useEffect } from 'react';

export default function InteractiveComponent() {
  const [state, setState] = useState();
  // Client-side logic
}
```

## API Integration
### Axios Client Setup
```typescript
// lib/api/client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// Usage
const response = await apiClient.get(`/${lang}/teklifler`);
```

### React Query Pattern
```typescript
"use client";
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['offers', lang],
  queryFn: () => fetchOffers(lang),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

## Translation System
### Dictionary Provider
```typescript
// Usage in components
import { useDictionary } from '@/providers/dictionary-provider';

const dict = useDictionary();
return <h1>{dict.home.title}</h1>;
```

### Translation Files
```json
// messages/az.json
{
  "nav": {
    "home": "Ana səhifə",
    "banks": "Banklar",
    "credits": "Kreditlər"
  }
}
```

### Parse Translated Content
```typescript
// For API responses with JSON translations
import { parseTranslatedContent } from '@/lib/utils/translation';

const title = parseTranslatedContent(offer.title, lang);
```

## Dark Mode Implementation
### Theme Toggle
```typescript
"use client";
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();
const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
```

### Styling Pattern
```tsx
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  {/* Always provide both light and dark variants */}
</div>
```

## Common Components Usage
### OfferCard
```tsx
<OfferCard
  offer={offer}
  locale={lang}
  showDetails={true}
/>
```

### NewsCard
```tsx
<NewsCard
  news={newsItem}
  locale={lang}
  variant="horizontal"
/>
```

### LanguageSwitcher
```tsx
<LanguageSwitcher 
  locale={currentLocale}
  pathname={pathname}
/>
```

## Build & Deployment
```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://100.89.150.50:8000/api
NEXT_PUBLIC_SITE_URL=http://100.89.150.50:3000
```

## Performance Optimization
- Use `loading.tsx` for route transitions
- Implement `error.tsx` for error boundaries
- Use `Image` component with proper sizing
- Lazy load heavy components
- Prefetch links with `<Link prefetch={true}>`

## Common Issues
### Hydration Errors
- Add `suppressHydrationWarning` to dynamic elements
- Use `useEffect` for client-only code
- Ensure server/client data consistency

### Translation Not Updating
- Clear `.next` cache: `rm -rf .next`
- Check dictionary provider wrapping
- Verify locale parameter passing

### Dark Mode Flash
- Add `suppressHydrationWarning` to html/body
- Ensure theme provider wraps all content
- Check `next-themes` configuration

## Testing Patterns
```bash
# Test specific page
curl http://100.89.150.50:3000/az/offers

# Check API integration
curl http://100.89.150.50:3000/api/health

# Build for production
npm run build && npm start
```