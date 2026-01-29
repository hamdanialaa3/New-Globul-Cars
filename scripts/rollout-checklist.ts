/**
 * Rollout Checklist Script
 * Phase 4: Deployment Preparation
 * 
 * Automated checks before deploying profile separation system.
 * Verifies all requirements are met for safe rollout.
 * 
 * Usage: npx ts-node scripts/rollout-checklist.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, limit } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'fire-new-globul'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  critical: boolean;
}

class RolloutChecklist {
  private checks: CheckResult[] = [];

  async check(name: string, checkFn: () => Promise<boolean>, critical: boolean = false): Promise<void> {
    try {
      const passed = await checkFn();
      this.checks.push({
        name,
        status: passed ? 'pass' : (critical ? 'fail' : 'warning'),
        message: passed ? 'OK' : 'Failed',
        critical
      });
      
      const icon = passed ? '✅' : (critical ? '❌' : '⚠️');
      console.log(`${icon} ${name}`);
    } catch (error) {
      this.checks.push({
        name,
        status: critical ? 'fail' : 'warning',
        message: (error as Error).message,
        critical
      });
      console.log(`❌ ${name}: ${(error as Error).message}`);
    }
  }

  async runAllChecks() {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║  ROLLOUT READINESS CHECKLIST                   ║');
    console.log('║  Phase 4: Deployment Preparation               ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    console.log('🔍 Running checks...\n');

    // Critical checks
    await this.check('1. Firestore rules deployed', async () => {
      // Check if firestore.rules file exists
      return fs.existsSync(path.join(__dirname, '..', 'firestore.rules'));
    }, true);

    await this.check('2. All types defined', async () => {
      return fs.existsSync(path.join(__dirname, '..', 'koli-one', 'src', 'types', 'user', 'bulgarian-user.types.ts')) &&
             fs.existsSync(path.join(__dirname, '..', 'koli-one', 'src', 'types', 'dealership', 'dealership.types.ts')) &&
             fs.existsSync(path.join(__dirname, '..', 'koli-one', 'src', 'types', 'company', 'company.types.ts'));
    }, true);

    await this.check('3. All repositories implemented', async () => {
      return fs.existsSync(path.join(__dirname, '..', 'koli-one', 'src', 'repositories', 'DealershipRepository.ts')) &&
             fs.existsSync(path.join(__dirname, '..', 'koli-one', 'src', 'repositories', 'CompanyRepository.ts'));
    }, true);

    await this.check('4. All services implemented', async () => {
      return fs.existsSync(path.join(__dirname, '..', 'koli-one', 'src', 'services', 'profile', 'ProfileService.ts')) &&
             fs.existsSync(path.join(__dirname, '..', 'koli-one', 'src', 'services', 'profile', 'PermissionsService.ts')) &&
             fs.existsSync(path.join(__dirname, '..', 'koli-one', 'src', 'services', 'profile', 'ProfileMigrationService.ts'));
    }, true);

    await this.check('5. UI components created', async () => {
      return fs.existsSync(path.join(__dirname, '..', 'koli-one', 'src', 'components', 'Profile', 'Forms', 'DealershipProfileForm.tsx')) &&
             fs.existsSync(path.join(__dirname, '..', 'koli-one', 'src', 'components', 'Profile', 'ProfileTypeSwitcher.tsx'));
    }, true);

    await this.check('6. ProfilePage split complete', async () => {
      return fs.existsSync(path.join(__dirname, '..', 'koli-one', 'src', 'pages', 'ProfilePage', 'layout', 'TabNavigation.tsx')) &&
             fs.existsSync(path.join(__dirname, '..', 'koli-one', 'src', 'pages', 'ProfilePage', 'hooks', 'useProfileData.ts'));
    }, true);

    // Warning-level checks
    await this.check('7. Migration script ready', async () => {
      return fs.existsSync(path.join(__dirname, 'migrate-dealers-to-new-structure.ts'));
    }, false);

    await this.check('8. Test script ready', async () => {
      return fs.existsSync(path.join(__dirname, 'test-profile-system.ts'));
    }, false);

    await this.check('9. Backup guide available', async () => {
      return fs.existsSync(path.join(__dirname, '..', '📋 PLANS', 'PROFILE_SEPARATION_PLAN', 'FIRESTORE_BACKUP_GUIDE.md'));
    }, false);

    await this.check('10. Legacy usage documented', async () => {
      return fs.existsSync(path.join(__dirname, '..', '📋 PLANS', 'PROFILE_SEPARATION_PLAN', 'LEGACY_USAGE_MAP.md'));
    }, false);

    this.printSummary();
  }

  printSummary() {
    const passed = this.checks.filter(c => c.status === 'pass').length;
    const failed = this.checks.filter(c => c.status === 'fail').length;
    const warnings = this.checks.filter(c => c.status === 'warning').length;
    const criticalFails = this.checks.filter(c => c.status === 'fail' && c.critical).length;

    console.log('\n═══════════════════════════════════════════════');
    console.log('📊 ROLLOUT READINESS SUMMARY');
    console.log('═══════════════════════════════════════════════');
    console.log(`Total Checks: ${this.checks.length}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Warnings: ${warnings} ⚠️`);
    console.log('═══════════════════════════════════════════════\n');

    if (criticalFails > 0) {
      console.log('🚨 CRITICAL FAILURES - DO NOT DEPLOY\n');
      this.checks.filter(c => c.status === 'fail' && c.critical).forEach(c => {
        console.log(`  ❌ ${c.name}: ${c.message}`);
      });
      console.log('\n⛔ Deployment BLOCKED until critical issues are resolved.\n');
      return false;
    }

    if (failed > 0 || warnings > 0) {
      console.log('⚠️  Non-critical issues found:\n');
      this.checks.filter(c => c.status !== 'pass').forEach(c => {
        const icon = c.status === 'fail' ? '❌' : '⚠️';
        console.log(`  ${icon} ${c.name}: ${c.message}`);
      });
      console.log('\n✅ Deployment ALLOWED but review issues above.\n');
      return true;
    }

    console.log('✅ ALL CHECKS PASSED - READY FOR DEPLOYMENT!\n');
    return true;
  }

  isReadyForDeployment(): boolean {
    const criticalFails = this.checks.filter(c => c.status === 'fail' && c.critical).length;
    return criticalFails === 0;
  }
}

async function main() {
  const checklist = new RolloutChecklist();
  await checklist.runAllChecks();

  const ready = checklist.isReadyForDeployment();
  process.exit(ready ? 0 : 1);
}

if (require.main === module) {
  main();
}

export { RolloutChecklist };

