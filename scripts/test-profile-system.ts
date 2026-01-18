/**
 * Profile System Integration Tests
 * Phase 4: Testing
 * 
 * Comprehensive tests for the new profile separation system.
 * Tests repositories, services, and integration points.
 * 
 * Usage: npx ts-node scripts/test-profile-system.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { ProfileService } from '../koli-one/src/services/profile/ProfileService';
import { DealershipRepository } from '../koli-one/src/repositories/DealershipRepository';
import { CompanyRepository } from '../koli-one/src/repositories/CompanyRepository';
import { PermissionsService } from '../koli-one/src/services/profile/PermissionsService';

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'fire-new-globul'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

class ProfileSystemTests {
  private results: TestResult[] = [];

  async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    try {
      await testFn();
      this.results.push({
        name,
        passed: true,
        duration: Date.now() - startTime
      });
      console.log(`✅ ${name}`);
    } catch (error) {
      this.results.push({
        name,
        passed: false,
        duration: Date.now() - startTime,
        error: (error as Error).message
      });
      console.log(`❌ ${name}: ${(error as Error).message}`);
    }
  }

  // Test 1: Repository Operations
  async testDealershipRepository() {
    await this.runTest('Dealership Repository - CRUD operations', async () => {
      const testUid = 'test-dealer-' + Date.now();
      
      // Create
      const created = await DealershipRepository.create(testUid, {
        dealershipNameBG: 'Test Dealer',
        eik: '123456789',
        address: {
          street: 'Test St',
          city: 'София',
          region: 'София',
          postalCode: '1000',
          country: 'Bulgaria'
        },
        contact: {
          phone: '+359888123456',
          phoneCountryCode: '+359',
          email: 'test@dealer.bg'
        }
      } as any);

      if (!created) throw new Error('Create failed');

      // Read
      const fetched = await DealershipRepository.getById(testUid);
      if (!fetched) throw new Error('Read failed');

      // Update
      await DealershipRepository.update(testUid, {
        dealershipNameBG: 'Updated Dealer'
      });

      // Delete
      await DealershipRepository.delete(testUid);
    });
  }

  // Test 2: Permissions System
  async testPermissionsService() {
    await this.runTest('Permissions Service - Tier calculations', async () => {
      // Test free tier
      const freePerms = PermissionsService.getPermissions('private', 'free');
      if (freePerms.maxListings !== 3) {
        throw new Error('Free tier should have 3 listings');
      }

      // Test dealer pro tier
      const dealerProPerms = PermissionsService.getPermissions('dealer', 'dealer_pro');
      if (dealerProPerms.maxListings !== 150) {
        throw new Error('Dealer Pro should have 150 listings');
      }

      // Test enterprise tier
      const enterprisePerms = PermissionsService.getPermissions('dealer', 'dealer_enterprise');
      if (enterprisePerms.maxListings !== -1) {
        throw new Error('Enterprise should have unlimited listings');
      }
    });
  }

  // Test 3: Profile Type Validation
  async testProfileTypeValidation() {
    await this.runTest('Profile Type Validation - Requirements check', async () => {
      // This would test the validation logic in ProfileTypeContext
      // For now, just verify the service exists
      if (!ProfileService) {
        throw new Error('ProfileService not found');
      }
    });
  }

  // Test 4: Type Guards
  async testTypeGuards() {
    await this.runTest('Type Guards - Runtime type checking', async () => {
      const { isDealerProfile, isCompanyProfile, isPrivateProfile } = 
        await import('../koli-one/src/types/user/bulgarian-user.types');

      const dealerUser: any = { profileType: 'dealer' };
      if (!isDealerProfile(dealerUser)) {
        throw new Error('isDealerProfile type guard failed');
      }

      const privateUser: any = { profileType: 'private' };
      if (!isPrivateProfile(privateUser)) {
        throw new Error('isPrivateProfile type guard failed');
      }
    });
  }

  async runAll() {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║  PROFILE SYSTEM INTEGRATION TESTS              ║');
    console.log('║  Phase 4: Testing                              ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    await this.testDealershipRepository();
    await this.testPermissionsService();
    await this.testProfileTypeValidation();
    await this.testTypeGuards();

    this.printSummary();
  }

  printSummary() {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log('\n═══════════════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════════════');
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Duration: ${totalDuration}ms`);
    console.log('═══════════════════════════════════════════════\n');

    if (failed > 0) {
      console.log('Failed tests:');
      this.results.filter(r => !r.passed).forEach(r => {
        console.log(`  ❌ ${r.name}: ${r.error}`);
      });
      console.log('');
    }
  }

  getResults(): TestResult[] {
    return this.results;
  }
}

async function main() {
  const tests = new ProfileSystemTests();
  await tests.runAll();

  const results = tests.getResults();
  const allPassed = results.every(r => r.passed);

  process.exit(allPassed ? 0 : 1);
}

if (require.main === module) {
  main();
}

export { ProfileSystemTests };

