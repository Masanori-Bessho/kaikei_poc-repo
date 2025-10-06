// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('安定化された視覚的回帰テスト', () => {
  test.beforeEach(async ({ page }) => {
    // 動的コンテンツを完全に固定化
    await page.addStyleTag({
      content: `
        * {
          animation: none !important;
          transition: none !important;
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
        
        /* フォントを統一 */
        * {
          font-family: Arial, sans-serif !important;
        }
        
        /* スクロールバーを非表示 */
        ::-webkit-scrollbar {
          display: none !important;
        }
        
        /* カーソルを統一 */
        * {
          cursor: default !important;
        }
      `
    });
    
    // 日付・時刻を固定化
    await page.addInitScript(() => {
      // 現在時刻を固定
      const fixedDate = new Date('2024-12-25T10:00:00Z');
      Date.now = () => fixedDate.getTime();
      Date.prototype.getTime = function() { return fixedDate.getTime(); };
      
      // ランダム要素を固定化
      Math.random = () => 0.5;
    });
  });

  test('支払依頼登録ページ - 安定化版', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // 日付フィールドを固定値に設定
    await page.evaluate(() => {
      const dateInputs = document.querySelectorAll('input[type="date"]');
      dateInputs.forEach(input => {
        input.value = '2024-12-25';
      });
      
      const monthInputs = document.querySelectorAll('input[type="month"]');
      monthInputs.forEach(input => {
        input.value = '2024-12';
      });
    });
    
    // レンダリング完了を待つ
    await page.waitForTimeout(2000);
    
    // ページ全体のスクリーンショット
    await expect(page).toHaveScreenshot('stable-payment-request-full.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.5,
      maxDiffPixels: 2000
    });
  });

  test('支払依頼登録ページ - ヘッダー部分', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const header = page.locator('header');
    await expect(header).toHaveScreenshot('stable-payment-request-header.png', {
      threshold: 0.5,
      maxDiffPixels: 500
    });
  });

  test('支払依頼登録ページ - フォーム部分', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const form = page.locator('#payment-request-form');
    await expect(form).toHaveScreenshot('stable-payment-request-form.png', {
      threshold: 0.5,
      maxDiffPixels: 1000
    });
  });

  test('承認一覧ページ - 安定化版', async ({ page }) => {
    await page.goto('/approval-list.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('stable-approval-list-full.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.5,
      maxDiffPixels: 2000
    });
  });

  test('伝票一覧ページ - 安定化版', async ({ page }) => {
    await page.goto('/slip-list.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('stable-slip-list-full.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.5,
      maxDiffPixels: 2000
    });
  });

  test('レスポンシブデザイン - モバイル', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('stable-mobile-view.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.5,
      maxDiffPixels: 2000
    });
  });

  test('レスポンシブデザイン - タブレット', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('stable-tablet-view.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.5,
      maxDiffPixels: 2000
    });
  });
});
