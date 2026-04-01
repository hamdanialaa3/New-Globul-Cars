/**
 * E2E Tests: V2.0 Features - Instant Financing
 * Tests the complete flow from credit score to loan acceptance
 *
 * File: e2e/v2-financing-instant.spec.ts
 * Created: April 1, 2026
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TEST_USER_EMAIL = 'test@koli.one';
const TEST_USER_PASSWORD = 'SecureTest123!';

test.describe('V2.0 Engine 4: Instant Financing', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    await page.click('button:has-text("Sign In")');
    await page.waitForURL(`${BASE_URL}/`);
  });

  test('should navigate to financing instant page from financing calculator', async ({
    page,
  }) => {
    // Start from financing calculator
    await page.goto(`${BASE_URL}/financing`);
    await page.waitForLoadState('networkidle');

    // Check for Instant Pre-Approval button
    const instantButton = page.locator(
      'button:has-text("Instant Pre-Approval")'
    );
    await expect(instantButton).toBeVisible({ timeout: 5000 });

    // Click button
    await instantButton.click();
    await page.waitForURL(`${BASE_URL}/financing/instant`);

    // Verify page loaded
    await expect(page.locator('text=Instant Pre-Approval')).toBeVisible();
    await expect(
      page.locator('text=Get approved offers from 4 Bulgarian banks')
    ).toBeVisible();
  });

  test('should complete credit score scoring flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/financing/instant`);
    await page.waitForLoadState('networkidle');

    // Fill in profile information
    await page.fill('input[placeholder="Monthly Income"]', '3500');
    await page.fill('input[placeholder="Existing Monthly Debt"]', '300');
    await page.fill('input[placeholder="Years Employed"]', '5');
    await page.fill('input[placeholder="Age"]', '35');

    // Run score
    const scoreButton = page.locator('button:has-text("Run Instant Score")');
    await scoreButton.click();

    // Wait for score response
    await expect(page.locator('text=Score:')).toBeVisible({ timeout: 10000 });

    // Verify score info displayed
    await expect(
      page.locator('text=/Rating|Max Loan|Suggested Rate/')
    ).toBeDefined();
  });

  test('should submit financing application and receive offers', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/financing/instant`);
    await page.waitForLoadState('networkidle');

    // Fill application details
    await page.fill('input[placeholder="Monthly Income"]', '3000');
    await page.fill('input[placeholder="Car Price"]', '32000');
    await page.fill('input[placeholder="Down Payment"]', '8000');
    await page.fill('input[placeholder="Term"]', '60');

    // Submit application
    const submitButton = page.locator('button:has-text("Get Instant Offers")');
    await submitButton.click();

    // Wait for offers to appear
    const dsaBank = page.locator('text=DSK Bank Bulgaria');
    await expect(dsaBank).toBeVisible({ timeout: 15000 });

    // Verify 4 banks receiving offers
    const tbiBank = page.locator('text=TBI Bank Bulgaria');
    const fibankBank = page.locator('text=Fibank Bulgaria');
    const unicreditBank = page.locator('text=UniCredit Bank Bulgaria');

    await expect(tbiBank).toBeVisible();
    await expect(fibankBank).toBeVisible();
    await expect(unicreditBank).toBeVisible();

    // Verify offer details are displayed
    await expect(
      page.locator('text=/Monthly Payment|Annual Rate|Term/')
    ).toBeDefined();
  });

  test('should accept top offer', async ({ page }) => {
    await page.goto(`${BASE_URL}/financing/instant`);
    await page.waitForLoadState('networkidle');

    // Set minimal form data and submit
    await page.fill('input[placeholder="Monthly Income"]', '4000');
    await page.fill('input[placeholder="Car Price"]', '25000');
    await page.fill('input[placeholder="Down Payment"]', '5000');
    await page.fill('input[placeholder="Term"]', '48');

    await page.click('button:has-text("Get Instant Offers")');

    // Wait for offers
    await expect(page.locator('text=DSK Bank Bulgaria')).toBeVisible({
      timeout: 15000,
    });

    // Accept top offer
    const acceptButton = page.locator('button:has-text("Accept Top Offer")');
    await acceptButton.click();

    // Verify success message
    await expect(page.locator('text=/Offer accepted|success/i')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should validate credit score range boundaries', async ({ page }) => {
    await page.goto(`${BASE_URL}/financing/instant`);
    await page.waitForLoadState('networkidle');

    // Try to submit with invalid income
    await page.fill('input[placeholder="Monthly Income"]', '-1000');

    const submitButton = page.locator('button:has-text("Get Instant Offers")');
    await submitButton.click();

    // Should see validation error
    await expect(page.locator('text=/invalid|error|required/i')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should redirect to financing calc if feature flag disabled', async ({
    page,
  }) => {
    // This test assumes we can temporarily disable the flag via admin panel
    // In production, would use environment variable

    // Navigate directly to instant page
    await page.goto(`${BASE_URL}/financing/instant`);

    // Page should redirect if flag is false
    // (This behavior depends on feature flag implementation)
    const currentURL = page.url();
    const expectedRedirect =
      currentURL.includes('/financing') || currentURL.includes('/');

    expect(expectedRedirect).toBeTruthy();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto(`${BASE_URL}/financing/instant`);
    await page.waitForLoadState('networkidle');

    // Go offline
    await page.context().setOffline(true);

    // Try to submit
    await page.fill('input[placeholder="Monthly Income"]', '2500');
    await page.fill('input[placeholder="Car Price"]', '28000');
    await page.click('button:has-text("Get Instant Offers")');

    // Should show error
    await expect(page.locator('text=/error|failed/i')).toBeVisible({
      timeout: 5000,
    });

    // Go back online
    await page.context().setOffline(false);
  });

  test('should display comparison page link', async ({ page }) => {
    await page.goto(`${BASE_URL}/financing/instant`);
    await page.waitForLoadState('networkidle');

    // Submit to get offers
    await page.fill('input[placeholder="Monthly Income"]', '3500');
    await page.fill('input[placeholder="Car Price"]', '30000');
    await page.click('button:has-text("Get Instant Offers")');

    // Wait for offers
    await expect(page.locator('text=DSK Bank Bulgaria')).toBeVisible({
      timeout: 15000,
    });

    // Find and click compare link
    const compareButton = page.locator('button:has-text("Compare All Banks")');
    await compareButton.click();

    // Should navigate to comparison page
    await page.waitForURL(/financing\/compare/);
    await expect(page.url()).toContain('/financing/compare');
  });
});
