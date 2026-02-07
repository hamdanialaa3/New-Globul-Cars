/**
 * Generate Sitemap Script
 * Run after build: npm run generate:sitemap
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { generateSitemapXML, generateRobotsTxt } from '../utils/seo-sitemap';

const OUTPUT_DIR = join(process.cwd(), 'build'); // Vite outputs to 'build' folder

function main() {
  console.log('🔨 Generating SEO files...');

  // Generate sitemap.xml
  const sitemap = generateSitemapXML();
  const sitemapPath = join(OUTPUT_DIR, 'sitemap.xml');
  writeFileSync(sitemapPath, sitemap, 'utf-8');
  console.log(`✅ Generated: ${sitemapPath}`);
  
  // Count URLs
  const urlCount = (sitemap.match(/<url>/g) || []).length;
  console.log(`📊 Total URLs: ${urlCount}`);

  // Generate robots.txt
  const robots = generateRobotsTxt();
  const robotsPath = join(OUTPUT_DIR, 'robots.txt');
  writeFileSync(robotsPath, robots, 'utf-8');
  console.log(`✅ Generated: ${robotsPath}`);

  console.log('✨ SEO files generated successfully!');
}

main();
