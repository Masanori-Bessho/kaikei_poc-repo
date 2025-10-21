// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('シンプルテスト', () => {
  test('ページ読み込みテスト', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // JavaScriptの初期化を待つ
    await page.waitForTimeout(100);
    
    // 基本的な要素の存在確認
    await expect(page).toHaveTitle('支払依頼登録(github連携⑧)');
    await expect(page.locator('h1').filter({ hasText: '支払依頼登録' })).toContainText('支払依頼登録');
  });

  test('フォーム要素テスト', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // JavaScriptの初期化を待つ
    await page.waitForTimeout(100);
    
    // 主要なフォーム要素の確認
    await expect(page.locator('#staff-id')).toBeVisible();
    await expect(page.locator('#payee-id')).toBeVisible();
    await expect(page.locator('#invoice-number')).toBeVisible();
  });
});
