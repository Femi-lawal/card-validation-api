import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, '../screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Helper function to take named screenshots
async function takeScreenshot(page: Page, name: string, fullPage = true) {
  await page.screenshot({
    path: path.join(screenshotsDir, `${name}.png`),
    fullPage,
  });
}

// Run tests serially to avoid resource conflicts
test.describe.configure({ mode: 'serial' });

test.describe('SecurePay - New Features', () => {
  test.setTimeout(60000);

  test('01 - Landing Page & Encryption Status', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Wait for animations
    
    await takeScreenshot(page, '01-landing-page');
    
    // Verify new branding
    await expect(page.getByRole('heading', { name: 'SecurePay' })).toBeVisible();
    
    // Verify Encryption Badge
    await expect(page.getByText('End-to-end encrypted with AES-256-GCM')).toBeVisible();
    await takeScreenshot(page, '01b-encryption-badge');
  });

  test('02 - Theme Toggle', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Initial state (Dark Mode)
    await expect(page.locator('main')).not.toHaveClass(/light-mode/);

    // Toggle Light Mode
    await page.click('button[aria-label="Toggle theme"]');
    await page.waitForTimeout(1000);
    
    // Verify Light Mode class
    await expect(page.locator('main')).toHaveClass(/light-mode/);
    await takeScreenshot(page, '02-light-mode');

    // Toggle back to Dark Mode
    await page.click('button[aria-label="Toggle theme"]');
    await page.waitForTimeout(1000);
    await expect(page.locator('main')).not.toHaveClass(/light-mode/);
  });

  test('03 - 3D Secure Flow (Amount > $50)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Quick fill
    await page.click('button:has-text("Visa")');
    await page.waitForTimeout(500);

    // Set amount > $50
    await page.fill('input[placeholder="Amount"]', '100.00');
    
    // Submit
    await page.click('button[type="submit"]');

    // Expect 3D Secure Modal
    await expect(page.getByRole('heading', { name: '3D Secure Verification' })).toBeVisible();
    await expect(page.getByText('Enter the 6-digit code')).toBeVisible();
    await takeScreenshot(page, '03a-3ds-modal');

    // Enter OTP
    await page.locator('#otp-0').focus();
    // Simulate typing 123456 (logic handles auto-focus)
    await page.keyboard.type('123456');
    await page.waitForTimeout(500);

    // Verify OTP filled
    await page.click('button:has-text("Verify")');

    // Expect Receipt
    await expect(page.getByText('Payment Successful!')).toBeVisible();
    await expect(page.getByText('Transaction ID')).toBeVisible();
    await takeScreenshot(page, '03b-payment-success-receipt');
    
    // Close Receipt
    await page.click('button:has-text("Done")');
  });

  test('04 - Direct Payment Flow (Amount <= $50)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Quick fill
    await page.click('button:has-text("Visa")');
    await page.waitForTimeout(500);

    // Set amount <= $50
    await page.fill('input[placeholder="Amount"]', '49.00');
    
    // Submit
    await page.click('button[type="submit"]');

    // Expect Receipt DIRECTLY (No 3DS)
    await expect(page.getByText('Payment Successful!')).toBeVisible();
    await expect(page.getByText('Transaction ID')).toBeVisible();
    await expect(page.getByText('3D Secure Verification')).not.toBeVisible();
    
    await takeScreenshot(page, '04-direct-payment-receipt');
  });

  test('05 - Currency Switching', async ({ page }) => {
    await page.goto('/');
    
    // Check USD default
    await expect(page.locator('input[placeholder="Amount"]')).toBeVisible();
    
    // Switch to EUR
    await page.selectOption('select', 'EUR');
    await page.waitForTimeout(500);
    
    // Verify Symbol update in the custom UI if possible, or just the value
    // Note: The UI puts the symbol in a div, not the input.
    await expect(page.getByText('€', { exact: true })).toBeVisible();
    await takeScreenshot(page, '05-currency-eur');
  });
});
