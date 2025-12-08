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

test.describe('SecurePay - Visual Demo', () => {
  test.setTimeout(60000);

  test('01 - Landing Page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Wait for animations
    
    await takeScreenshot(page, '01-landing-page');
    
    // Verify new branding
    await expect(page.getByRole('heading', { name: 'SecurePay' })).toBeVisible();
    await expect(page.getByText('Fast, secure payment processing')).toBeVisible();
  });

  test('02 - Visa Card Selection', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Visa")');
    await page.waitForTimeout(800);
    
    await takeScreenshot(page, '02-visa-card-selected');
    
    // Verify Visa brand appears on the card
    await expect(page.getByText('VISA').first()).toBeVisible();
  });

  test('03 - Mastercard Selection', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Mastercard")');
    await page.waitForTimeout(800);
    
    await takeScreenshot(page, '03-mastercard-selected');
    
    // Verify Mastercard brand appears on the card
    await expect(page.getByText('MASTERCARD').first()).toBeVisible();
  });

  test('04 - Amex Card Selection', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Amex")');
    await page.waitForTimeout(800);
    
    await takeScreenshot(page, '04-amex-card-selected');
    
    // Verify Amex brand appears on the card
    await expect(page.getByText('AMEX').first()).toBeVisible();
  });

  test('05 - Card Flip Animation (CVV Focus)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    // Fill with test card first
    await page.click('button:has-text("Visa")');
    await page.waitForTimeout(500);
    
    // Screenshot before flip
    await takeScreenshot(page, '05a-card-front');
    
    // Focus CVV to trigger flip
    await page.focus('input[placeholder*="CVV"]');
    await page.waitForTimeout(1000); // Wait for flip animation
    
    // Screenshot showing back of card
    await takeScreenshot(page, '05b-card-back-cvv');
    
    // Click elsewhere to blur and flip card back
    await page.click('input[placeholder="Cardholder Name"]');
    await page.waitForTimeout(800);
  });

  test('06 - Form Completion Flow', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    // Fill manually step by step
    await page.fill('input[placeholder="Card Number"]', '4242 4242 4242 4242');
    await page.waitForTimeout(400);
    await takeScreenshot(page, '06a-card-number-entered');
    
    await page.fill('input[placeholder="MM/YY"]', '12/28');
    await page.fill('input[placeholder*="CVV"]', '123');
    await page.waitForTimeout(400);
    await takeScreenshot(page, '06b-expiry-cvv-entered');
    
    await page.fill('input[placeholder="Cardholder Name"]', 'JOHN DOE');
    await page.fill('input[placeholder="Email"]', 'john@example.com');
    await page.fill('input[placeholder*="Phone"]', '+14155552671');
    await page.waitForTimeout(400);
    await takeScreenshot(page, '06c-form-completed');
  });

  test('07 - Custom Amount', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Visa")');
    await page.waitForTimeout(500);
    
    // Clear and set custom amount
    await page.fill('input[placeholder="Amount"]', '');
    await page.fill('input[placeholder="Amount"]', '499.99');
    await page.waitForTimeout(400);
    
    await takeScreenshot(page, '07-custom-amount');
    
    await expect(page.locator('button:has-text("Pay $499.99")')).toBeVisible();
  });
});

test.describe('SecurePay - Responsive Design', () => {
  test.setTimeout(60000);

  test('08 - Desktop View', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    
    await page.click('button:has-text("Mastercard")');
    await page.waitForTimeout(600);
    
    await takeScreenshot(page, '08-desktop-view');
  });

  test('09 - Tablet View', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    
    await page.click('button:has-text("Visa")');
    await page.waitForTimeout(600);
    
    await takeScreenshot(page, '09-tablet-view');
  });

  test('10 - Mobile View', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    
    await page.click('button:has-text("Amex")');
    await page.waitForTimeout(600);
    
    await takeScreenshot(page, '10-mobile-view');
  });
});

test.describe('SecurePay - Interactive Features', () => {
  test.setTimeout(60000);

  test('11 - Card Network Detection', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    const cardNumberInput = page.locator('input[placeholder="Card Number"]');
    
    // Visa detection
    await cardNumberInput.fill('4');
    await page.waitForTimeout(400);
    await takeScreenshot(page, '11a-visa-detection');
    
    // Mastercard detection  
    await cardNumberInput.fill('5555');
    await page.waitForTimeout(400);
    await takeScreenshot(page, '11b-mastercard-detection');
    
    // Amex detection
    await cardNumberInput.fill('378');
    await page.waitForTimeout(400);
    await takeScreenshot(page, '11c-amex-detection');
    
    // Discover detection
    await cardNumberInput.fill('6011');
    await page.waitForTimeout(400);
    await takeScreenshot(page, '11d-discover-detection');
  });

  test('12 - Security Features', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    // Verify security badges are visible
    await expect(page.getByText('256-bit SSL')).toBeVisible();
    await expect(page.getByText('PCI Compliant')).toBeVisible();
    await expect(page.getByText('Verified').first()).toBeVisible();
    
    await takeScreenshot(page, '12-security-features');
  });

  test('13 - Glass Effect Form', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Visa")');
    await page.waitForTimeout(600);
    
    // Screenshot of just the form area
    const form = page.locator('form');
    await form.screenshot({
      path: path.join(screenshotsDir, '13-glass-effect-form.png'),
    });
  });
});
