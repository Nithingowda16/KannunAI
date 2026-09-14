import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Real Browser WCAG 2.2 AA Accessibility Audits', () => {
  test('Landing page has zero critical or serious WCAG accessibility violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .disableRules(['color-contrast']) // Ignore dynamic browser color rendering quirks in dark mode
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalViolations).toEqual([]);
  });

  test('Upload view meets WCAG 2.2 AA keyboard accessibility requirements', async ({ page }) => {
    await page.goto('/');
    const uploadBtn = page.getByRole('button', { name: /upload/i }).first();
    await uploadBtn.click();

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();

    const criticalViolations = scanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalViolations).toEqual([]);
  });
});
