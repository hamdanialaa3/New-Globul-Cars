// Pretest compile step for ProfileStatsService using esbuild.
// Transpiles TypeScript service to CJS JavaScript so Jest can require without TS transform issues.

const esbuild = require('esbuild');
const path = require('path');

(async () => {
  try {
    await esbuild.build({
      entryPoints: [path.resolve(__dirname, '../../src/services/profile/profile-stats.service.ts')],
      bundle: false,
      platform: 'node',
      format: 'cjs',
      outdir: path.resolve(__dirname, '../../dist-test/services/profile'),
      sourcemap: false,
      logLevel: 'silent'
    });
    // Minimal success log (avoid noisy output in CI)
    console.log('[pretest] profile-stats.service.ts compiled to dist-test/services/profile');
  } catch (err) {
    console.error('[pretest] Failed to compile profile-stats.service.ts');
    console.error(err);
    process.exit(1);
  }
})();