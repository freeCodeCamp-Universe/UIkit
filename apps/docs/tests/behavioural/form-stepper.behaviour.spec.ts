import { test, expect } from '@playwright/test';

const PROGRESS = '.form-stepper__progress';
const STEP_BTN = '.form-stepper__step-btn';

test.describe('@behavioural form-stepper', () => {
  test('seed step is Profile (aria-current="step")', async ({ page }) => {
    await page.goto('/playground#form-stepper', { waitUntil: 'networkidle' });
    const card = page.locator('section#form-stepper .showcase__preview');
    await expect(card).toBeVisible();
    const current = card.locator(`${STEP_BTN}[aria-current="step"]`);
    await expect(current).toHaveCount(1);
    await expect(current).toContainText('Profile');
  });

  test('clicking the previous (complete) step moves aria-current', async ({
    page
  }) => {
    await page.goto('/playground#form-stepper', { waitUntil: 'networkidle' });
    const card = page.locator('section#form-stepper .showcase__preview');
    const buttons = card.locator(STEP_BTN);
    // Step 1 is "complete" → still navigable per default policy.
    await buttons.nth(0).click();
    const current = card.locator(`${STEP_BTN}[aria-current="step"]`);
    await expect(current).toContainText('Account');
  });

  test('upcoming steps are disabled (forward leap-frog blocked)', async ({
    page
  }) => {
    await page.goto('/playground#form-stepper', { waitUntil: 'networkidle' });
    const card = page.locator('section#form-stepper .showcase__preview');
    const buttons = card.locator(STEP_BTN);
    await expect(buttons).toHaveCount(4);
    // Profile is current (seeded), so Goals + Review are upcoming.
    await expect(buttons.nth(2)).toBeDisabled();
    await expect(buttons.nth(3)).toBeDisabled();
    // Account is complete, Profile is current → both navigable.
    await expect(buttons.nth(0)).toBeEnabled();
    await expect(buttons.nth(1)).toBeEnabled();
    await expect(card.locator(PROGRESS)).toHaveAttribute(
      'aria-label',
      'Onboarding progress'
    );
  });
});
