// functions/src/seo/prerender.ts
// Prerender Cloud Function - SEO Prerendering for Koli One
// وظيفة Prerender للـ SEO

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

const logger = functions.logger;

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Cache for prerendered HTML (in-memory, could be replaced with Redis)
const htmlCache = new Map<string, { html: string; timestamp: number }>();
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

/**
 * Check if URL should be prerendered
 */
function isPrerenderable(url: string): boolean {
  if (!url) return false;

  // URLs that should be prerendered
  const prerenderablePatterns = [
    /^\/$/,
    /^\/koli\/?$/,
    /^\/koli\/[^\/]+$/, // /koli/sofia
    /^\/koli\/[^\/]+\/[^\/]+$/, // /koli/sofia/bmw
    /^\/car\/\d+\/\d+$/, // /car/80/5
    /^\/profile\/\d+$/, // /profile/18
    /^\/marka\/[^\/]+$/, // /marka/bmw
    /^\/search\/?$/, // /search
    /^\/sell\/?$/, // /sell
    /^\/about\/?$/, // /about
    /^\/contact\/?$/, // /contact
    /^\/privacy\/?$/, // /privacy
    /^\/terms\/?$/, // /terms
    /^\/financing\/?$/, // /financing
  ];

  return prerenderablePatterns.some(pattern => pattern.test(url));
}

/**
 * Fetch page data based on URL
 */
async function fetchPageData(url: string): Promise<any> {
  try {
    // Homepage
    if (url === '/' || url === '') {
      return {
        type: 'homepage',
        title: 'Koli One - Продажба на коли в България',
        description:
          'Намерете идеалния автомобил в България. Над 10,000 обяви от частни лица, автосалони и компании.',
      };
    }

    // City page: /koli/sofia
    const cityMatch = url.match(/^\/koli\/([^\/]+)$/);
    if (cityMatch) {
      const citySlug = cityMatch[1];
      const cityData = await getCityPageData(citySlug);
      return {
        type: 'city',
        ...cityData,
      };
    }

    // Brand in City: /koli/sofia/bmw
    const brandCityMatch = url.match(/^\/koli\/([^\/]+)\/([^\/]+)$/);
    if (brandCityMatch) {
      const [, citySlug, brandSlug] = brandCityMatch;
      const brandCityData = await getBrandCityPageData(citySlug, brandSlug);
      return {
        type: 'brand-city',
        ...brandCityData,
      };
    }

    // Car detail: /car/80/5
    const carMatch = url.match(/^\/car\/(\d+)\/(\d+)$/);
    if (carMatch) {
      const [, sellerNumericId, carNumericId] = carMatch;
      const carData = await getCarPageData(
        parseInt(sellerNumericId),
        parseInt(carNumericId)
      );
      return {
        type: 'car',
        ...carData,
      };
    }

    // Profile: /profile/18
    const profileMatch = url.match(/^\/profile\/(\d+)$/);
    if (profileMatch) {
      const numericId = parseInt(profileMatch[1]);
      const profileData = await getProfilePageData(numericId);
      return {
        type: 'profile',
        ...profileData,
      };
    }

    // Brand page: /marka/bmw
    const markaMatch = url.match(/^\/marka\/([^\/]+)$/);
    if (markaMatch) {
      const brandSlug = markaMatch[1];
      const brand =
        brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1).toLowerCase();
      return {
        type: 'brand',
        title: `${brand} коли в България - Продажба на ${brand} автомобили | Koli One`,
        description: `Намерете ${brand} автомобили за продажба в България. Нови и употребявани ${brand} коли от частни продавачи и автосалони на Koli One.`,
        brand,
        brandSlug,
      };
    }

    // Static pages with SEO content
    const staticPages: Record<string, { title: string; description: string }> =
      {
        '/search': {
          title:
            'Търсене на коли в България - Филтриране по марка, цена, град | Koli One',
          description:
            'Търсете перфектния автомобил в България. Филтрирайте по марка, модел, цена, година, гориво, местоположение и много други на Koli One.',
        },
        '/sell': {
          title: 'Продайте колата си безплатно в България | Koli One',
          description:
            'Публикувайте безплатна обява за продажба на вашия автомобил. Достигнете до хиляди купувачи в София, Пловдив, Варна, Бургас и цяла България.',
        },
        '/about': {
          title: 'За нас - Koli One | Българска платформа за автомобили',
          description:
            'Koli One е водещата българска онлайн платформа за покупка и продажба на автомобили. Свързваме купувачи и продавачи в цяла България.',
        },
        '/contact': {
          title: 'Контакти - Koli One | Свържете се с нас',
          description:
            'Свържете се с екипа на Koli One. Помощ при покупка, продажба или въпроси за платформата. Бърза поддръжка за всички потребители.',
        },
        '/privacy': {
          title: 'Политика за поверителност | Koli One',
          description:
            'Научете как Koli One защитава вашите лични данни. Политика за поверителност и обработка на данни съгласно GDPR.',
        },
        '/terms': {
          title: 'Общи условия | Koli One',
          description:
            'Общи условия за ползване на платформата Koli One за покупка и продажба на автомобили в България.',
        },
        '/financing': {
          title: 'Финансиране на автомобили в България | Koli One',
          description:
            'Информация за финансиране и кредитиране при покупка на автомобил в България. Лизинг, банков кредит и други опции.',
        },
      };

    const normalized = url.replace(/\/$/, '') || '/';
    const staticPage = staticPages[normalized];
    if (staticPage) {
      return {
        type: 'static',
        ...staticPage,
      };
    }

    return null;
  } catch (error) {
    logger.error('Error fetching page data:', error);
    return null;
  }
}

/**
 * Get city page data
 */
async function getCityPageData(citySlug: string): Promise<any> {
  const cityMap: Record<string, { bg: string; region: string }> = {
    sofia: { bg: 'София', region: 'София-град' },
    plovdiv: { bg: 'Пловдив', region: 'Пловдив' },
    varna: { bg: 'Варна', region: 'Варна' },
    burgas: { bg: 'Бургас', region: 'Бургас' },
    'stara-zagora': { bg: 'Стара Загора', region: 'Стара Загора' },
    ruse: { bg: 'Русе', region: 'Русе' },
    pleven: { bg: 'Плевен', region: 'Плевен' },
    sliven: { bg: 'Сливен', region: 'Сливен' },
    dobrich: { bg: 'Добрич', region: 'Добрич' },
    shumen: { bg: 'Шумен', region: 'Шумен' },
    pernik: { bg: 'Перник', region: 'Перник' },
    haskovo: { bg: 'Хасково', region: 'Хасково' },
    yambol: { bg: 'Ямбол', region: 'Ямбол' },
    pazardzhik: { bg: 'Пазарджик', region: 'Пазарджик' },
    blagoevgrad: { bg: 'Благоевград', region: 'Благоевград' },
    'veliko-tarnovo': { bg: 'Велико Търново', region: 'Велико Търново' },
    vratsa: { bg: 'Враца', region: 'Враца' },
    gabrovo: { bg: 'Габрово', region: 'Габрово' },
    asenovgrad: { bg: 'Асеновград', region: 'Пловдив' },
    vidin: { bg: 'Видин', region: 'Видин' },
    kazanlak: { bg: 'Казанлък', region: 'Стара Загора' },
    kyustendil: { bg: 'Кюстендил', region: 'Кюстендил' },
    montana: { bg: 'Монтана', region: 'Монтана' },
    dimitrovgrad: { bg: 'Димитровград', region: 'Хасково' },
    lovech: { bg: 'Ловеч', region: 'Ловеч' },
    silistra: { bg: 'Силистра', region: 'Силистра' },
    targovishte: { bg: 'Търговище', region: 'Търговище' },
    dupnitsa: { bg: 'Дупница', region: 'Кюстендил' },
    razgrad: { bg: 'Разград', region: 'Разград' },
    kardzhali: { bg: 'Кърджали', region: 'Кърджали' },
    smolyan: { bg: 'Смолян', region: 'Смолян' },
  };

  const cityInfo = cityMap[citySlug.toLowerCase()];
  if (!cityInfo) {
    return {
      title: 'Коли в България',
      description: 'Намерете автомобили в България',
      city: citySlug,
    };
  }

  // Get car count for city (simplified - should query Firestore)
  const carsSnapshot = await db
    .collection('cars')
    .where('location', '==', cityInfo.bg)
    .where('isActive', '==', true)
    .limit(1)
    .get();

  const totalCars = carsSnapshot.size; // This is just a sample count

  return {
    title: `Продажба на коли в ${cityInfo.bg} - Koli One`,
    description: `Намерете идеалния автомобил в ${cityInfo.bg}. Над ${totalCars} обяви от частни лица, автосалони и компании.`,
    city: cityInfo.bg,
    citySlug,
    region: cityInfo.region,
    totalCars,
  };
}

/**
 * Get brand in city page data
 */
async function getBrandCityPageData(
  citySlug: string,
  brandSlug: string
): Promise<any> {
  const cityMap: Record<string, { bg: string }> = {
    sofia: { bg: 'София' },
    plovdiv: { bg: 'Пловдив' },
    varna: { bg: 'Варна' },
    burgas: { bg: 'Бургас' },
    'stara-zagora': { bg: 'Стара Загора' },
    ruse: { bg: 'Русе' },
    pleven: { bg: 'Плевен' },
    sliven: { bg: 'Сливен' },
    dobrich: { bg: 'Добрич' },
    shumen: { bg: 'Шумен' },
    pernik: { bg: 'Перник' },
    haskovo: { bg: 'Хасково' },
    yambol: { bg: 'Ямбол' },
    pazardzhik: { bg: 'Пазарджик' },
    blagoevgrad: { bg: 'Благоевград' },
    'veliko-tarnovo': { bg: 'Велико Търново' },
    vratsa: { bg: 'Враца' },
    gabrovo: { bg: 'Габрово' },
    asenovgrad: { bg: 'Асеновград' },
    vidin: { bg: 'Видин' },
    kazanlak: { bg: 'Казанлък' },
    kyustendil: { bg: 'Кюстендил' },
    montana: { bg: 'Монтана' },
    dimitrovgrad: { bg: 'Димитровград' },
    lovech: { bg: 'Ловеч' },
    silistra: { bg: 'Силистра' },
    targovishte: { bg: 'Търговище' },
    dupnitsa: { bg: 'Дупница' },
    razgrad: { bg: 'Разград' },
    kardzhali: { bg: 'Кърджали' },
    smolyan: { bg: 'Смолян' },
  };

  const cityInfo = cityMap[citySlug.toLowerCase()];
  const brand =
    brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1).toLowerCase();

  return {
    title: `${brand} в ${cityInfo?.bg || citySlug} - Продажба на коли`,
    description: `Намерете ${brand} автомобили в ${cityInfo?.bg || citySlug}. Голям избор от нови и употребявани коли.`,
    city: cityInfo?.bg || citySlug,
    citySlug,
    brand,
    brandSlug,
  };
}

/**
 * Get car detail page data
 */
async function getCarPageData(
  sellerNumericId: number,
  carNumericId: number
): Promise<any> {
  try {
    // Find user by numeric ID
    const usersSnapshot = await db
      .collection('users')
      .where('numericId', '==', sellerNumericId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return null;
    }

    const userId = usersSnapshot.docs[0].id;
    const userData = usersSnapshot.docs[0].data();

    // Find car by numeric ID
    const collections = [
      'cars',
      'passenger_cars',
      'suvs',
      'vans',
      'motorcycles',
      'trucks',
      'buses',
    ];

    for (const collectionName of collections) {
      const carsSnapshot = await db
        .collection(collectionName)
        .where('sellerId', '==', userId)
        .where('carNumericId', '==', carNumericId)
        .limit(1)
        .get();

      if (!carsSnapshot.empty) {
        const carData = carsSnapshot.docs[0].data();
        return {
          title: `${carData.make || ''} ${carData.model || ''} ${carData.firstRegistration || carData.year || ''} - ${carData.price || 0} лв.`,
          description: `${carData.make || ''} ${carData.model || ''} в ${carData.location || ''}. ${carData.description || ''}`,
          make: carData.make,
          model: carData.model,
          year: carData.firstRegistration || carData.year,
          price: carData.price || carData.netPrice,
          location: carData.location,
          sellerName: userData.displayName || userData.name,
          sellerType: userData.profileType || 'private',
        };
      }
    }

    return null;
  } catch (error) {
    logger.error('Error getting car data:', error);
    return null;
  }
}

/**
 * Get profile page data
 */
async function getProfilePageData(numericId: number): Promise<any> {
  try {
    const usersSnapshot = await db
      .collection('users')
      .where('numericId', '==', numericId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return null;
    }

    const userData = usersSnapshot.docs[0].data();

    return {
      title: `${userData.displayName || userData.name || 'Профил'} - Koli One`,
      description: `Профил на ${userData.profileType === 'dealer' ? 'автосалон' : userData.profileType === 'company' ? 'компания' : 'продавач'}: ${userData.displayName || userData.name}`,
      name: userData.displayName || userData.name,
      profileType: userData.profileType || 'private',
    };
  } catch (error) {
    logger.error('Error getting profile data:', error);
    return null;
  }
}

/**
 * Generate prerendered HTML with full SEO tags
 * Includes: hreflang, OpenGraph, Twitter Cards, JSON-LD
 */
function generatePrerenderedHTML(data: any): string {
  if (!data) {
    return '<html><body><h1>Page not found</h1></body></html>';
  }

  const structuredData = generateBulgarianStructuredData(data);
  const baseUrl = 'https://koli.one';
  const canonicalUrl = `${baseUrl}${data.url || ''}`;
  const ogImage = data.image || `${baseUrl}/og-image.png`;

  return `<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title || 'Koli One'}</title>
  <meta name="description" content="${data.description || ''}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  
  <!-- Canonical & hreflang -->
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="alternate" hreflang="bg" href="${canonicalUrl}">
  <link rel="alternate" hreflang="x-default" href="${canonicalUrl}">
  
  <!-- Geo-targeting -->
  <meta name="geo.region" content="BG">
  <meta name="geo.placename" content="Bulgaria">
  <meta http-equiv="content-language" content="bg">
  
  <!-- OpenGraph -->
  <meta property="og:type" content="${data.type === 'car' ? 'product' : 'website'}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${data.title || 'Koli One'}">
  <meta property="og:description" content="${data.description || ''}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:site_name" content="Koli One">
  <meta property="og:locale" content="bg_BG">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${data.title || 'Koli One'}">
  <meta name="twitter:description" content="${data.description || ''}">
  <meta name="twitter:image" content="${ogImage}">
  
  <!-- Price for products -->
  ${
    data.price
      ? `
  <meta property="product:price:amount" content="${data.price}">
  <meta property="product:price:currency" content="BGN">
  `
      : ''
  }
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
    ${JSON.stringify(structuredData, null, 2)}
  </script>
</head>
<body>
  <div id="root">
    <h1>${data.title || 'Koli One'}</h1>
    <p>${data.description || ''}</p>
    <!-- React app will hydrate here -->
  </div>
  <script src="/static/js/main.js"></script>
</body>
</html>`;
}

/**
 * Generate Bulgarian Structured Data
 */
function generateBulgarianStructuredData(data: any): any {
  const base = {
    '@context': 'https://schema.org',
  };

  switch (data.type) {
    case 'car':
      return {
        ...base,
        '@type': 'Car',
        name: `${data.make} ${data.model}`,
        description: data.description,
        brand: {
          '@type': 'Brand',
          name: data.make,
        },
        model: data.model,
        productionDate: data.year ? `${data.year}` : undefined,
        offers: {
          '@type': 'Offer',
          price: data.price,
          priceCurrency: 'BGN',
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': data.sellerType === 'dealer' ? 'AutoDealer' : 'Person',
            name: data.sellerName,
          },
        },
        purchaseLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'BG',
            addressLocality: data.location,
          },
        },
      };

    case 'city':
      return {
        ...base,
        '@type': 'WebPage',
        name: data.title,
        description: data.description,
        about: {
          '@type': 'City',
          name: data.city,
          addressCountry: 'BG',
        },
      };

    case 'brand-city':
      return {
        ...base,
        '@type': 'CollectionPage',
        name: data.title,
        description: data.description,
        about: {
          '@type': 'Product',
          brand: {
            '@type': 'Brand',
            name: data.brand,
          },
        },
      };

    default:
      return {
        ...base,
        '@type': 'WebPage',
        name: data.title || 'Koli One',
        description: data.description || '',
      };
  }
}

/**
 * Prerender Cloud Function
 */
export const prerender = functions
  .runWith({
    memory: '512MB',
    timeoutSeconds: 60,
  })
  .https.onRequest(async (req, res): Promise<void> => {
    try {
      // 301 redirect from mobilebg.eu to koli.one
      const host = req.hostname || req.headers.host || '';
      if (host.includes('mobilebg.eu')) {
        const targetUrl = `https://koli.one${req.originalUrl || req.url || '/'}`;
        res.set('Location', targetUrl);
        res.status(301).send(`Redirecting to ${targetUrl}`);
        return;
      }

      const url = (req.query.url as string) || req.path;

      // Check cache
      const cached = htmlCache.get(url);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        res.set('Content-Type', 'text/html');
        res.set('Cache-Control', 'public, max-age=21600'); // 6 hours
        res.send(cached.html);
        return;
      }

      // Check if prerenderable
      if (!isPrerenderable(url)) {
        // Return SPA template for non-prerenderable pages
        const spaTemplate = `<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Koli One</title>
</head>
<body>
  <div id="root"></div>
  <script src="/static/js/main.js"></script>
</body>
</html>`;
        res.set('Content-Type', 'text/html');
        res.send(spaTemplate);
        return;
      }

      // Fetch page data
      const pageData = await fetchPageData(url);
      if (!pageData) {
        res.status(404).send('Page not found');
        return;
      }

      // Generate HTML
      const html = generatePrerenderedHTML({ ...pageData, url });

      // Cache HTML
      htmlCache.set(url, {
        html,
        timestamp: Date.now(),
      });

      // Clear old cache entries (keep last 100)
      if (htmlCache.size > 100) {
        const entries = Array.from(htmlCache.entries());
        entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
        htmlCache.clear();
        entries.slice(0, 100).forEach(([key, value]) => {
          htmlCache.set(key, value);
        });
      }

      res.set('Content-Type', 'text/html');
      res.set('Cache-Control', 'public, max-age=21600'); // 6 hours
      res.send(html);
    } catch (error) {
      logger.error('Prerender error:', error);
      res.status(500).send('Error generating prerendered HTML');
    }
  });
