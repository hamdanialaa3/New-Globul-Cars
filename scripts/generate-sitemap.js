/**
 * Sitemap Generator for Globul Cars
 * Generates sitemap.xml with all pages (static + dynamic)
 * Run: node scripts/generate-sitemap.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
// Load service account from environment variable (SECURE)
function loadServiceAccount() {
    // Option 1: From environment variable
    const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (envKey) {
        try {
            const sa = JSON.parse(envKey);
            if (sa.private_key) {
                sa.private_key = sa.private_key.replace(/\\n/g, '\n');
            }
            return sa;
        } catch (e) {
            console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY');
        }
    }

    // Option 2: From .env.local file
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('#')) return;
            const idx = line.indexOf('=');
            if (idx !== -1) {
                const key = line.substring(0, idx).trim();
                let val = line.substring(idx + 1).trim();
                if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                    val = val.slice(1, -1);
                }
                env[key] = val;
            }
        });
        if (env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY);
            if (sa.private_key) {
                sa.private_key = sa.private_key.replace(/\\n/g, '\n');
            }
            return sa;
        }
    }

    console.error('❌ No service account found!');
    console.error('   Set FIREBASE_SERVICE_ACCOUNT_KEY env variable or add it to .env.local');
    process.exit(1);
}

const serviceAccount = loadServiceAccount();

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
}

const db = admin.firestore();

// Base URL
const BASE_URL = 'https://globulcars.bg';

// Static pages
const STATIC_PAGES = [
  { url: '/', priority: 1.0, changefreq: 'daily', langs: ['bg', 'en'] },
  { url: '/cars', priority: 0.9, changefreq: 'hourly', langs: ['bg', 'en'] },
  { url: '/sell', priority: 0.8, changefreq: 'weekly', langs: ['bg', 'en'] },
  { url: '/about', priority: 0.5, changefreq: 'monthly', langs: ['bg', 'en'] },
  { url: '/contact', priority: 0.5, changefreq: 'monthly', langs: ['bg', 'en'] },
  { url: '/pricing', priority: 0.7, changefreq: 'weekly', langs: ['bg', 'en'] },
  { url: '/faq', priority: 0.5, changefreq: 'monthly', langs: ['bg', 'en'] },
  { url: '/privacy', priority: 0.3, changefreq: 'yearly', langs: ['bg', 'en'] },
  { url: '/terms', priority: 0.3, changefreq: 'yearly', langs: ['bg', 'en'] },
];

/**
 * Escape XML special characters
 */
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Generate URL entry with hreflang alternates
 */
function generateUrlEntry(url, priority, changefreq, lastmod, langs = ['bg', 'en']) {
  const entries = [];
  
  // Main URL (Bulgarian by default)
  entries.push(`  <url>`);
  entries.push(`    <loc>${escapeXml(BASE_URL + url)}</loc>`);
  
  if (lastmod) {
    entries.push(`    <lastmod>${lastmod}</lastmod>`);
  }
  
  entries.push(`    <changefreq>${changefreq}</changefreq>`);
  entries.push(`    <priority>${priority}</priority>`);
  
  // Add hreflang alternates
  langs.forEach(lang => {
    const langUrl = lang === 'bg' ? url : `/${lang}${url}`;
    entries.push(`    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(BASE_URL + langUrl)}" />`);
  });
  
  entries.push(`  </url>`);
  
  return entries.join('\n');
}

/**
 * Fetch all approved car listings
 */
async function fetchCarListings() {
  console.log('📥 Fetching car listings...');
  
  const snapshot = await db.collection('cars')
    .where('status', '==', 'approved')
    .get();
  
  const cars = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    cars.push({
      id: doc.id,
      updatedAt: data.updatedAt?.toDate() || data.createdAt?.toDate() || new Date(),
    });
  });
  
  console.log(`✅ Found ${cars.length} car listings`);
  return cars;
}

/**
 * Fetch all active seller profiles
 */
async function fetchSellerProfiles() {
  console.log('📥 Fetching seller profiles...');
  
  const snapshot = await db.collection('users')
    .where('profileType', 'in', ['dealer', 'company'])
    .get();
  
  const sellers = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    sellers.push({
      id: doc.id,
      updatedAt: data.updatedAt?.toDate() || data.createdAt?.toDate() || new Date(),
    });
  });
  
  console.log(`✅ Found ${sellers.length} seller profiles`);
  return sellers;
}

/**
 * Generate sitemap XML
 */
async function generateSitemap() {
  console.log('🚀 Starting sitemap generation...\n');
  
  const sitemapEntries = [];
  
  // XML header
  sitemapEntries.push('<?xml version="1.0" encoding="UTF-8"?>');
  sitemapEntries.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  sitemapEntries.push('        xmlns:xhtml="http://www.w3.org/1999/xhtml">');
  
  // Static pages
  console.log('📄 Adding static pages...');
  STATIC_PAGES.forEach(page => {
    sitemapEntries.push(
      generateUrlEntry(page.url, page.priority, page.changefreq, null, page.langs)
    );
  });
  console.log(`✅ Added ${STATIC_PAGES.length} static pages\n`);
  
  // Car listings
  const cars = await fetchCarListings();
  console.log('🚗 Adding car listings...');
  cars.forEach(car => {
    const lastmod = car.updatedAt.toISOString().split('T')[0];
    sitemapEntries.push(
      generateUrlEntry(`/car/${car.id}`, 0.8, 'weekly', lastmod, ['bg', 'en'])
    );
  });
  console.log(`✅ Added ${cars.length} car listings\n`);
  
  // Seller profiles
  const sellers = await fetchSellerProfiles();
  console.log('👤 Adding seller profiles...');
  sellers.forEach(seller => {
    const lastmod = seller.updatedAt.toISOString().split('T')[0];
    sitemapEntries.push(
      generateUrlEntry(`/seller/${seller.id}`, 0.6, 'weekly', lastmod, ['bg', 'en'])
    );
  });
  console.log(`✅ Added ${sellers.length} seller profiles\n`);
  
  // XML footer
  sitemapEntries.push('</urlset>');
  
  // Write to file
  const sitemap = sitemapEntries.join('\n');
  const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  
  fs.writeFileSync(outputPath, sitemap, 'utf8');
  
  console.log('✅ Sitemap generated successfully!');
  console.log(`📁 Location: ${outputPath}`);
  console.log(`📊 Total URLs: ${STATIC_PAGES.length + cars.length + sellers.length}`);
  console.log(`📦 File size: ${(sitemap.length / 1024).toFixed(2)} KB\n`);
  
  // Generate robots.txt
  generateRobotsTxt();
  
  process.exit(0);
}

/**
 * Generate robots.txt
 */
function generateRobotsTxt() {
  const robotsTxt = `# Globul Cars - Robots.txt
# Generated: ${new Date().toISOString()}

User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /api/

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml

# Crawl-delay for polite bots
Crawl-delay: 1
`;

  const outputPath = path.join(__dirname, '..', 'public', 'robots.txt');
  fs.writeFileSync(outputPath, robotsTxt, 'utf8');
  
  console.log('✅ robots.txt generated successfully!');
  console.log(`📁 Location: ${outputPath}\n`);
}

// Run
generateSitemap().catch(error => {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
});
