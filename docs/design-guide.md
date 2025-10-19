# Alert.az Design Guide

## Overview
This design guide documents the UI/UX design system for Alert.az, based on 2025 design trends. The design emphasizes modern aesthetics, smooth interactions, and accessibility.

---

## Design Philosophy

### Core Principles
1. **Modern Glassmorphism**: Frosted glass effects with subtle transparency
2. **Mesh Gradients**: Multi-layered gradient backgrounds for depth
3. **Micro-interactions**: Subtle animations that enhance user experience
4. **Premium Feel**: High-end aesthetics with attention to detail
5. **Accessibility First**: Dark mode support, proper contrast, readable typography

### 2025 Design Trends Applied
- Bento grid layouts for service cards
- Gradient text effects
- Blurred backgrounds with backdrop filters
- Smooth hover transitions
- Layered depth effects
- Rounded corners (rounded-2xl, rounded-3xl)

---

## Color Palette

### Brand Colors
```css
Primary: rgb(81, 91, 195) / #5B5FCF
Primary Dark: rgb(61, 71, 175) / #3D47AF
Primary Light: #7478E6
```

### Gradient Palettes
**Primary Gradient (Hero, Buttons)**
```css
background: linear-gradient(135deg, #667EEA 0%, #764BA2 50%, #F093FB 100%);
```

**Service Card Gradients**
- Crypto: `from-orange-500 to-yellow-500`
- Stocks: `from-blue-500 to-cyan-500`
- Website: `from-green-500 to-emerald-500`
- Weather: `from-purple-500 to-pink-500`
- Currency: `from-indigo-500 to-purple-500`
- Flight: `from-sky-500 to-blue-500`

**Stats Gradients**
- Indigo to Purple: `from-indigo-600 to-purple-600`
- Blue to Cyan: `from-blue-600 to-cyan-600`
- Purple to Pink: `from-purple-600 to-pink-600`
- Emerald to Teal: `from-emerald-600 to-teal-600`

### Semantic Colors
```css
Success: #10B981 (emerald-500)
Warning: #F59E0B (amber-500)
Danger: #EF4444 (red-500)
Info: #3B82F6 (blue-500)
```

### Dark Mode Colors
```css
Background: from-gray-950 via-gray-900 to-indigo-950
Card Background: dark:bg-gray-900/80
Text: dark:text-white
Muted Text: dark:text-gray-300
Border: dark:border-gray-700/30
```

---

## Typography

### Font Stack
```css
Body: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
Headings: "Plus Jakarta Sans" (imported from Google Fonts)
```

### Font Settings
```css
font-feature-settings: "rlig" 1, "calt" 1;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

### Type Scale
```css
H1: text-6xl md:text-7xl (60px/72px)
H2: text-4xl (36px)
H3: text-xl (20px)
Body: text-sm (14px)
Small: text-xs (12px)
```

### Font Weights
- Light: 300
- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## Component Patterns

### 1. Gradient Text
Used for headlines and important text elements.

```tsx
<span className="gradient-text text-6xl font-bold">Alert.az</span>
```

```css
.gradient-text {
  @apply font-bold inline-block;
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 50%, #F093FB 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}

/* Fallback for unsupported browsers */
@supports not (background-clip: text) {
  .gradient-text {
    background: none;
    color: rgb(81, 91, 195);
  }
}
```

### 2. Glass Cards
Semi-transparent cards with backdrop blur.

```tsx
<div className="card-glass rounded-3xl p-8">
  {/* Content */}
</div>
```

```css
.card-glass {
  @apply relative rounded-3xl p-8 overflow-hidden;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
}
```

### 3. Service Cards (Bento Grid)
Interactive cards with hover effects.

**Structure:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px]">
  <div className="relative group cursor-pointer">
    {/* Card Background Gradient */}
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500 to-yellow-500 opacity-10 group-hover:opacity-15 transition-all duration-500" />

    {/* Glass Card */}
    <div className="relative h-full rounded-3xl p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30">
      {/* Hover Gradient Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-50 bg-gradient-to-br from-orange-500 to-yellow-500 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        {/* Icon, Title, Description */}
        {/* Stats Badge and Arrow */}
      </div>
    </div>
  </div>
</div>
```

**Key Features:**
- Fixed height: `auto-rows-[240px]`
- Subtle background gradient on hover: `opacity-10 → opacity-15`
- Blurred glow effect: `blur-3xl` with `opacity-0 → opacity-50`
- Scale on hover: `scale-[1.02]`
- Shine effect on hover

### 4. Animated Logo
Bell icon with dual-layer effect and gradient border.

```tsx
<div className="relative">
  <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1px] transition-transform group-hover:scale-105 duration-300">
    <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="relative">
        <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" strokeWidth={2} fill="none" />
        <div className="absolute inset-0 w-5 h-5">
          <Bell className="w-5 h-5 text-purple-500 opacity-50" strokeWidth={2} fill="none" />
        </div>
      </div>
    </div>
  </div>
</div>
```

**Key Features:**
- Gradient border using `p-[1px]` technique
- Dual-layer icon (solid + 50% opacity overlay)
- Hover scale: `group-hover:scale-105`

### 5. Primary Button
Gradient button with shine effect.

```tsx
<button className="btn-primary">
  Get Started
</button>
```

```css
.btn-primary {
  @apply relative px-8 py-4 font-medium text-white rounded-2xl overflow-hidden transition-all duration-300;
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  box-shadow: 0 4px 15px 0 rgba(102, 126, 234, 0.4);
  transform-style: preserve-3d;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px 0 rgba(102, 126, 234, 0.5);
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn-primary:hover::before {
  left: 100%;
}
```

### 6. Search Input with Focus Glow
AI-powered search with purple glow on focus.

```tsx
<div className={`relative transition-all duration-500 ${isFocused ? 'scale-105' : ''}`}>
  <div className={`rounded-3xl p-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 ${
    isFocused ? 'shadow-[0_0_80px_20px_rgba(168,85,247,0.3)]' : 'shadow-lg'
  }`}>
    {/* AI Sparkles Icon */}
    {/* Input Field */}
    {/* Create Alert Button */}
  </div>
</div>
```

**Key Features:**
- Box-shadow glow instead of overlay div
- Scale up on focus: `scale-105`
- Glassmorphism: `bg-white/50 backdrop-blur-xl`

### 7. Stats Display
Gradient numbers with labels.

```tsx
<div className="text-center">
  <div className="text-4xl font-bold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
    99.9%
  </div>
  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
    Uptime
  </div>
</div>
```

---

## Animations & Transitions

### Timing Functions
```css
Default: duration-300 (300ms)
Smooth: duration-500 (500ms)
Slow: duration-1000 (1000ms)
```

### Common Animations

**Float Animation**
```css
.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}
```

**Gradient Shift**
```css
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

**Pulse (System Status)**
```css
animate-pulse (Tailwind built-in)
animate-ping (Tailwind built-in)
```

**Hover Transitions**
```css
Scale: group-hover:scale-[1.02]
Translate: group-hover:translate-x-1
Opacity: group-hover:opacity-100
```

---

## Layout Patterns

### Container Widths
```css
Max Width: max-w-7xl (1280px) - Main content
Medium Width: max-w-6xl (1152px) - Stats section
Narrow Width: max-w-3xl (768px) - Search input
```

### Spacing System
```css
Section Padding: px-6 py-20
Card Padding: p-6 or p-8
Gap Between Items: gap-6 or gap-8
Margin Bottom: mb-8, mb-12
```

### Grid Layouts
```css
Service Cards: grid-cols-1 md:grid-cols-3 gap-6
Stats: grid-cols-2 md:grid-cols-4 gap-8
```

---

## Background Effects

### Mesh Gradient Background
```css
.mesh-gradient {
  background:
    radial-gradient(at 40% 20%, hsla(280,100%,74%,0.3) 0px, transparent 50%),
    radial-gradient(at 80% 0%, hsla(251,100%,77%,0.3) 0px, transparent 50%),
    radial-gradient(at 0% 50%, hsla(355,100%,93%,0.2) 0px, transparent 50%),
    radial-gradient(at 80% 50%, hsla(340,100%,76%,0.2) 0px, transparent 50%),
    radial-gradient(at 0% 100%, hsla(226,100%,77%,0.2) 0px, transparent 50%),
    radial-gradient(at 80% 100%, hsla(242,100%,70%,0.3) 0px, transparent 50%);
}
```

### Mouse-Follow Gradient
```tsx
const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

<div
  className="absolute w-96 h-96 rounded-full"
  style={{
    background: 'radial-gradient(circle, rgba(102,126,234,0.3) 0%, transparent 70%)',
    left: `${mousePosition.x - 200}px`,
    top: `${mousePosition.y - 200}px`,
    transition: 'all 0.3s ease-out',
    pointerEvents: 'none'
  }}
/>
```

---

## Dark Mode Implementation

### Theme Toggle
```tsx
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();
```

### Class Pattern
Always provide both light and dark variants:
```tsx
className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
```

### Common Dark Mode Classes
```css
Background: dark:bg-gray-900
Card: dark:bg-gray-900/80
Border: dark:border-gray-700/30
Text: dark:text-white
Muted Text: dark:text-gray-300
Icon: dark:text-indigo-400
```

---

## Icon Usage

### Lucide React Icons
```tsx
import { Bell, Sparkles, TrendingUp } from 'lucide-react';

<Bell className="w-5 h-5 text-indigo-600" strokeWidth={2} />
```

### Icon Sizes
```css
Small: w-4 h-4
Medium: w-5 h-5
Large: w-7 h-7
XL: w-10 h-10
```

### Important: SVG Icons and Gradients
**Never apply gradient text classes to SVG icons** - they don't support text gradients. Use solid colors:
```tsx
// ❌ Wrong
<Bell className="gradient-text" />

// ✅ Correct
<Bell className="text-indigo-600 dark:text-indigo-400" />
```

---

## Accessibility Guidelines

### Contrast Ratios
- Body text: At least 4.5:1 contrast ratio
- Large text: At least 3:1 contrast ratio
- Interactive elements: Clear focus states

### Focus States
```css
.focus-visible-ring {
  @apply focus-visible:outline-none
         focus-visible:ring-2
         focus-visible:ring-[rgb(81,91,195)]
         focus-visible:ring-offset-2
         dark:focus-visible:ring-offset-gray-900;
}
```

### Text Selection
```css
::selection {
  background-color: rgb(81, 91, 195);
  color: white;
}
```

---

## Best Practices

### DO ✅
1. Use glassmorphism for cards and overlays
2. Apply smooth transitions (300ms-500ms)
3. Provide dark mode variants for all elements
4. Use gradient text for headlines
5. Add hover effects to interactive elements
6. Use box-shadow for glows instead of overlay divs
7. Keep opacity values subtle (10-15% for backgrounds)
8. Use `inline-block` for gradient text
9. Add fallbacks for unsupported CSS features

### DON'T ❌
1. Don't apply gradient text classes to SVG icons
2. Don't use absolute/fixed positioning unnecessarily
3. Don't make hover effects too dark (max 15% opacity)
4. Don't forget to add dark mode variants
5. Don't use z-index without good reason
6. Don't create overlays that block content
7. Don't forget transition classes for animations
8. Don't use overly complex color combinations

---

## Code Examples

### Example 1: Creating a Glass Card with Gradient Icon
```tsx
<div className="card-glass rounded-3xl p-8 hover:scale-105 transition-transform duration-500">
  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6">
    <Globe className="w-7 h-7 text-white" />
  </div>
  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
    Card Title
  </h3>
  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
    Card description text
  </p>
</div>
```

### Example 2: Gradient Text with Fallback
```tsx
<h1 className="gradient-text text-6xl md:text-7xl font-bold">
  Your Headline
</h1>
```

### Example 3: Interactive Button with Gradient
```tsx
<button className="relative group px-6 py-3 rounded-2xl font-medium text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 hover:shadow-lg hover:scale-105">
  <span className="relative flex items-center gap-2">
    <Search className="w-4 h-4" />
    <span>Create Alert</span>
    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
  </span>
</button>
```

---

## Component Checklist

When creating a new page or component, ensure:

- [ ] Dark mode support added
- [ ] Hover states defined for interactive elements
- [ ] Proper spacing using Tailwind spacing scale
- [ ] Gradients from approved color palette
- [ ] Icons sized appropriately
- [ ] Transitions applied (300-500ms)
- [ ] Glassmorphism effect on cards
- [ ] Text contrast meets WCAG standards
- [ ] Focus states visible and accessible
- [ ] Responsive behavior on mobile (md: breakpoint)

---

## File References

- **Global Styles**: `/app/globals.css`
- **Main Layout**: `/app/[lang]/layout.tsx`
- **Homepage**: `/app/[lang]/page.tsx`
- **Header Component**: `/components/layout/Header.tsx`
- **Service Grid**: `/components/home/ServiceGrid.tsx`
- **Search Monitor**: `/components/home/SearchMonitor.tsx`

---

## Resources

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev/icons
- **Next.js**: https://nextjs.org/docs
- **next-themes**: https://github.com/pacocoursey/next-themes
- **Google Fonts**: Inter, Plus Jakarta Sans

---

**Last Updated**: October 2024
**Version**: 1.0
