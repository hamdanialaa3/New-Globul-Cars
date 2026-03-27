const fs = require('fs');
const path = require('path');

const root = process.cwd();
const mobile = path.join(root, 'mobile_new');
const outRoot = path.join(root, 'mobil_app_plans');
const outDir = path.join(outRoot, 'ui_audit_output');
fs.mkdirSync(outDir, { recursive: true });

const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.expo', 'dist', 'build', 'coverage', 'android/.gradle', 'ios/build'
]);

function shouldIgnorePath(p) {
  const normalized = p.replace(/\\/g, '/').toLowerCase();
  if (normalized.includes('/node_modules/')) return true;
  if (normalized.includes('/.expo/')) return true;
  if (normalized.includes('/dist/')) return true;
  if (normalized.includes('/build/')) return true;
  if (normalized.includes('/coverage/')) return true;
  if (normalized.includes('/.git/')) return true;
  if (normalized.includes('/android/.gradle/')) return true;
  if (normalized.includes('/ios/build/')) return true;
  return false;
}

function walk(dir, exts = null) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (shouldIgnorePath(p)) continue;
    if (ent.isDirectory()) {
      if (IGNORE_DIRS.has(ent.name)) continue;
      out.push(...walk(p, exts));
    }
    else if (!exts || exts.some((e) => p.toLowerCase().endsWith(e))) out.push(p);
  }
  return out;
}

function rel(p) { return path.relative(root, p).replace(/\\/g, '/'); }

const pkg = JSON.parse(fs.readFileSync(path.join(mobile, 'package.json'), 'utf8'));
const appTsxFiles = walk(path.join(mobile, 'app'), ['.ts', '.tsx', '.js', '.jsx']);
const screenFiles = appTsxFiles.filter((p) => !p.endsWith('_layout.tsx') && !p.endsWith('_layout.js'));
const componentFiles = walk(path.join(mobile, 'src', 'components'), ['.ts', '.tsx', '.js', '.jsx']);
const styleFiles = walk(path.join(mobile, 'src', 'styles'), ['.ts', '.tsx', '.js', '.jsx', '.json']);
const serviceFiles = walk(path.join(mobile, 'src', 'services'), ['.ts', '.tsx', '.js', '.jsx']);
const assetFiles = walk(mobile, ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif']);
const fontFiles = walk(mobile, ['.ttf', '.otf']);

const strings = [];
for (const f of walk(path.join(mobile, 'src'), ['.ts', '.tsx', '.js', '.jsx'])) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split(/\r?\n/);
  const re = /"([^"\r\n]{2,200})"|'([^'\r\n]{2,200})'/g;
  lines.forEach((line, i) => {
    let m;
    while ((m = re.exec(line)) !== null) {
      const val = (m[1] || m[2] || '').trim();
      if (!val || /^[{}()[\],.:;<>+=_*\\/\-]+$/.test(val)) continue;
      strings.push({ key: `STR_${strings.length + 1}`, original: val, filePath: rel(f), lineNumber: i + 1, context: line.trim().slice(0, 220) });
    }
    re.lastIndex = 0;
  });
}

const uniqueStrings = [];
const seen = new Set();
for (const s of strings) {
  const k = `${s.original}@@${s.filePath}`;
  if (seen.has(k)) continue;
  seen.add(k);
  uniqueStrings.push(s);
}

const apiHits = [];
const apiRegexes = [
  /https?:\/\/[^\s'"`]+/g,
  /\/api\/[A-Za-z0-9_\-/]+/g,
  /cloudfunctions\.net[^\s'"`]+/g,
];
for (const f of [...serviceFiles, ...walk(path.join(mobile, 'src', 'hooks'), ['.ts', '.tsx', '.js', '.jsx'])]) {
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const re of apiRegexes) {
      const ms = line.match(re);
      if (ms) {
        ms.forEach((m) => apiHits.push({ endpoint: m, filePath: rel(f), lineNumber: i + 1 }));
      }
    }
    if (/fetch\(|axios|algoliasearch|firebase|getDatabase\(|getFirestore\(/.test(line)) {
      apiHits.push({ endpoint: 'sdk-call', filePath: rel(f), lineNumber: i + 1 });
    }
  });
}

const topEndpoints = apiHits.slice(0, 80);

const navFile = rel(path.join(mobile, 'app', '_layout.tsx'));
const tabsFile = rel(path.join(mobile, 'app', '(tabs)', '_layout.tsx'));

const quickWins = [
  'Rebuild visual hierarchy on Home: hero search + editorial cards + larger car visuals with skeleton loading.',
  'Unify component styles by enforcing one token source (DesignTokens.ts) and removing mixed px-string spacing in theme.ts.',
  'Introduce premium motion system (page transitions, card reveal, CTA emphasis) with strict accessibility-safe durations.'
];

const report = `# Project UI Report\n\n## 1 Project Type and Framework\n- Detected: Expo React Native with expo-router\n- Confidence: high\n- Main entry: ${pkg.main}\n- Key UI stack: react-native 0.81.5, expo-router, styled-components/native, @react-navigation/native\n\n## 2 Screens Found\n- Total screens detected in app/: ${screenFiles.length}\n- Navigation roots: ${navFile}, ${tabsFile}\n- Example screens:\n${screenFiles.slice(0, 35).map((p) => `- ${rel(p)}`).join('\n')}\n\n## 3 UI Components\n- Total component files: ${componentFiles.length}\n- Primary reusable components (sample):\n${componentFiles.filter((p) => /\\components\\ui\\/i.test(p)).slice(0, 20).map((p) => `- ${rel(p)}`).join('\n')}\n\n## 4 Design Tokens\n- Token files:\n${styleFiles.map((p) => `- ${rel(p)}`).join('\n')}\n- Notes:\n  - DesignTokens.ts uses numeric mobile-first spacing/radius/typography scales.\n  - theme.ts still contains string px spacing values and should be normalized for consistency.\n\n## 5 Assets Inventory\n- Images/icons: ${assetFiles.length}\n- Fonts: ${fontFiles.length}\n- Sample assets:\n${assetFiles.slice(0, 20).map((p) => `- ${rel(p)}`).join('\n')}\n\n## 6 API Endpoints and Data Sources\n- Service files scanned: ${serviceFiles.length}\n- Endpoint/sdk hits found: ${apiHits.length}\n- Sample endpoints/calls:\n${topEndpoints.slice(0, 25).map((h) => `- ${h.endpoint} (${h.filePath}:${h.lineNumber})`).join('\n')}\n\n## 7 Navigation Structure\n- Root: Stack-based in app/_layout.tsx with many feature routes (car, chat, profile, ai, marketplace, dealer, blog, legal).\n- Primary mobile IA: Bottom Tabs in app/(tabs)/_layout.tsx\n  - index\n  - search\n  - sell (auth-guarded)\n  - profile\n  - messages (auth-guarded with unread badge)\n\n## 8 UX Anti-patterns / Risks\n- Very large route surface in root stack can dilute IA and increase perceived complexity.\n- Mixed token systems (DesignTokens numeric vs theme px strings) risks visual inconsistency.\n- Home and discovery areas use many data cards; without strict hierarchy they can feel noisy.\n\n## 9 Accessibility Flags\n- Need systematic audit for touch targets >= 44dp across custom components.\n- Contrast should be measured across gradient overlays and tertiary text.\n- Need explicit accessibility labels on icon-only controls in shared UI components.\n\n## 10 Performance Flags\n- Large image-heavy UI requires aggressive thumbnail sizing and caching policy.\n- Route and component count suggests bundle-splitting/lazy boundaries should be reviewed.\n- Multiple animated surfaces should use consistent reduced-motion handling.\n\n## 11 Immediate Modernization Quick Wins\n1. ${quickWins[0]}\n2. ${quickWins[1]}\n3. ${quickWins[2]}\n`;

fs.writeFileSync(path.join(outDir, 'project_ui_report.md'), report, 'utf8');

const summary = {
  detectedFramework: 'expo-react-native',
  confidence: 'high',
  screenCount: screenFiles.length,
  componentCount: componentFiles.length,
  styleTokenFiles: styleFiles.map(rel),
  assetsCount: assetFiles.length,
  fontsCount: fontFiles.length,
  apiHitCount: apiHits.length,
  navigation: {
    rootLayout: navFile,
    tabLayout: tabsFile,
    tabRoutes: ['index', 'search', 'sell', 'profile', 'messages']
  },
  quickWins
};
fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8');
fs.writeFileSync(path.join(outDir, 'strings_extracted.json'), JSON.stringify(uniqueStrings, null, 2), 'utf8');

const csv = ['key,original,context,filePath,lineNumber'];
for (const s of uniqueStrings.slice(0, 3000)) {
  const esc = (v) => '"' + String(v).replace(/"/g, '""') + '"';
  csv.push([esc(s.key), esc(s.original), esc(s.context), esc(s.filePath), s.lineNumber].join(','));
}
fs.writeFileSync(path.join(outDir, 'strings_for_translation.csv'), csv.join('\n'), 'utf8');

const assetsMd = `# Assets Inventory\n\n- Total visual assets: ${assetFiles.length}\n- Total font files: ${fontFiles.length}\n\n## Example Image/Icon Paths\n${assetFiles.slice(0, 120).map((p) => `- ${rel(p)}`).join('\n')}\n\n## Font Paths\n${fontFiles.map((p) => `- ${rel(p)}`).join('\n')}\n\n## Recommended Max Display Size\n- Hero image: 1600x900 source, render responsive\n- Card thumb: 800x600 source, render with lazy/skeleton\n- Icon svg: keep vector, avoid oversized png fallbacks\n`;
fs.writeFileSync(path.join(outDir, 'assets_inventory.md'), assetsMd, 'utf8');

const redesign = `# UI Redesign Brief\n\n## 1 Target Users and Scenarios\n- Car buyers in Bulgaria browsing listings quickly on mobile.\n- Individual and dealer sellers creating and managing listings.\n- Users comparing cars, messaging sellers, and checking finance options.\n\n## 2 Design Goals and Success Metrics\n- Premium visual identity comparable to top automotive marketplaces.\n- Faster browsing comprehension and stronger visual trust.\n- Metrics: higher listing-detail CTR, lower bounce from home/search, increased message starts.\n\n## 3 Visual Direction\n- Mood keywords: automotive editorial, premium clarity, dark-luxury contrast, confident motion, structured density.\n- Palette options:\n  - #0B0E14 #121822 #2563EB #00E5FF #FFFFFF #B0BEC5\n  - #0A0D12 #1A237E #3949AB #FFD600 #FFFFFF #78909C\n\n## 4 Typography\n- Recommended families: Manrope, Plus Jakarta Sans, Sora (fallback to system for perf).\n- Scale: 12/14/16 body; 20/24 section heads; 32+ hero headline only.\n\n## 5 Component Library\n- Core: AppHeader, SearchBar, CarCard (3 variants), PriceBadge, SellerPill, FilterChip, StickyActionBar.\n- States: loading skeleton, empty, error retry, success, disabled, pressed, focus-visible.\n\n## 6 High-level Screen Flows\n- Home -> Search Results -> Car Detail -> Message Seller\n- Sell Wizard -> Media Upload -> Review -> Publish\n- Profile -> My Ads -> Analytics -> Subscription\n\n## 7 Prioritized Implementation Plan\n1) Token unification and layout primitives (1 week).\n2) Home/Search/Detail visual overhaul (2 weeks).\n3) Sell flow + profile dashboard consistency pass (1.5 weeks).\n4) Motion/accessibility/performance polish (1 week).\n`;
fs.writeFileSync(path.join(outDir, 'ui_redesign_brief.md'), redesign, 'utf8');

console.log('Generated ui_audit_output artifacts in mobil_app_plans');
