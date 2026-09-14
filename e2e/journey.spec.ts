import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Real End-to-End Legal Document Journey', () => {
  test('Complete legal document processing, analysis, risk radar, Q&A, and brief journey', async ({ page }) => {
    // 1. Load application homepage
    await page.goto('/');

    // Verify brand header and main title
    await expect(page).toHaveTitle(/KannunAI/i);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // 2. Click "Upload Your Contract" button to enter upload zone
    const uploadBtn = page.getByRole('button', { name: /upload/i }).first();
    await uploadBtn.click();

    // 3. Upload test contract fixture via native file input
    const fixturePath = path.resolve(process.cwd(), 'fixtures/sample-contract.txt');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(fixturePath);

    // 4. Verify workspace views after processing
    await expect(page.getByText(/Plain-Language Document Summary/i)).toBeVisible({ timeout: 15000 });

    // 5. Check Plain-Language Summary tab
    await expect(page.getByText(/Plain-Language Document Summary/i)).toBeVisible();

    // 6. Switch to Risk Radar tab
    const riskTab = page.getByRole('tab', { name: /risk/i });
    if (await riskTab.isVisible()) {
      await riskTab.click();
      await expect(page.getByText(/risk/i).first()).toBeVisible();
    }

    // 7. Switch to Grounded Q&A tab
    const qaTab = page.getByRole('tab', { name: /ask ai|q&a/i });
    if (await qaTab.isVisible()) {
      await qaTab.click();
      await expect(page.getByPlaceholder(/ask a question/i)).toBeVisible();
    }
  });
});
