// Wave 9 P2.10 (W9-B17) — FormStepper behavioural contract.
//
// `<FormStepper>` is a stateful flow primitive. The demo island
// (`_islands/FormStepperDemo.tsx`) seeds current='profile' (step 2
// of 4) so the showcase paints with progress already in flight. The
// contract surface this spec locks:
//
//   1. Exactly one step button advertises `aria-current="step"`,
//      and on the seed render that step is "Profile".
//   2. Backwards navigation works — clicking the prior step's
//      button moves `aria-current` to it.
//   3. Forward gating works — upcoming steps are `disabled`, so
//      the user cannot leap-frog past the current one.
import { test, expect } from '@playwright/test';

const PROGRESS = '.form-stepper__progress';
const STEP_BTN = '.form-stepper__step-btn';

test.describe('@behavioural form-stepper', () => {
  test('seed step is Profile (aria-current="step")', async ({ page }) => {
    await page.goto('/#form-stepper', { waitUntil: 'networkidle' });
    const card = page.locator('section#form-stepper .showcase__preview');
    await expect(card).toBeVisible();
    const current = card.locator(`${STEP_BTN}[aria-current="step"]`);
    await expect(current).toHaveCount(1);
    await expect(current).toContainText('Profile');
  });

  test('clicking the previous (complete) step moves aria-current', async ({
    page
  }) => {
    await page.goto('/#form-stepper', { waitUntil: 'networkidle' });
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
    await page.goto('/#form-stepper', { waitUntil: 'networkidle' });
    const card = page.locator('section#form-stepper .showcase__preview');
    const buttons = card.locator(STEP_BTN);
    await expect(buttons).toHaveCount(4);
    // Profile is current (seeded), so Goals + Review are upcoming.
    await expect(buttons.nth(2)).toBeDisabled();
    await expect(buttons.nth(3)).toBeDisabled();
    // Account is complete, Profile is current → both navigable.
    await expect(buttons.nth(0)).toBeEnabled();
    await expect(buttons.nth(1)).toBeEnabled();
    // The progress list owns the aria-label so screen readers
    // announce the surface as a flow, not a generic ordered list.
    await expect(card.locator(PROGRESS)).toHaveAttribute(
      'aria-label',
      'Onboarding progress'
    );
  });
});
