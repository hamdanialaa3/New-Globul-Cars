/**
 * Generate OG Image for Koli One (1200x630)
 * Creates a branded social sharing image as SVG → PNG
 * Run: node scripts/generate-og-image.js
 */
const fs = require('fs');
const path = require('path');

// Create an SVG that looks professional for social sharing
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0F172A"/>
      <stop offset="50%" style="stop-color:#1E293B"/>
      <stop offset="100%" style="stop-color:#0F172A"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3B82F6"/>
      <stop offset="100%" style="stop-color:#8B5CF6"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Decorative circles -->
  <circle cx="100" cy="500" r="200" fill="#3B82F6" opacity="0.05"/>
  <circle cx="1100" cy="130" r="250" fill="#8B5CF6" opacity="0.05"/>
  <circle cx="600" cy="315" r="400" fill="#3B82F6" opacity="0.03"/>
  
  <!-- Top accent bar -->
  <rect x="0" y="0" width="1200" height="4" fill="url(#accent)"/>
  
  <!-- Logo circle -->
  <circle cx="600" cy="200" r="65" fill="none" stroke="url(#accent)" stroke-width="3" filter="url(#glow)"/>
  <text x="600" y="215" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="bold" fill="white" text-anchor="middle" filter="url(#glow)">K1</text>
  
  <!-- Main title -->
  <text x="600" y="320" font-family="Arial, Helvetica, sans-serif" font-size="56" font-weight="bold" fill="white" text-anchor="middle">Koli One</text>
  
  <!-- Bulgarian subtitle -->
  <text x="600" y="380" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#94A3B8" text-anchor="middle">Продажба на коли в България</text>
  
  <!-- Tagline -->
  <text x="600" y="430" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#64748B" text-anchor="middle">Нови и употребявани автомобили • Частни лица • Автосалони</text>
  
  <!-- City tags -->
  <rect x="280" y="470" width="130" height="36" rx="18" fill="#3B82F6" opacity="0.2"/>
  <text x="345" y="494" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#3B82F6" text-anchor="middle">София</text>
  
  <rect x="430" y="470" width="130" height="36" rx="18" fill="#3B82F6" opacity="0.2"/>
  <text x="495" y="494" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#3B82F6" text-anchor="middle">Пловдив</text>
  
  <rect x="580" y="470" width="130" height="36" rx="18" fill="#3B82F6" opacity="0.2"/>
  <text x="645" y="494" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#3B82F6" text-anchor="middle">Варна</text>
  
  <rect x="730" y="470" width="130" height="36" rx="18" fill="#3B82F6" opacity="0.2"/>
  <text x="795" y="494" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#3B82F6" text-anchor="middle">Бургас</text>
  
  <!-- Domain -->
  <text x="600" y="570" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold" fill="url(#accent)" text-anchor="middle" filter="url(#glow)">koli.one</text>
  
  <!-- Bottom accent bar -->
  <rect x="0" y="626" width="1200" height="4" fill="url(#accent)"/>
</svg>`;

// Write SVG file
const outputPath = path.join(__dirname, '..', 'public', 'og-image.svg');
fs.writeFileSync(outputPath, svg);
console.log(`✅ OG Image SVG created: ${outputPath}`);

// Also copy as a fallback PNG placeholder (most social platforms accept SVG via og:image)
// For production, convert to PNG using: npx svgexport public/og-image.svg public/og-image.png 1200:630
console.log('📌 To convert to PNG: npx svgexport public/og-image.svg public/og-image.png 1200:630');
