/**
 * =====================================================
 * KOLI ONE — Professional Image Optimization Pipeline
 * Converts heavy PNGs to optimized WebP/AVIF
 * =====================================================
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const srcAssetsDir = path.resolve(__dirname, '../src/assets');

// ─── Color codes ───────────────────────────────────────
const GREEN = '\x1b[32m', RED = '\x1b[31m', YELLOW = '\x1b[33m', CYAN = '\x1b[36m', RESET = '\x1b[0m', BOLD = '\x1b[1m';
const log = (color, msg) => console.log(`${color}${msg}${RESET}`);

// ─── Helper: format bytes ───────────────────────────────
const fmt = (bytes) => bytes >= 1024 * 1024
  ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
  : `${(bytes / 1024).toFixed(1)} KB`;

// ─── Optimization Tasks ─────────────────────────────────
const tasks = [
  // PUBLIC/logo.png → logo.webp (main logo, used everywhere in HTML)
  {
    input: path.join(publicDir, 'logo.png'),
    outputs: [
      { file: path.join(publicDir, 'logo.webp'),    format: 'webp', options: { quality: 85 } },
      { file: path.join(publicDir, 'logo-192.webp'), format: 'webp', options: { quality: 85 }, resize: { width: 192 } },
      { file: path.join(publicDir, 'logo-512.webp'), format: 'webp', options: { quality: 85 }, resize: { width: 512 } },
      { file: path.join(publicDir, 'logo-64.webp'),  format: 'webp', options: { quality: 85 }, resize: { width: 64 } },
    ]
  },
  // PUBLIC/koli_one_ai_Icon2.png → webp
  {
    input: path.join(publicDir, 'koli_one_ai_Icon2.png'),
    outputs: [
      { file: path.join(publicDir, 'koli_one_ai_Icon2.webp'), format: 'webp', options: { quality: 85 } },
    ]
  },
  // SRC ASSETS/logo.png → webp
  {
    input: path.join(srcAssetsDir, 'logo.png'),
    outputs: [
      { file: path.join(srcAssetsDir, 'logo.webp'), format: 'webp', options: { quality: 85 } },
    ]
  },
  // SRC ASSETS/icons/ai/koli_one_ai_Icon2.png → webp
  {
    input: path.join(srcAssetsDir, 'icons', 'ai', 'koli_one_ai_Icon2.png'),
    outputs: [
      { file: path.join(srcAssetsDir, 'icons', 'ai', 'koli_one_ai_Icon2.webp'), format: 'webp', options: { quality: 85 } },
    ]
  },
  // SRC ASSETS/icons/koli_one_ai_Icon2.png → webp
  {
    input: path.join(srcAssetsDir, 'icons', 'koli_one_ai_Icon2.png'),
    outputs: [
      { file: path.join(srcAssetsDir, 'icons', 'koli_one_ai_Icon2.webp'), format: 'webp', options: { quality: 85 } },
    ]
  },
  // Favicon: create optimized 32x32 ICO-compatible PNG
  {
    input: path.join(publicDir, 'logo.png'),
    outputs: [
      { file: path.join(publicDir, 'favicon-32.png'),  format: 'png', options: { compressionLevel: 9 }, resize: { width: 32, height: 32 } },
      { file: path.join(publicDir, 'favicon-16.png'),  format: 'png', options: { compressionLevel: 9 }, resize: { width: 16, height: 16 } },
      { file: path.join(publicDir, 'apple-touch-icon-optimized.png'), format: 'png', options: { compressionLevel: 9 }, resize: { width: 180, height: 180 } },
    ]
  },
];

// ─── Run optimization ───────────────────────────────────
async function optimize() {
  log(BOLD + CYAN, '\n🚀 Koli One — Image Optimization Pipeline\n' + '='.repeat(50));

  let totalSaved = 0;
  let totalOriginal = 0;

  for (const task of tasks) {
    if (!fs.existsSync(task.input)) {
      log(YELLOW, `⚠  SKIP: ${path.basename(task.input)} — file not found`);
      continue;
    }

    const inputSizeBytes = fs.statSync(task.input).size;
    totalOriginal += inputSizeBytes;
    log(CYAN, `\n📁 Source: ${path.relative(path.resolve(__dirname, '..'), task.input)} (${fmt(inputSizeBytes)})`);

    for (const output of task.outputs) {
      try {
        // Ensure output directory exists
        fs.mkdirSync(path.dirname(output.file), { recursive: true });

        let pipeline = sharp(task.input);
        if (output.resize) {
          pipeline = pipeline.resize(output.resize.width, output.resize.height, {
            fit: 'inside',
            withoutEnlargement: true,
          });
        }

        if (output.format === 'webp') {
          pipeline = pipeline.webp(output.options);
        } else if (output.format === 'avif') {
          pipeline = pipeline.avif(output.options);
        } else if (output.format === 'png') {
          pipeline = pipeline.png(output.options);
        }

        await pipeline.toFile(output.file);

        const outSize = fs.statSync(output.file).size;
        const saved = inputSizeBytes - outSize;
        const pct = ((saved / inputSizeBytes) * 100).toFixed(1);
        totalSaved += Math.max(0, saved);

        log(GREEN, `   ✓ ${path.basename(output.file).padEnd(40)} ${fmt(outSize).padStart(10)}  (saved ${pct}%)`);
      } catch (err) {
        log(RED, `   ✗ FAILED ${path.basename(output.file)}: ${err.message}`);
      }
    }
  }

  log(BOLD + GREEN, `\n${'='.repeat(50)}`);
  log(BOLD + GREEN, `✅ DONE! Total saved: ${fmt(totalSaved)} from ${fmt(totalOriginal)}`);
  log(BOLD + GREEN, `   Reduction: ${((totalSaved / totalOriginal) * 100).toFixed(1)}%`);
  log(BOLD + GREEN, `${'='.repeat(50)}\n`);
}

optimize().catch(err => {
  log(RED, `\n💥 Fatal error: ${err.message}`);
  process.exit(1);
});
