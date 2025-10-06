// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('シンプルな視覚的回帰テスト', () => {
  test.beforeEach(async ({ page }) => {
    // 基本的な安定化のみ
    await page.addStyleTag({
      content: `
        * {
          animation: none !important;
          transition: none !important;
        }
      `
    });
  });

  test('支払依頼登録ページ - 基本スクリーンショット', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // 日付フィールドを固定
    await page.evaluate(() => {
      const dateInputs = document.querySelectorAll('input[type="date"]');
      dateInputs.forEach(input => {
        if (!input.value) {
          input.value = '2024-12-25';
        }
      });
    });
    
    // 少し待機
    await page.waitForTimeout(500);
    
    // 非常に緩い設定でスクリーンショット
    await expect(page).toHaveScreenshot('simple-payment-request.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.8, // 非常に緩い閾値
      maxDiffPixels: 5000 // 大きな許容値
    });
  });

  test('承認一覧ページ - 基本スクリーンショット', async ({ page }) => {
    await page.goto('/approval-list.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('simple-approval-list.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.8,
      maxDiffPixels: 5000
    });
  });

  test('伝票一覧ページ - 基本スクリーンショット', async ({ page }) => {
    await page.goto('/slip-list.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('simple-slip-list.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.8,
      maxDiffPixels: 5000
    });
  });
});
