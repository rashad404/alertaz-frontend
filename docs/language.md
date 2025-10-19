# Language System Documentation

## Overview
Alert.az uses Next.js App Router with dynamic language routing to support multiple locales: **Azerbaijani (az)**, **English (en)**, and **Russian (ru)**.

**Key Principle**: Azerbaijani is the default locale and appears without a prefix in URLs.

---

## Configuration

### i18n-config.ts
```typescript
export const i18n = {
  defaultLocale: 'az',  // Default language (no prefix in URL)
  locales: ['az', 'en', 'ru'],  // Supported languages
} as const;

export type Locale = (typeof i18n)['locales'][number];
```

---

## URL Structure

### Clean URLs for Default Locale (Azerbaijani)
```
/ → Homepage (Azerbaijani)
/login → Login page (Azerbaijani)
/alerts/quick-setup → Quick setup (Azerbaijani)
```

### Prefixed URLs for Other Locales
```
/en → Homepage (English)
/en/login → Login page (English)
/ru/alerts/quick-setup → Quick setup (Russian)
```

### Important: `/az` URLs Redirect
```
/az → Redirects to /
/az/login → Redirects to /login
```

**Rule**: Never use `/az` prefix in URLs - it always redirects to the unprefixed version.

---

## Directory Structure

### All Pages Must Live in `app/[lang]`
```
app/
├── page.tsx                    # Root redirect (redirects to /az)
├── layout.tsx                  # Root layout (theme, fonts)
├── [lang]/                     # Dynamic language directory
│   ├── layout.tsx             # Language-specific layout (providers, header, footer)
│   ├── page.tsx               # Homepage
│   ├── login/
│   │   └── page.tsx           # Login page
│   ├── register/
│   │   └── page.tsx           # Register page
│   └── alerts/
│       └── quick-setup/
│           └── page.tsx       # Alert setup page
```

**Critical**: Do NOT create pages outside `[lang]` directory (except root page.tsx for redirect).

---

## How It Works

### 1. Middleware (middleware.ts)
The middleware handles URL rewriting transparently:

```typescript
// User visits: /login
// Middleware internally rewrites to: /az/login
// User sees: /login (no redirect)

// User visits: /en/login
// Middleware passes through: /en/login
// User sees: /en/login

// User visits: /az/login
// Middleware redirects to: /login
// User sees: /login (with redirect)
```

**Key Logic**:
- If URL has no locale prefix → Internally rewrite to `/az/...`
- If URL has `/en` or `/ru` → Pass through unchanged
- If URL has `/az` → Redirect to remove `/az` prefix

### 2. Root Page (app/page.tsx)
Simple redirect to default locale:

```typescript
import { redirect } from 'next/navigation';
import { i18n } from '@/i18n-config';

export default function RootPage() {
  redirect(`/${i18n.defaultLocale}`);  // Redirects to /az
}
```

This only runs when middleware is bypassed (rare cases).

### 3. Lang Layout (app/[lang]/layout.tsx)
Validates locale and provides context:

```typescript
export default async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = await params;

  // Validate locale
  if (!i18n.locales.includes(lang as Locale)) {
    notFound();
  }

  const dictionary = await getDictionary(lang as Locale);

  return (
    <DictionaryProvider dictionary={dictionary}>
      <Header locale={lang} />
      <main>{children}</main>
      <Footer locale={lang} />
    </DictionaryProvider>
  );
}
```

**Generates static params for all locales**:
```typescript
export async function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}
```

---

## Creating New Pages

### DO ✅
```typescript
// app/[lang]/dashboard/page.tsx
export default function DashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  // Your page code
}
```

### DON'T ❌
```typescript
// app/dashboard/page.tsx  ← WRONG! Will get 404
// Must be in [lang] directory
```

---

## Working with Translations

### 1. Dictionary Files
Translation files in `messages/` directory:

```
messages/
├── az.json    # Azerbaijani translations
├── en.json    # English translations
└── ru.json    # Russian translations
```

### 2. Using Translations in Components

**Server Components**:
```typescript
import { getDictionary } from '@/get-dictionary';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <h1>{dict.home.title}</h1>;
}
```

**Client Components**:
```typescript
'use client';
import { useDictionary } from '@/providers/dictionary-provider';

export default function MyComponent() {
  const dict = useDictionary();

  return <h1>{dict.home.title}</h1>;
}
```

### 3. Dictionary Structure
```json
// messages/az.json
{
  "nav": {
    "home": "Ana səhifə",
    "login": "Daxil ol",
    "register": "Qeydiyyat"
  },
  "auth": {
    "welcomeBack": "Xoş gəlmisiniz",
    "signIn": "Daxil ol"
  }
}
```

---

## Language Switching

### In Links
```typescript
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Current page: /login (az)
<Link href="/en/login">English</Link>  // Switches to /en/login
<Link href="/ru/login">Русский</Link>  // Switches to /ru/login
<Link href="/login">Azərbaycan</Link>  // Stays at /login
```

### Language Switcher Component
```typescript
'use client';
import { usePathname } from 'next/navigation';

export function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/').filter(Boolean);

    // Remove current locale if present
    if (['en', 'ru'].includes(segments[0])) {
      segments.shift();
    }

    // Add new locale (unless it's 'az')
    const newPath = newLocale === 'az'
      ? `/${segments.join('/')}`
      : `/${newLocale}/${segments.join('/')}`;

    return newPath || '/';
  };

  return (
    <div>
      <Link href={switchLocale('az')}>AZ</Link>
      <Link href={switchLocale('en')}>EN</Link>
      <Link href={switchLocale('ru')}>RU</Link>
    </div>
  );
}
```

---

## Common Patterns

### Getting Current Locale

**In Server Components**:
```typescript
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  // Use lang
}
```

**In Client Components**:
```typescript
'use client';
import { usePathname } from 'next/navigation';

export default function MyComponent() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] === 'en' || pathname.split('/')[1] === 'ru'
    ? pathname.split('/')[1]
    : 'az';
}
```

### Locale-Specific API Calls
```typescript
const response = await fetch(`${API_URL}/${lang}/alerts`);
```

### Dynamic Routes with Locale
```typescript
// app/[lang]/alerts/[id]/page.tsx
export default async function AlertDetailPage({
  params
}: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang, id } = await params;
  // Fetch alert with locale-specific data
}
```

---

## Testing Language Routes

### Development URLs to Test
```bash
# Azerbaijani (default)
http://localhost:3000/
http://localhost:3000/login
http://localhost:3000/alerts/quick-setup

# English
http://localhost:3000/en
http://localhost:3000/en/login
http://localhost:3000/en/alerts/quick-setup

# Russian
http://localhost:3000/ru
http://localhost:3000/ru/login
http://localhost:3000/ru/alerts/quick-setup

# Should redirect (az prefix)
http://localhost:3000/az → /
http://localhost:3000/az/login → /login
```

---

## Troubleshooting

### Issue: Page shows 404
**Cause**: Page created outside `[lang]` directory
**Fix**: Move page to `app/[lang]/your-page/page.tsx`

### Issue: `/az` doesn't redirect
**Cause**: Middleware not running
**Fix**: Check `middleware.ts` matcher configuration

### Issue: Translations not loading
**Cause**: Dictionary provider not wrapping component
**Fix**: Ensure `[lang]/layout.tsx` has `DictionaryProvider`

### Issue: Locale switching loses current page
**Cause**: Not preserving pathname when switching
**Fix**: Use `usePathname()` to get current path and construct new URL

---

## Best Practices

1. **Always create pages in `[lang]` directory**
2. **Never use `/az` prefix in links** - use `/` instead
3. **Use TypeScript types** for locale: `Locale` from `i18n-config`
4. **Test all three locales** when creating new pages
5. **Use dictionary provider** for translations in client components
6. **Await params** in all page components (Next.js 15 requirement)
7. **Generate static params** for better performance

---

## Quick Reference

| Pattern | Correct | Incorrect |
|---------|---------|-----------|
| Homepage (az) | `/` | `/az` |
| Login (az) | `/login` | `/az/login` |
| Homepage (en) | `/en` | `/en/home` |
| Login (en) | `/en/login` | - |
| Page location | `app/[lang]/login/page.tsx` | `app/login/page.tsx` |
| Get locale | `const { lang } = await params` | `const lang = pathname.split('/')[1]` |
| Switch to az | `href="/login"` | `href="/az/login"` |
| Switch to en | `href="/en/login"` | - |

---

**Last Updated**: October 2024
**Version**: 1.0
