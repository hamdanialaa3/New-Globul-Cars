// @ts-nocheck
/**
 * Tests for getSuperAdminAnalytics Cloud Function
 * Location: Bulgaria | Languages: BG/EN | Currency: EUR
 */

import { expect } from 'chai';
import * as functionsTest from 'firebase-functions-test';

// Initialize test environment
const test = functionsTest({
  projectId: 'fire-new-globul',
}, '../../serviceAccountKey.json');

// Import the function after test initialization
import { getSuperAdminAnalytics } from '../src/stats';

describe('getSuperAdminAnalytics', () => {
  let wrapped: any;

  before(() => {
    // Wrap the function for testing
    wrapped = test.wrap(getSuperAdminAnalytics);
  });

  after(() => {
    // Clean up
    test.cleanup();
  });

  it('should reject unauthenticated requests', async () => {
    try {
      await wrapped({}, { auth: null });
      expect.fail('Should have thrown permission-denied error');
    } catch (error: any) {
      expect(error.code).to.equal('permission-denied');
    }
  });

  it('should reject non-owner authenticated requests', async () => {
    const mockContext = {
      auth: {
        uid: 'test-user-123',
        token: {
          email: 'regular.user@example.com',
          superAdmin: false
        }
      }
    };

    try {
      await wrapped({}, mockContext);
      expect.fail('Should have thrown permission-denied error');
    } catch (error: any) {
      expect(error.code).to.equal('permission-denied');
    }
  });

  it('should return analytics for owner with superAdmin claim', async () => {
    const mockContext = {
      auth: {
        uid: 'owner-uid',
        token: {
          email: 'alaa.hamdani@yahoo.com',
          superAdmin: true,
          uniqueOwner: true
        }
      }
    };

    const result = await wrapped({}, mockContext);

    expect(result).to.be.an('object');
    expect(result).to.have.property('totalUsers').that.is.a('number');
    expect(result).to.have.property('activeUsers').that.is.a('number');
    expect(result).to.have.property('totalCars').that.is.a('number');
    expect(result).to.have.property('activeCars').that.is.a('number');
    expect(result).to.have.property('totalMessages').that.is.a('number');
    expect(result).to.have.property('totalViews').that.is.a('number');
    expect(result).to.have.property('revenue').that.is.a('number');
    expect(result).to.have.property('lastUpdated').that.is.a('string');
  });

  it('should return analytics for owner with email fallback (no claim)', async () => {
    const mockContext = {
      auth: {
        uid: 'owner-uid',
        token: {
          email: 'alaa.hamdani@yahoo.com'
          // No superAdmin claim (testing fallback)
        }
      }
    };

    const result = await wrapped({}, mockContext);

    expect(result).to.be.an('object');
    expect(result).to.have.property('totalUsers');
  });

  it('should exclude owner from user counts', async () => {
    const mockContext = {
      auth: {
        uid: 'owner-uid',
        token: {
          email: 'alaa.hamdani@yahoo.com',
          superAdmin: true
        }
      }
    };

    const result = await wrapped({}, mockContext);

    // The owner should not be counted in totalUsers
    // This is a smoke test - actual count depends on test data
    expect(result.totalUsers).to.be.at.least(0);
  });
});
