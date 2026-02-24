/**
 * performance-optimization.md
 * 🚀 Core Web Vitals Optimization Guide
 * 
 * This guide explains how to optimize your site for Google's Core Web Vitals.
 * These metrics directly impact SEO rankings.
 */

# Core Web Vitals Optimization Guide

## 📊 What are Core Web Vitals?

Google's Core Web Vitals are three key metrics that measure:

1. **LCP (Largest Contentful Paint)** - Loading performance
   - Good: < 2.5 seconds
   - Needs Improvement: 2.5 - 4.0 seconds  
   - Poor: > 4.0 seconds

2. **FID (First Input Delay)** - Interactivity
   - Good: < 100ms
   - Needs Improvement: 100-300ms
   - Poor: > 300ms

3. **CLS (Cumulative Layout Shift)** - Visual stability
   - Good: < 0.1
   - Needs Improvement: 0.1 - 0.25
   - Poor: > 0.25

---

## ✅ What We've Implemented

### 1. Lazy Loading Images (`LazyImage.tsx`)

**Location:** `src/components/SEO/LazyImage.tsx`

**Usage:**
```tsx
import LazyImage from '@/components/SEO/LazyImage';

<LazyImage
  src="/images/car.jpg"
  alt="BMW X5 2024"
  width={800}
  height={600}
  priority={false} // Set to true for above-the-fold images
/>
```

**Benefits:**
- ✅ Reduces initial page load time
- ✅ Uses native `loading="lazy"` attribute
- ✅ Automatic blur-up placeholder
- ✅ Intersection Observer fallback for older browsers

**When to use `priority={true}`:**
- Hero images
- Logo
- First product image in listing
- Any image visible without scrolling

---

### 2. Web Vitals Monitoring (`useWebVitals.ts`)

**Location:** `src/hooks/useWebVitals.ts`

**Usage:**
```tsx
// In App.tsx or MainLayout:
import { useWebVitals } from '@/hooks/useWebVitals';

function App() {
  useWebVitals(); // That's it!
  
  return (
    // Your app
  );
}
```

**What it does:**
- ✅ Automatically tracks LCP, FID, CLS, FCP, TTFB
- ✅ Logs to console in development
- ✅ Sends to Google Analytics (if configured)
- ✅ Color-coded warnings (✅ good, ⚠️ needs improvement, ❌ poor)

---

## 🎯 Optimization Checklist

### Images

- [ ] Replace `<img>` with `<LazyImage>` component
- [ ] Set `priority={true}` for above-the-fold images
- [ ] Set `priority={false}` for below-the-fold images
- [ ] Compress images (use WebP format)
- [ ] Set explicit `width` and `height` to prevent CLS
- [ ] Add descriptive `alt` text for SEO

**Example - Hero Section:**
```tsx
<LazyImage
  src="/images/hero.jpg"
  alt="Koli One - Bulgarian Car Marketplace"
  width={1920}
  height={1080}
  priority={true} // Above the fold
/>
```

**Example - Grid Item:**
```tsx
<LazyImage
  src={car.images[0]}
  alt={`${car.brand} ${car.model} ${car.year}`}
  width={400}
  height={300}
  priority={false} // Below the fold
/>
```

---

### JavaScript

- [ ] Code splitting with React.lazy()
- [ ] Use `defer` or `async` for non-critical scripts
- [ ] Minimize third-party scripts
- [ ] Tree-shake unused code

**Already implemented:**
- ✅ All routes use `safeLazy()` for code splitting
- ✅ SmartLoader for suspense fallbacks
- ✅ Dynamic imports for heavy components

**Check your script tags:**
```html
<!-- ❌ BAD: Blocks rendering -->
<script src="/analytics.js"></script>

<!-- ✅ GOOD: Non-blocking -->
<script src="/analytics.js" defer></script>
```

---

### Fonts

- [ ] Use `font-display: swap` or `font-display: optional`
- [ ] Preload critical fonts
- [ ] Self-host fonts (don't rely on Google Fonts)

**Add to your CSS:**
```css
@font-face {
  font-family: 'YourFont';
  src: url('/fonts/your-font.woff2') format('woff2');
  font-display: swap; /* Prevents invisible text */
}
```

**Preload in `index.html`:**
```html
<link rel="preload" href="/fonts/your-font.woff2" as="font" type="font/woff2" crossorigin>
```

---

### Layout Shift Prevention

**Set explicit dimensions:**
```tsx
// ❌ BAD: Causes CLS
<img src="car.jpg" alt="Car" />

// ✅ GOOD: Prevents CLS
<LazyImage 
  src="car.jpg" 
  alt="Car" 
  width={800} 
  height={600} 
/>
```

**Reserve space for ads/banners:**
```tsx
const AdContainer = styled.div`
  min-height: 250px; /* Reserve space before ad loads */
  display: flex;
  align-items: center;
  justify-content: center;
`;
```

---

## 🔍 Testing Tools

### 1. Chrome DevTools

```
Right-click → Inspect → Lighthouse → Generate Report
```

### 2. Google PageSpeed Insights

```
https://pagespeed.web.dev/
```

### 3. Web Vitals Extension

```
https://chrome.google.com/webstore/detail/web-vitals
```

### 4. Console (Development)

Open browser console - you'll see:
```
✅ [Web Vital] LCP: 1850ms (good)
✅ [Web Vital] FID: 45ms (good)
⚠️ [Web Vital] CLS: 0.15 (needs-improvement)
```

---

## 📈 Performance Budget

Set targets for your pages:

| Page Type | LCP Target | FID Target | CLS Target | Page Size |
|-----------|------------|------------|------------|-----------|
| Home | < 2.0s | < 100ms | < 0.05 | < 500KB |
| Listing | < 2.5s | < 100ms | < 0.1 | < 800KB |
| Search | < 2.0s | < 100ms | < 0.1 | < 600KB |
| Detail | < 2.5s | < 100ms | < 0.1 | < 1MB |

---

## 🚨 Common Pitfalls

### 1. Large Hero Images

**Problem:** Huge unoptimized hero images delay LCP

**Solution:**
```tsx
// Serve responsive images
<LazyImage
  src="/images/hero-1920.webp"
  alt="Hero"
  priority={true}
/>
```

### 2. Third-Party Scripts

**Problem:** Analytics, chat widgets, ads block the main thread

**Solution:**
```tsx
// Load non-critical scripts after page load
useEffect(() => {
  if (document.readyState === 'complete') {
    loadThirdPartyScript();
  } else {
    window.addEventListener('load', loadThirdPartyScript);
  }
}, []);
```

### 3. Layout Shifts from Fonts

**Problem:** Text flashes when custom font loads (FOIT/FOUT)

**Solution:**
```css
@font-face {
  font-family: 'YourFont';
  src: url('/fonts/your-font.woff2') format('woff2');
  font-display: swap; /* Show fallback immediately */
}
```

---

## 🎓 Further Reading

- [Web Vitals Official Guide](https://web.dev/vitals/)
- [Lighthouse Performance Scoring](https://web.dev/performance-scoring/)
- [Image Optimization Guide](https://web.dev/fast/#optimize-your-images)
- [Lazy Loading Guide](https://web.dev/lazy-loading/)

---

## ✅ Action Items

1. **Add monitoring** - Add `useWebVitals()` to App.tsx
2. **Replace images** - Convert all `<img>` to `<LazyImage>`
3. **Test** - Run Lighthouse in Chrome DevTools
4. **Monitor** - Check console for Web Vitals scores
5. **Optimize** - Fix any "poor" or "needs improvement" scores

---

**Need help?** Check the console logs or run Lighthouse to see specific recommendations.
