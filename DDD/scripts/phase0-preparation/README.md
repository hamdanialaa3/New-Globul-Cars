# Phase 0 Preparation Scripts

This directory contains scripts for Pre-Phase 0 preparation before starting the backend refactoring.

## Scripts

### 1. analyze-imports.ts
Analyzes all import statements in the project and generates comprehensive reports.

**What it does:**
- Scans all TypeScript files
- Extracts import/export statements
- Builds dependency map
- Detects circular dependencies
- Identifies orphan files
- Finds files that exceed 300 lines

**Usage:**
```bash
cd bulgarian-car-marketplace
npx ts-node scripts/phase0-preparation/analyze-imports.ts
```

**Output files:**
- `logs/phase0-preparation/import-analysis-main.json` - Main report
- `logs/phase0-preparation/circular-dependencies.json` - Circular deps
- `logs/phase0-preparation/most-imported-files.json` - Most popular files
- `logs/phase0-preparation/least-imported-files.json` - Rarely used files
- `logs/phase0-preparation/orphan-files.json` - Unused files
- `logs/phase0-preparation/large-files.json` - Files >300 lines

---

### 2. find-duplicate-services.ts
Identifies duplicate and similar services that need consolidation.

**What it does:**
- Finds all service files
- Extracts function signatures
- Counts usage across project
- Groups similar services
- Identifies unused services

**Usage:**
```bash
cd bulgarian-car-marketplace
npx ts-node scripts/phase0-preparation/find-duplicate-services.ts
```

**Output files:**
- `logs/phase0-preparation/services-usage-report.json` - Usage statistics
- `logs/phase0-preparation/duplicate-services.json` - Duplicate groups

---

### 3. create-baseline.ts
Creates performance and code metrics baseline for comparison.

**What it does:**
- Captures current Git state
- Counts files by type
- Analyzes code metrics
- Records dependencies
- Creates snapshot for comparison

**Usage:**
```bash
cd bulgarian-car-marketplace
npx ts-node scripts/phase0-preparation/create-baseline.ts
```

**Output files:**
- `logs/phase0-preparation/baseline-TIMESTAMP.json` - Timestamped baseline
- `logs/phase0-preparation/baseline-latest.json` - Latest baseline

---

## Running All Scripts

To run all preparation scripts in sequence:

```bash
cd bulgarian-car-marketplace

# Create logs directory
mkdir -p logs/phase0-preparation

# Run all scripts
npx ts-node scripts/phase0-preparation/analyze-imports.ts
npx ts-node scripts/phase0-preparation/find-duplicate-services.ts
npx ts-node scripts/phase0-preparation/create-baseline.ts

echo "Phase 0 preparation complete!"
echo "Check logs/phase0-preparation/ for all reports"
```

---

## Reports Location

All reports are saved to: `bulgarian-car-marketplace/logs/phase0-preparation/`

**Directory structure:**
```
logs/phase0-preparation/
├── import-analysis-main.json
├── circular-dependencies.json
├── most-imported-files.json
├── least-imported-files.json
├── orphan-files.json
├── large-files.json
├── services-usage-report.json
├── duplicate-services.json
├── baseline-TIMESTAMP.json
└── baseline-latest.json
```

---

## Next Steps

After running all preparation scripts:

1. Review all generated reports
2. Identify critical issues (circular deps, large files)
3. Plan consolidation strategy for duplicate services
4. Create backup using Git tags
5. Proceed to Phase 1 execution

---

## Safety Notes

- These scripts are READ-ONLY - they don't modify any files
- All outputs are in JSON format for easy parsing
- Reports can be reviewed before starting refactoring
- Baseline can be used to verify improvements after refactoring

---

**Last Updated:** November 3, 2025  
**Version:** 1.0

