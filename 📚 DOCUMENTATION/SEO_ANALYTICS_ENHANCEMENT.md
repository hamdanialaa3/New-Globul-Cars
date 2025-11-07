# 🔍 SEO & Analytics Enhancement Guide
**الوقت المطلوب:** 3 ساعات  
**التكلفة:** €0  
**الأدوات:** Google Search Console + Schema.org + Open Graph

---

## 🎯 ما سنفعله (3 ساعات)

1. ✅ Google Search Console Setup (30 دقيقة)
2. ✅ Sitemap Generation & Submission (20 دقيقة)
3. ✅ Schema Markup (Structured Data) (45 دقيقة)
4. ✅ Open Graph & Twitter Cards (30 دقيقة)
5. ✅ Performance Optimization (30 دقيقة)
6. ✅ Testing & Validation (25 دقيقة)

---

## لماذا SEO Enhancement؟

### بدون SEO:
```
❌ لا يظهر في Google Search
❌ لا rich snippets (نتائج غنية)
❌ لا social media previews
❌ صعوبة الفهرسة (indexing)
❌ بطء الظهور في البحث (weeks/months)
```

### مع SEO Enhancement:
```
✅ ظهور في Google خلال 24-48 ساعة
✅ Rich snippets (⭐️ ratings, 💰 price, 📸 images)
✅ Beautiful social shares (Facebook, Twitter, LinkedIn)
✅ Google understands your content (structured data)
✅ Higher click-through rate (CTR)
✅ Better rankings
```

---

## الخطوة 1: Google Search Console Setup (30 دقيقة)

### 1.1 التسجيل

**1. انتقل إلى:**
```
https://search.google.com/search-console
```

**2. انقر "Add Property":**
```
اختر: Domain property (يغطي جميع subdomains + http/https)
Domain: globulcars.bg
```

**3. التحقق من Domain:**

**طريقة 1: DNS Verification (الأفضل)**
```
Google سيعطيك TXT record:

Type: TXT
Host: @ (أو globulcars.bg)
Value: google-site-verification=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TTL: 3600

أضفه في DNS settings:
- Cloudflare: DNS → Add record → TXT
- GoDaddy: DNS Management → Add TXT record
- Namecheap: Advanced DNS → Add New Record → TXT
```

**طريقة 2: HTML File Upload (بديل)**
```
1. Download: googlexxxxxxxxxxxx.html
2. ضعه في: bulgarian-car-marketplace/public/
3. Deploy: npm run build && firebase deploy --only hosting
4. تحقق: https://globulcars.bg/googlexxxxxxxxxxxx.html
```

**طريقة 3: Meta Tag (سريع)**
```html
<!-- في public/index.html داخل <head> -->
<meta name="google-site-verification" content="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
```

**4. انقر "Verify":**
```
انتظر 5-10 دقائق إذا DNS
أو فورًا إذا HTML/Meta Tag

✅ Verified: "Ownership verified"
```

---

### 1.2 إعداد Search Console

**1. Set Default Domain:**
```
Settings → Preferred Domain
اختر: https://globulcars.bg (with https, without www)
```

**2. Set Target Country:**
```
Settings → Target Country
اختر: Bulgaria
```

**3. Add Team Members (اختياري):**
```
Settings → Users and Permissions
Add user: developer@globulcars.bg (Full permission)
```

---

## الخطوة 2: Sitemap Generation & Submission (20 دقيقة)

### 2.1 Sitemap Generator (موجود مسبقًا)

**الملف:** `bulgarian-car-marketplace/src/utils/sitemap-generator.ts`

**تحديث (إضافة Bulgarian locale):**

```typescript
import { db } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  alternates?: Array<{ hreflang: string; href: string }>;
}

/**
 * Generate XML Sitemap
 */
export const generateSitemap = async (): Promise<string> => {
  const baseUrl = 'https://globulcars.bg';
  const urls: SitemapUrl[] = [];

  // ==========================================
  // Static Pages (با Bulgarian + English)
  // ==========================================
  const staticPages = [
    { path: '/', priority: 1.0, changefreq: 'daily' as const },
    { path: '/cars', priority: 0.9, changefreq: 'hourly' as const },
    { path: '/sell', priority: 0.8, changefreq: 'monthly' as const },
    { path: '/about', priority: 0.5, changefreq: 'monthly' as const },
    { path: '/contact', priority: 0.5, changefreq: 'monthly' as const },
    { path: '/pricing', priority: 0.7, changefreq: 'weekly' as const },
    { path: '/blog', priority: 0.6, changefreq: 'weekly' as const },
  ];

  staticPages.forEach(page => {
    urls.push({
      loc: `${baseUrl}${page.path}`,
      lastmod: new Date().toISOString(),
      changefreq: page.changefreq,
      priority: page.priority,
      alternates: [
        { hreflang: 'bg', href: `${baseUrl}${page.path}?lang=bg` },
        { hreflang: 'en', href: `${baseUrl}${page.path}?lang=en` },
        { hreflang: 'x-default', href: `${baseUrl}${page.path}` },
      ]
    });
  });

  // ==========================================
  // Dynamic Pages: Car Listings
  // ==========================================
  try {
    const carsSnapshot = await getDocs(
      query(collection(db, 'cars'), where('status', '==', 'approved'))
    );

    carsSnapshot.forEach(doc => {
      const car = doc.data();
      const carId = doc.id;
      
      urls.push({
        loc: `${baseUrl}/car/${carId}`,
        lastmod: car.updatedAt?.toDate().toISOString() || new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.8,
        alternates: [
          { hreflang: 'bg', href: `${baseUrl}/car/${carId}?lang=bg` },
          { hreflang: 'en', href: `${baseUrl}/car/${carId}?lang=en` },
          { hreflang: 'x-default', href: `${baseUrl}/car/${carId}` },
        ]
      });
    });

    console.log(`✅ Added ${carsSnapshot.size} car listings to sitemap`);
  } catch (error) {
    console.error('❌ Error fetching cars for sitemap:', error);
  }

  // ==========================================
  // Dynamic Pages: Seller Profiles
  // ==========================================
  try {
    const sellersSnapshot = await getDocs(
      query(collection(db, 'users'), where('role', 'in', ['dealer', 'company']))
    );

    sellersSnapshot.forEach(doc => {
      const seller = doc.data();
      const sellerId = doc.id;
      
      urls.push({
        loc: `${baseUrl}/seller/${sellerId}`,
        lastmod: seller.updatedAt?.toDate().toISOString() || new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.6,
      });
    });

    console.log(`✅ Added ${sellersSnapshot.size} seller profiles to sitemap`);
  } catch (error) {
    console.error('❌ Error fetching sellers for sitemap:', error);
  }

  // ==========================================
  // Dynamic Pages: Blog Posts (if exists)
  // ==========================================
  try {
    const blogSnapshot = await getDocs(collection(db, 'blog'));

    blogSnapshot.forEach(doc => {
      const post = doc.data();
      const postId = doc.id;
      
      urls.push({
        loc: `${baseUrl}/blog/${postId}`,
        lastmod: post.publishedAt?.toDate().toISOString() || new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.6,
        alternates: [
          { hreflang: 'bg', href: `${baseUrl}/blog/${postId}?lang=bg` },
          { hreflang: 'en', href: `${baseUrl}/blog/${postId}?lang=en` },
          { hreflang: 'x-default', href: `${baseUrl}/blog/${postId}` },
        ]
      });
    });

    console.log(`✅ Added ${blogSnapshot.size} blog posts to sitemap`);
  } catch (error) {
    console.error('❌ Error fetching blog posts for sitemap:', error);
  }

  // ==========================================
  // Generate XML
  // ==========================================
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  urls.forEach(url => {
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;
    if (url.lastmod) xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    if (url.changefreq) xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    if (url.priority) xml += `    <priority>${url.priority}</priority>\n`;
    
    // Add hreflang alternates
    if (url.alternates) {
      url.alternates.forEach(alt => {
        xml += `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${escapeXml(alt.href)}" />\n`;
      });
    }
    
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  return xml;
};

/**
 * Escape XML special characters
 */
const escapeXml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * Save sitemap to public folder
 */
export const saveSitemap = async (): Promise<void> => {
  const xml = await generateSitemap();
  const fs = await import('fs/promises');
  const path = await import('path');

  const publicDir = path.join(__dirname, '../../public');
  const sitemapPath = path.join(publicDir, 'sitemap.xml');

  await fs.writeFile(sitemapPath, xml, 'utf-8');
  console.log(`✅ Sitemap saved to: ${sitemapPath}`);
};
```

---

### 2.2 Generate Sitemap

**Create script:** `bulgarian-car-marketplace/scripts/generate-sitemap.js`

```javascript
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://globul-cars.firebaseio.com'
});

const db = admin.firestore();

async function generateSitemap() {
  const baseUrl = 'https://globulcars.bg';
  const urls = [];

  // Static pages
  const staticPages = [
    { path: '/', priority: 1.0, changefreq: 'daily' },
    { path: '/cars', priority: 0.9, changefreq: 'hourly' },
    { path: '/sell', priority: 0.8, changefreq: 'monthly' },
    { path: '/about', priority: 0.5, changefreq: 'monthly' },
    { path: '/contact', priority: 0.5, changefreq: 'monthly' },
    { path: '/pricing', priority: 0.7, changefreq: 'weekly' },
  ];

  staticPages.forEach(page => {
    urls.push({
      loc: `${baseUrl}${page.path}`,
      lastmod: new Date().toISOString(),
      changefreq: page.changefreq,
      priority: page.priority,
      alternates: [
        { hreflang: 'bg', href: `${baseUrl}${page.path}?lang=bg` },
        { hreflang: 'en', href: `${baseUrl}${page.path}?lang=en` },
      ]
    });
  });

  // Car listings
  const carsSnapshot = await db.collection('cars')
    .where('status', '==', 'approved')
    .get();

  carsSnapshot.forEach(doc => {
    const car = doc.data();
    urls.push({
      loc: `${baseUrl}/car/${doc.id}`,
      lastmod: car.updatedAt?.toDate().toISOString() || new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8,
      alternates: [
        { hreflang: 'bg', href: `${baseUrl}/car/${doc.id}?lang=bg` },
        { hreflang: 'en', href: `${baseUrl}/car/${doc.id}?lang=en` },
      ]
    });
  });

  console.log(`Added ${carsSnapshot.size} cars`);

  // Generate XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  urls.forEach(url => {
    xml += '  <url>\n';
    xml += `    <loc>${url.loc}</loc>\n`;
    if (url.lastmod) xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    if (url.changefreq) xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    if (url.priority) xml += `    <priority>${url.priority}</priority>\n`;
    
    if (url.alternates) {
      url.alternates.forEach(alt => {
        xml += `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />\n`;
      });
    }
    
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  // Save
  const publicDir = path.join(__dirname, '../public');
  const sitemapPath = path.join(publicDir, 'sitemap.xml');

  fs.writeFileSync(sitemapPath, xml, 'utf-8');
  console.log(`✅ Sitemap saved: ${sitemapPath}`);
  console.log(`Total URLs: ${urls.length}`);

  process.exit(0);
}

generateSitemap().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
```

**Add to package.json:**
```json
{
  "scripts": {
    "generate:sitemap": "node scripts/generate-sitemap.js"
  }
}
```

**Run:**
```bash
cd bulgarian-car-marketplace
npm run generate:sitemap
```

---

### 2.3 Submit to Google Search Console

**1. Upload sitemap:**
```
Google Search Console → Sitemaps → Add new sitemap
URL: https://globulcars.bg/sitemap.xml
انقر "Submit"
```

**2. تحقق من Status:**
```
بعد 5-10 دقائق:
Status: Success ✅
Discovered URLs: (عدد الصفحات)
```

**3. robots.txt (تحديث):**

**Create:** `bulgarian-car-marketplace/public/robots.txt`

```
# https://globulcars.bg/robots.txt

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard/
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Sitemap
Sitemap: https://globulcars.bg/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Specific bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Yandex
Allow: /
```

---

## الخطوة 3: Schema Markup (Structured Data) (45 دقيقة)

### 3.1 Car Listing Schema

**Create:** `bulgarian-car-marketplace/src/utils/schema-generator.ts`

```typescript
interface CarSchemaProps {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mileage: number;
  fuel: string;
  transmission: string;
  condition: 'new' | 'used';
  images: string[];
  description: string;
  sellerName: string;
  sellerType: 'private' | 'dealer' | 'company';
  location: {
    city: string;
    country: string;
  };
  datePublished: string;
  rating?: {
    value: number;
    count: number;
  };
}

/**
 * Generate Schema.org Product markup for car listing
 * https://schema.org/Product
 * https://schema.org/Car
 */
export const generateCarSchema = (car: CarSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    '@id': `https://globulcars.bg/car/${car.id}`,
    
    // Basic info
    name: `${car.make} ${car.model} ${car.year}`,
    description: car.description,
    image: car.images,
    
    // Product details
    brand: {
      '@type': 'Brand',
      name: car.make
    },
    model: car.model,
    productionDate: car.year.toString(),
    vehicleModelDate: car.year,
    
    // Condition
    itemCondition: car.condition === 'new' 
      ? 'https://schema.org/NewCondition'
      : 'https://schema.org/UsedCondition',
    
    // Mileage
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: car.mileage,
      unitCode: 'KMT' // Kilometers
    },
    
    // Fuel type
    fuelType: car.fuel,
    
    // Transmission
    vehicleTransmission: car.transmission,
    
    // Price
    offers: {
      '@type': 'Offer',
      price: car.price,
      priceCurrency: car.currency,
      availability: 'https://schema.org/InStock',
      url: `https://globulcars.bg/car/${car.id}`,
      seller: {
        '@type': car.sellerType === 'private' ? 'Person' : 'Organization',
        name: car.sellerName
      },
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 days
    },
    
    // Location
    availableAtOrFrom: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: car.location.city,
        addressCountry: car.location.country
      }
    },
    
    // Date published
    datePosted: car.datePublished,
    
    // Aggregated rating (if available)
    ...(car.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: car.rating.value,
        reviewCount: car.rating.count,
        bestRating: 5,
        worstRating: 1
      }
    })
  };

  return JSON.stringify(schema, null, 2);
};

/**
 * Generate Organization schema for seller
 */
export const generateOrganizationSchema = (seller: {
  name: string;
  type: 'private' | 'dealer' | 'company';
  logo?: string;
  description?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  phone?: string;
  email?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
  };
}) => {
  if (seller.type === 'private') return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': seller.type === 'company' ? 'Corporation' : 'AutoDealer',
    name: seller.name,
    description: seller.description,
    logo: seller.logo,
    
    ...(seller.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: seller.address.street,
        addressLocality: seller.address.city,
        postalCode: seller.address.postalCode,
        addressCountry: seller.address.country
      }
    }),
    
    ...(seller.phone && { telephone: seller.phone }),
    ...(seller.email && { email: seller.email }),
    
    ...(seller.socialMedia && {
      sameAs: [
        seller.socialMedia.facebook,
        seller.socialMedia.instagram
      ].filter(Boolean)
    })
  };

  return JSON.stringify(schema, null, 2);
};

/**
 * Generate BreadcrumbList schema
 */
export const generateBreadcrumbSchema = (breadcrumbs: Array<{ name: string; url: string }>) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  };

  return JSON.stringify(schema, null, 2);
};

/**
 * Generate WebSite schema (for homepage)
 */
export const generateWebsiteSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Globul Cars',
    alternateName: 'Globul Cars Bulgaria',
    url: 'https://globulcars.bg',
    description: 'Най-големият пазар за автомобили в България. Купувай и продавай автомобили бързо и лесно.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://globulcars.bg/cars?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    inLanguage: ['bg', 'en']
  };

  return JSON.stringify(schema, null, 2);
};
```

---

### 3.2 Add Schema to Car Details Page

**Update:** `bulgarian-car-marketplace/src/pages/CarDetailsPage/CarDetailsPage.tsx`

```typescript
import { Helmet } from 'react-helmet-async';
import { generateCarSchema, generateBreadcrumbSchema } from '@/utils/schema-generator';

export const CarDetailsPage = () => {
  const { carId } = useParams();
  const [car, setCar] = useState<Car | null>(null);
  
  // ... existing code ...

  if (!car) return <LoadingSpinner />;

  // Generate schemas
  const carSchema = generateCarSchema({
    id: carId!,
    make: car.make,
    model: car.model,
    year: car.year,
    price: car.price,
    currency: 'EUR',
    mileage: car.mileage,
    fuel: car.fuel,
    transmission: car.transmission,
    condition: car.condition,
    images: car.images,
    description: car.description,
    sellerName: car.sellerInfo?.name || 'Private Seller',
    sellerType: car.sellerInfo?.type || 'private',
    location: {
      city: car.locationData?.cityName.bg || 'София',
      country: 'Bulgaria'
    },
    datePublished: car.createdAt?.toDate().toISOString() || new Date().toISOString(),
    rating: car.rating ? {
      value: car.rating.average,
      count: car.rating.count
    } : undefined
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Начало', url: 'https://globulcars.bg' },
    { name: 'Автомобили', url: 'https://globulcars.bg/cars' },
    { name: `${car.make} ${car.model}`, url: `https://globulcars.bg/car/${carId}` }
  ]);

  return (
    <>
      <Helmet>
        <title>{car.make} {car.model} {car.year} - €{car.price.toLocaleString()}</title>
        <meta name="description" content={car.description} />
        
        {/* Schema.org structured data */}
        <script type="application/ld+json">{carSchema}</script>
        <script type="application/ld+json">{breadcrumbSchema}</script>
        
        {/* Open Graph */}
        <meta property="og:title" content={`${car.make} ${car.model} ${car.year}`} />
        <meta property="og:description" content={car.description} />
        <meta property="og:image" content={car.images[0]} />
        <meta property="og:url" content={`https://globulcars.bg/car/${carId}`} />
        <meta property="og:type" content="product" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${car.make} ${car.model} ${car.year}`} />
        <meta name="twitter:description" content={car.description} />
        <meta name="twitter:image" content={car.images[0]} />
      </Helmet>

      {/* Rest of component JSX */}
      {/* ... */}
    </>
  );
};
```

---

### 3.3 Add Schema to Homepage

**Update:** `bulgarian-car-marketplace/src/pages/HomePage/HomePage.tsx`

```typescript
import { Helmet } from 'react-helmet-async';
import { generateWebsiteSchema } from '@/utils/schema-generator';

export const HomePage = () => {
  const websiteSchema = generateWebsiteSchema();

  return (
    <>
      <Helmet>
        <title>Globul Cars - Купи или продай автомобил в България</title>
        <meta name="description" content="Най-големият пазар за автомобили в България. Над 10,000 обяви. Безплатна публикация. Купувай и продавай автомобили бързо и лесно." />
        
        {/* Schema.org */}
        <script type="application/ld+json">{websiteSchema}</script>
        
        {/* Open Graph */}
        <meta property="og:title" content="Globul Cars - България" />
        <meta property="og:description" content="Най-големият пазар за автомобили в България" />
        <meta property="og:image" content="https://globulcars.bg/og-image.jpg" />
        <meta property="og:url" content="https://globulcars.bg" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Rest of homepage */}
    </>
  );
};
```

---

## الخطوة 4: Open Graph & Twitter Cards (30 دقيقة)

### 4.1 Create OG Image

**Design:** `assets/images/og-image.jpg` (1200x630px)

**الموقع التوصيلي:** https://www.canva.com/

**المحتوى:**
```
- Logo: Globul Cars
- Tagline: Купи или продай автомобил в България
- Background: Gradient (Orange #FF8F10 → Red #FF6600)
- Car illustration
- Size: 1200x630px (Facebook/LinkedIn standard)
```

**Upload:**
```bash
# Upload to Firebase Storage
firebase storage:upload assets/images/og-image.jpg /images/og-image.jpg
```

**Or use Cloudinary (faster):**
```
Upload to Cloudinary
Get URL: https://res.cloudinary.com/globul-cars/image/upload/v1/og-image.jpg
```

---

### 4.2 Dynamic OG Images for Cars

**Create Cloud Function:** `functions/src/og-image/generate-og-image.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Generate dynamic OG image URL for car listing
 * Uses URL parameters to create image on-the-fly
 */
export const generateCarOgImage = functions
  .region('europe-west1')
  .https
  .onRequest(async (req, res) => {
    const { carId } = req.query;

    if (!carId) {
      res.status(400).send('Missing carId parameter');
      return;
    }

    try {
      const db = admin.firestore();
      const carDoc = await db.collection('cars').doc(carId as string).get();

      if (!carDoc.exists) {
        res.status(404).send('Car not found');
        return;
      }

      const car = carDoc.data()!;

      // Use service like Cloudinary or Imgix to generate OG image
      // For now, redirect to car's first image
      const ogImageUrl = car.images[0] || 'https://globulcars.bg/og-image-default.jpg';

      res.redirect(ogImageUrl);
    } catch (error) {
      console.error('Error generating OG image:', error);
      res.status(500).send('Error generating OG image');
    }
  });
```

---

### 4.3 SEO Component (Enhanced)

**Update:** `bulgarian-car-marketplace/src/components/SEO/SEO.tsx`

```typescript
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
  };
  product?: {
    price?: number;
    currency?: string;
    availability?: 'instock' | 'outofstock';
  };
  schema?: string; // JSON-LD structured data
  canonical?: string;
  noindex?: boolean;
  locale?: 'bg' | 'en';
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image = 'https://globulcars.bg/og-image.jpg',
  url = 'https://globulcars.bg',
  type = 'website',
  article,
  product,
  schema,
  canonical,
  noindex = false,
  locale = 'bg'
}) => {
  const siteName = 'Globul Cars';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical || url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <html lang={locale === 'bg' ? 'bg-BG' : 'en-US'} />

      {/* Open Graph */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={locale === 'bg' ? 'bg_BG' : 'en_US'} />
      <meta property="og:locale:alternate" content={locale === 'bg' ? 'en_US' : 'bg_BG'} />

      {/* Article-specific OG tags */}
      {type === 'article' && article && (
        <>
          {article.publishedTime && <meta property="article:published_time" content={article.publishedTime} />}
          {article.modifiedTime && <meta property="article:modified_time" content={article.modifiedTime} />}
          {article.author && <meta property="article:author" content={article.author} />}
          {article.tags?.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Product-specific OG tags */}
      {type === 'product' && product && (
        <>
          {product.price && (
            <>
              <meta property="product:price:amount" content={product.price.toString()} />
              <meta property="product:price:currency" content={product.currency || 'EUR'} />
            </>
          )}
          {product.availability && <meta property="product:availability" content={product.availability} />}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@GlobulCars" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Schema.org structured data */}
      {schema && <script type="application/ld+json">{schema}</script>}

      {/* Alternate languages */}
      <link rel="alternate" hrefLang="bg" href={`${url}?lang=bg`} />
      <link rel="alternate" hrefLang="en" href={`${url}?lang=en`} />
      <link rel="alternate" hrefLang="x-default" href={url} />
    </Helmet>
  );
};
```

---

## الخطوة 5: Performance Optimization (30 دقيقة)

### 5.1 Image Optimization

**Already done** in previous optimizations, but verify:

```typescript
// src/components/OptimizedImage.tsx
import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  className?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  loading = 'lazy',
  className
}) => {
  // Generate WebP version if using Cloudinary/Imgix
  const webpSrc = src.includes('cloudinary') 
    ? src.replace(/\.(jpg|jpeg|png)/, '.webp')
    : src;

  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        className={className}
        decoding="async"
      />
    </picture>
  );
};
```

---

### 5.2 Core Web Vitals Optimization

**Update:** `bulgarian-car-marketplace/src/utils/performance-monitoring.ts`

```typescript
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

/**
 * Monitor Core Web Vitals
 */
export const initPerformanceMonitoring = () => {
  const sendToAnalytics = (metric: any) => {
    // Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${metric.name}:`, metric.value);
    }
  };

  onCLS(sendToAnalytics); // Cumulative Layout Shift
  onFID(sendToAnalytics); // First Input Delay
  onFCP(sendToAnalytics); // First Contentful Paint
  onLCP(sendToAnalytics); // Largest Contentful Paint
  onTTFB(sendToAnalytics); // Time to First Byte
};

// Initialize in App.tsx
// useEffect(() => { initPerformanceMonitoring(); }, []);
```

---

## الخطوة 6: Testing & Validation (25 دقيقة)

### 6.1 Rich Results Test

**Google Rich Results Test:**
```
https://search.google.com/test/rich-results

Enter URL: https://globulcars.bg/car/[any-car-id]

Expected results:
✅ Product schema detected
✅ Price visible
✅ Availability visible
✅ Image visible
✅ Rating visible (if exists)
```

---

### 6.2 Schema Markup Validator

**Schema.org Validator:**
```
https://validator.schema.org/

Paste your schema JSON or URL

Expected:
✅ No errors
✅ All required fields present
⚠️ Warnings are OK (optional fields)
```

---

### 6.3 Open Graph Debugger

**Facebook Sharing Debugger:**
```
https://developers.facebook.com/tools/debug/

Enter URL: https://globulcars.bg/car/[car-id]

Expected:
✅ Image: 1200x630px
✅ Title: Car make/model/year
✅ Description: Car description
✅ URL: Canonical URL
```

**LinkedIn Post Inspector:**
```
https://www.linkedin.com/post-inspector/

Enter URL: https://globulcars.bg

Expected:
✅ Professional preview
✅ Image displays correctly
```

**Twitter Card Validator:**
```
https://cards-dev.twitter.com/validator

Enter URL: https://globulcars.bg/car/[car-id]

Expected:
✅ summary_large_image card
✅ Image preview
✅ Title and description
```

---

### 6.4 PageSpeed Insights

**Google PageSpeed Insights:**
```
https://pagespeed.web.dev/

Enter URL: https://globulcars.bg

Target scores:
- Performance: >90 (green)
- Accessibility: >95
- Best Practices: >95
- SEO: 100 ✅

Key metrics:
- FCP: <1.8s
- LCP: <2.5s
- CLS: <0.1
- FID: <100ms
```

---

### 6.5 Mobile-Friendly Test

**Google Mobile-Friendly Test:**
```
https://search.google.com/test/mobile-friendly

Enter URL: https://globulcars.bg

Expected:
✅ Page is mobile-friendly
✅ Text is readable
✅ Links are not too close
✅ Viewport is set
```

---

## 📊 Monitoring & Analytics

### Track SEO Performance in Search Console

**1. Performance Report:**
```
Search Console → Performance

Metrics to monitor:
- Total clicks
- Total impressions
- Average CTR (target: >3%)
- Average position (target: <10)

Filters:
- By country: Bulgaria
- By device: Mobile vs Desktop
- By query: Top search terms
```

**2. Coverage Report:**
```
Search Console → Coverage

Check:
✅ All pages indexed
❌ Pages with errors
⚠️ Pages with warnings

Fix errors immediately!
```

**3. Enhancements:**
```
Search Console → Enhancements

Check:
- Rich results (Products): ✅ Valid
- Breadcrumbs: ✅ Valid
- Sitelinks searchbox: ✅ Valid
```

---

### Track Core Web Vitals

**Search Console → Core Web Vitals:**
```
Mobile:
- Good URLs: >75%
- Needs improvement: <20%
- Poor URLs: <5%

Desktop:
- Good URLs: >90%
```

---

## ✅ Checklist النهائي

Setup:
- [x] Google Search Console account created
- [ ] Domain verified (DNS TXT record or HTML file)
- [ ] Sitemap generated (npm run generate:sitemap)
- [ ] Sitemap submitted to Search Console
- [ ] robots.txt created and deployed

Schema Markup:
- [x] schema-generator.ts created
- [ ] Car schema added to CarDetailsPage
- [ ] Website schema added to HomePage
- [ ] Breadcrumb schema added to relevant pages
- [ ] Organization schema added to seller pages (if dealer/company)

Open Graph:
- [ ] OG image created (1200x630px)
- [ ] OG tags added to all pages
- [ ] Twitter Card tags added
- [ ] Tested with Facebook Debugger
- [ ] Tested with Twitter Card Validator

Performance:
- [ ] OptimizedImage component used throughout
- [ ] Performance monitoring initialized
- [ ] Core Web Vitals tracked
- [ ] PageSpeed score >90

Testing:
- [ ] Rich Results Test passed
- [ ] Schema validator passed (no errors)
- [ ] Mobile-Friendly Test passed
- [ ] All pages indexed in Search Console

---

## 🎉 النتيجة النهائية

بعد 3 ساعات، لديك:
- ✅ Google Search Console setup
- ✅ Sitemap auto-generated + submitted
- ✅ Rich snippets (⭐️ ratings, 💰 price, 📸 images)
- ✅ Beautiful social shares
- ✅ Structured data (Schema.org)
- ✅ Performance optimized (Core Web Vitals)
- ✅ Mobile-friendly
- ✅ Indexed in 24-48 hours

**التكلفة:** €0  
**القيمة:** Higher rankings + More organic traffic! 🚀

---

## 📞 الخطوة التالية

**Task 6:** Monitoring Setup (Sentry + UptimeRobot)

انتقل إلى: `MONITORING_SETUP.md`
