Project Structure Overview
==========================

Global Metrics
--------------
- Total files: 189,437
- Total directories: 28,271
- Aggregate size: ~4.68 GB
- Primary codebase (`bulgarian-car-marketplace`): 97,843 files, ~2.87 GB
- Functions backend (`functions`): 19,424 files, ~0.36 GB
- Asset library: 577 media files, ~0.64 GB

Top-Level Files
---------------
- Configuration: `.env.example`, `.firebaserc`, `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `apphosting.yaml`, `storage.rules`, `cors.json`
- Package management: `package.json`, `package-lock.json`, `tsconfig.json`
- Deployment helpers: `START_HERE.bat`, `RESTORE_CHECKPOINT.bat`, `SETUP_IMAGES.bat`, `شغل_الخادم.bat`
- Documentation snapshots: `README_START_HERE.md`, `README_START_HERE.txt`, `INTEGRATION_GUIDE.md`, `CHECKPOINT_INFO.txt`
- Historical reports (retain original filenames): `✅ FINAL_CAR_DETAILS_UPDATE.md`, `SOCIAL_FEED_ANALYSIS_REPORT.md`, `البروفايل هيكلية .txt`, وغيرها
- Credentials (local use only): `serviceAccountKey.json`, `.env.github`, `.env.n8n`

Directory Breakdown
-------------------

`.firebase` (3 files, 0.10 MB)
  Firebase CLI workspace; holds emulator configs and the rotating log `logs/vsce-debug.log`.

`.github` (5 files, 0.04 MB)
  Issue templates and CI configuration.

`📚 DOCUMENTATION` (20 files, 0.33 MB)
  Manual documentation hub; includes the project constitution `دستور المشروع.md` and consolidated pages index `صفحات المشروع كافة .md`.

`🤖 AI_CAR_ASSISTANT_MASTER_PLAN` (10 files, 0.12 MB)
  Planning notes and flowcharts for the assistant feature set.

`اصلاح اضافة السيارات` (11 files, 0.14 MB)
  Work-in-progress assets and notes for the car listing repair initiative.

`خطة التواصل الاجتماعي` (22 files, 0.21 MB)
  Marketing content calendars, drafts, and platform-specific plans.

`ai-valuation-model` (9 files, 0.03 MB)
  Standalone Python package for vehicle valuation (training, testing, deployment scripts, with `requirements.txt`).

`assets` (577 files, 635.71 MB)
  Media hub. Subdirectories:
  - `images` (567 files, ~630 MB) high-resolution photography, UI backgrounds, logos.
  - `bottom`, `models`, `videos` provide ancillary visuals and renders.

`bulgarian-car-marketplace` (97,843 files, 2,869.42 MB)
  Main React (CRACO) front-end.
  - `build` (652 files, 681.64 MB) production bundle.
  - `coverage` (1,023 files, 47.28 MB) Jest coverage artifacts.
  - `node_modules` (94,680 files, 1,456.87 MB) dependencies; avoid manual edits.
  - `public` (394 files, 554.43 MB) static assets, localized manifests, favicons.
  - `src` (984 files, 127.57 MB) application source:
    * `assets` (74 files, 120.34 MB) optimized web-ready media.
    * `components` (346 files, 2.66 MB); main clusters: `Profile` (73 files), `Posts` (16), `SuperAdmin` (10), `messaging` (10), `sell` (8).
    * `pages` (226 files, 2.08 MB); organized by funnels: `03_user-pages` (68 files), `04_car-selling` (48), `05_search-browse` (27), `01_main-pages` (22), `02_authentication` (21).
    * `services` (194 files, 1.47 MB); major groups: `social`, `brandModels`, `profile`, `verification`, `search`, `campaigns`, `ai`, `messaging`.
    * Additional modules: `hooks`, `contexts`, `repositories`, `utils`, `firebase`.
  - `scripts` (52 files) build tools and optimizers.
  Observed duplicate density: 10,600 hash-identical groups inside `bulgarian-car-marketplace` (24,189 redundant copies beyond primaries), primarily within generated bundles and dependency caches.

`data` (1 file, 0.01 MB)
  Single dataset placeholder.

`dataconnect` (1,004 files, 26.69 MB)
  Firebase Data Connect schemas and generated SDK (`.dataconnect` artifacts, `schema`, connectors, generated TypeScript client in `dataconnect-generated`).

`DDD` (3,795 files, 22.62 MB)
  Documentation-driven development archive.
  - `DOCUMENTATION_ARCHIVE_NOV_2025` (3 directories) organized manuals and task records.
  - `node_modules` (3,711 files) documentation site tooling.
  - `src` (14 files) lightweight front-end for documentation previews.
  - `RESTRUCTURE_PLANS` (19 files) refactoring proposals and migration plans.

`DEVELOPMENT_ROADMAP_2025+` (6 files, 0.12 MB)
  Strategic planning documents and gantt references.

`docs` (2 files, 0.01 MB)
  High-level external documentation exports.

`extensions` (11 files, 0.01 MB)
  VS Code and tooling extensions manifest.

`functions` (19,424 files, 356.73 MB)
  Firebase Cloud Functions workspace.
  - `src` (98 files, 0.64 MB) TypeScript source (auth, notifications, data pipelines).
  - `lib` (384 files, 2.38 MB) compiled JavaScript.
  - `node_modules` (18,933 files, 353.40 MB) dependencies.
  - `adapters`, `scripts`, `test` support deployment and integration.

`locales` (1 file, trace size)
  Centralized language resources (BG/EN unified system).

`node_modules` (66,624 files, 878.15 MB)
  Root-level dependencies (legacy scripts and helpers). Treat as read-only; regenerated via `npm install`.

`scripts` (17 files, 0.06 MB)
  Repository-wide automation (cleanup, deployment, asset management).

`src` (8 files, 0.06 MB)
  Legacy utilities shared outside the main React app (CLI helpers, data processors).

`types` (1 file, 0.01 MB)
  Shared TypeScript type definitions consumed by auxiliary tooling.

Key Takeaways
-------------
- Production-ready surface lives under `bulgarian-car-marketplace/src`; profile system and car detail flows dominate component count.
- Large binary payload (assets + build artifacts) accounts for ~75 % of total size; consider external storage or release bundling when packaging.
- Duplicated content concentrates in build outputs and dependency trees; plan phased deduplication per directory to avoid breaking references.
- Documentation archives (`DDD`, `📚 DOCUMENTATION`) store authoritative policies—retain when moving or pruning.


