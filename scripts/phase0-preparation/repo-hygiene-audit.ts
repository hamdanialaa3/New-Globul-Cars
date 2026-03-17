import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

interface FileRecord {
  absPath: string;
  relPath: string;
  ext: string;
  content: string;
  normalized: string;
  hash: string;
}

interface DuplicateGroup {
  hash: string;
  files: string[];
  sizeBytes: number;
}

interface ZombieCandidate {
  file: string;
  reason: string;
}

interface AuditReport {
  generatedAt: string;
  scannedRoots: string[];
  scannedFiles: number;
  duplicateGroups: number;
  duplicateFiles: number;
  zombieCandidates: number;
  duplicates: DuplicateGroup[];
  zombies: ZombieCandidate[];
}

const ROOT = process.cwd();
const DEFAULT_ROOTS = ['src', 'mobile_new/src', 'functions/src', 'shared'];
const TARGET_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const ZOMBIE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css']);
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'build',
  'dist',
  '.next',
  '.expo',
  '.turbo',
  'coverage',
  'DDD',
]);

function safeRelative(absPath: string): string {
  return path.relative(ROOT, absPath).replace(/\\/g, '/');
}

function normalizeCode(content: string): string {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function ensureOutputDir(): string {
  const outDir = path.join(ROOT, 'logs', 'reorganization');
  fs.mkdirSync(outDir, { recursive: true });
  return outDir;
}

function collectFiles(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      collectFiles(abs, out);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!TARGET_EXTENSIONS.has(ext) && !ZOMBIE_EXTENSIONS.has(ext)) continue;
    out.push(abs);
  }

  return out;
}

function buildRecords(roots: string[]): FileRecord[] {
  const records: FileRecord[] = [];

  for (const relRoot of roots) {
    const absRoot = path.join(ROOT, relRoot);
    if (!fs.existsSync(absRoot)) continue;

    const files = collectFiles(absRoot);
    for (const absPath of files) {
      const ext = path.extname(absPath).toLowerCase();
      if (!TARGET_EXTENSIONS.has(ext)) continue;

      const content = fs.readFileSync(absPath, 'utf8');
      const normalized = normalizeCode(content);
      if (!normalized) continue;

      const hash = createHash('sha256').update(normalized).digest('hex');
      records.push({
        absPath,
        relPath: safeRelative(absPath),
        ext,
        content,
        normalized,
        hash,
      });
    }
  }

  return records;
}

function findDuplicates(records: FileRecord[]): DuplicateGroup[] {
  const byHash = new Map<string, FileRecord[]>();
  for (const rec of records) {
    const list = byHash.get(rec.hash) || [];
    list.push(rec);
    byHash.set(rec.hash, list);
  }

  return Array.from(byHash.entries())
    .filter(([, list]) => list.length > 1)
    .map(([hash, list]) => ({
      hash,
      files: list.map(v => v.relPath).sort(),
      sizeBytes: list.reduce((sum, v) => sum + Buffer.byteLength(v.content, 'utf8'), 0),
    }))
    .sort((a, b) => b.files.length - a.files.length || b.sizeBytes - a.sizeBytes);
}

function collectZombieCandidates(roots: string[], records: FileRecord[]): ZombieCandidate[] {
  const searchUniverse: string[] = [];

  for (const relRoot of roots) {
    const absRoot = path.join(ROOT, relRoot);
    if (!fs.existsSync(absRoot)) continue;
    const files = collectFiles(absRoot).filter(p => ZOMBIE_EXTENSIONS.has(path.extname(p).toLowerCase()));
    for (const f of files) {
      try {
        searchUniverse.push(fs.readFileSync(f, 'utf8'));
      } catch {
        // Ignore unreadable files.
      }
    }
  }

  const corpus = searchUniverse.join('\n');
  const zombies: ZombieCandidate[] = [];

  for (const rec of records) {
    if (rec.relPath.endsWith('.d.ts')) continue;
    if (rec.relPath.includes('/__tests__/')) continue;
    if (path.basename(rec.relPath).startsWith('index.')) continue;

    const base = path.basename(rec.relPath, rec.ext);
    if (!base || base.length < 3) continue;

    const mentions = (corpus.match(new RegExp(base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (mentions <= 1) {
      zombies.push({
        file: rec.relPath,
        reason: 'Likely unreferenced module (name appears only in its own file/corpus).',
      });
    }
  }

  return zombies.sort((a, b) => a.file.localeCompare(b.file));
}

function writeMarkdownReport(report: AuditReport, outDir: string): void {
  const lines: string[] = [];
  lines.push('# Repository Hygiene Audit');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Scanned roots: ${report.scannedRoots.join(', ')}`);
  lines.push(`Scanned files: ${report.scannedFiles}`);
  lines.push('');
  lines.push('## Summary');
  lines.push(`- Duplicate groups: ${report.duplicateGroups}`);
  lines.push(`- Duplicate files involved: ${report.duplicateFiles}`);
  lines.push(`- Zombie candidates: ${report.zombieCandidates}`);
  lines.push('');

  lines.push('## Top Duplicate Groups');
  if (report.duplicates.length === 0) {
    lines.push('- No exact normalized duplicates detected.');
  } else {
    for (const group of report.duplicates.slice(0, 20)) {
      lines.push(`- Hash ${group.hash.slice(0, 12)}: ${group.files.length} files`);
      for (const file of group.files) {
        lines.push(`  - ${file}`);
      }
    }
  }
  lines.push('');

  lines.push('## Zombie Candidates (Heuristic)');
  if (report.zombies.length === 0) {
    lines.push('- No zombie candidates found by heuristic scan.');
  } else {
    for (const zombie of report.zombies.slice(0, 80)) {
      lines.push(`- ${zombie.file}: ${zombie.reason}`);
    }
  }

  fs.writeFileSync(path.join(outDir, 'repo-hygiene-report.md'), lines.join('\n'));
}

function main(): void {
  const roots = process.argv.slice(2);
  const scannedRoots = (roots.length > 0 ? roots : DEFAULT_ROOTS).filter(Boolean);

  const records = buildRecords(scannedRoots);
  const duplicates = findDuplicates(records);
  const zombies = collectZombieCandidates(scannedRoots, records);

  const report: AuditReport = {
    generatedAt: new Date().toISOString(),
    scannedRoots,
    scannedFiles: records.length,
    duplicateGroups: duplicates.length,
    duplicateFiles: duplicates.reduce((sum, d) => sum + d.files.length, 0),
    zombieCandidates: zombies.length,
    duplicates,
    zombies,
  };

  const outDir = ensureOutputDir();
  fs.writeFileSync(path.join(outDir, 'repo-hygiene-report.json'), JSON.stringify(report, null, 2));
  writeMarkdownReport(report, outDir);

  console.log('Repository hygiene audit completed.');
  console.log(`Scanned files: ${report.scannedFiles}`);
  console.log(`Duplicate groups: ${report.duplicateGroups}`);
  console.log(`Zombie candidates: ${report.zombieCandidates}`);
  console.log(`Reports: ${safeRelative(path.join(outDir, 'repo-hygiene-report.json'))}`);
}

main();
