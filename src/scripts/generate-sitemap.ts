/**
 * Generate Sitemap Script
 * Run after build: npm run generate:sitemap
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { generateSitemapXML } from '../utils/seo-sitemap';
import { logger } from '@/services/logger-service';

const OUTPUT_DIR = join(process.cwd(), 'build'); // Vite outputs to 'build' folder

function main() {
  logger.debug('🔨 Generating SEO files...');

  // Generate sitemap.xml
  const sitemap = generateSitemapXML();
  const sitemapPath = join(OUTPUT_DIR, 'sitemap.xml');
  writeFileSync(sitemapPath, sitemap, 'utf-8');
  logger.debug(`✅ Generated: ${sitemapPath}`);
  
  // Count URLs
  const urlCount = (sitemap.match(/<url>/g) || []).length;
  logger.debug(`📊 Total URLs: ${urlCount}`);

  // Removed robots.txt generation so it explicitly respects the `public/robots.txt`
  // file containing AI directives during the Vite build process.

  logger.debug('✨ SEO files generated successfully!');
}

main();
