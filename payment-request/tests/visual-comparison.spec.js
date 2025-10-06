// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('視覚的比較テスト', () => {
  test('支払依頼登録ページの状態別比較', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // 初期状態のスクリーンショット
    await expect(page).toHaveScreenshot('payment-request-initial-state.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // フォーム入力後の状態
    await page.fill('#staff-id', 'TEST001');
    await page.fill('#payee-id', 'PAYEE001');
    await page.fill('#invoice-number', 'INV-2024-001');
    await page.fill('#slip-title', 'テスト伝票');
    
    await expect(page).toHaveScreenshot('payment-request-filled-state.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // フォームクリア後の状態
    await page.click('#clear-btn');
    await page.waitForTimeout(500); // クリア処理の完了を待つ
    
    await expect(page).toHaveScreenshot('payment-request-cleared-state.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('明細入力ポップアップの状態別比較', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // 明細入力ボタンをクリック
    await page.click('#add-detail-btn');
    await page.waitForSelector('#detail-popup');
    
    // 初期状態（番組選択）
    await expect(page.locator('#detail-popup')).toHaveScreenshot('detail-popup-program-state.png');
    
    // プロジェクト選択状態
    await page.click('#detail-type-project');
    await page.waitForTimeout(300); // 状態変更の完了を待つ
    
    await expect(page.locator('#detail-popup')).toHaveScreenshot('detail-popup-project-state.png');
    
    // その他選択状態
    await page.click('#detail-type-other');
    await page.waitForTimeout(300);
    
    await expect(page.locator('#detail-popup')).toHaveScreenshot('detail-popup-other-state.png');
  });

  test('消費税端数処理の選択状態比較', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    const roundingSection = page.locator('.rounding-group');
    
    // 四捨五入選択状態（デフォルト）
    await expect(roundingSection).toHaveScreenshot('tax-rounding-half-up.png');
    
    // 切り上げ選択状態
    await page.click('#round-up');
    await page.waitForTimeout(300);
    
    await expect(roundingSection).toHaveScreenshot('tax-rounding-up.png');
    
    // 切り捨て選択状態
    await page.click('#round-down');
    await page.waitForTimeout(300);
    
    await expect(roundingSection).toHaveScreenshot('tax-rounding-down.png');
  });

  test('承認一覧ページの検索条件状態比較', async ({ page }) => {
    await page.goto('/approval-list.html');
    await page.waitForLoadState('networkidle');
    
    const searchSection = page.locator('.search-section');
    
    // 初期状態（一般・全て選択）
    await expect(searchSection).toHaveScreenshot('approval-search-initial.png');
    
    // 謝金・未承認選択状態
    await page.click('#slip-type-gratuity');
    await page.click('#approval-status-pending');
    await page.waitForTimeout(300);
    
    await expect(searchSection).toHaveScreenshot('approval-search-gratuity-pending.png');
    
    // 概算・承認選択状態
    await page.click('#slip-type-estimate');
    await page.click('#approval-status-approved');
    await page.waitForTimeout(300);
    
    await expect(searchSection).toHaveScreenshot('approval-search-estimate-approved.png');
  });

  test('伝票一覧ページの検索条件入力状態比較', async ({ page }) => {
    await page.goto('/slip-list.html');
    await page.waitForLoadState('networkidle');
    
    const searchSection = page.locator('.search-section');
    
    // 初期状態（空のフォーム）
    await expect(searchSection).toHaveScreenshot('slip-search-initial.png');
    
    // 検索条件入力状態
    await page.fill('#search-registration-number', 'REG-2024-001');
    await page.fill('#search-staff-id', 'TEST001');
    await page.fill('#search-payee-name', 'テスト株式会社');
    
    const today = new Date().toISOString().split('T')[0];
    await page.fill('#search-date-from', today);
    await page.fill('#search-date-to', today);
    await page.fill('#search-amount-from', '1000');
    await page.fill('#search-amount-to', '100000');
    
    await expect(searchSection).toHaveScreenshot('slip-search-filled.png');
    
    // クリア後の状態
    await page.click('#clear-search-btn');
    await page.waitForTimeout(500);
    
    await expect(searchSection).toHaveScreenshot('slip-search-cleared.png');
  });

  test('レスポンシブデザインの画面サイズ別比較', async ({ page }) => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1200, height: 800 },
      { name: 'large', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/index.html');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot(`responsive-${viewport.name}.png`, {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('異なるブラウザでの表示比較', async ({ page, browserName }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // 各ブラウザでの表示を比較
    await expect(page).toHaveScreenshot(`browser-comparison-${browserName}.png`, {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('フォームバリデーション状態の比較', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // 必須フィールドを空のまま送信を試行
    await page.click('#register-btn');
    await page.waitForTimeout(500);
    
    // バリデーションエラー状態のスクリーンショット
    await expect(page.locator('#payment-request-form')).toHaveScreenshot('form-validation-errors.png');
    
    // 必須フィールドを入力
    await page.fill('#staff-id', 'TEST001');
    await page.fill('#payee-id', 'PAYEE001');
    await page.fill('#invoice-number', 'INV-2024-001');
    
    // 入力後の状態
    await expect(page.locator('#payment-request-form')).toHaveScreenshot('form-validation-filled.png');
  });

  test('テーブルの状態別比較', async ({ page }) => {
    await page.goto('/approval-list.html');
    await page.waitForLoadState('networkidle');
    
    const table = page.locator('.approval-table');
    
    // 初期状態
    await expect(table).toHaveScreenshot('table-initial-state.png');
    
    // 全選択状態
    await page.click('#select-all-btn');
    await page.waitForTimeout(300);
    
    await expect(table).toHaveScreenshot('table-all-selected.png');
    
    // 全解除状態
    await page.click('#deselect-all-btn');
    await page.waitForTimeout(300);
    
    await expect(table).toHaveScreenshot('table-none-selected.png');
  });

  test('ポップアップの表示・非表示状態比較', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // ポップアップ非表示状態
    await expect(page.locator('#detail-popup')).not.toBeVisible();
    await expect(page.locator('#invoice-scan-popup')).not.toBeVisible();
    
    // 明細入力ポップアップ表示状態
    await page.click('#add-detail-btn');
    await page.waitForSelector('#detail-popup');
    
    await expect(page.locator('#detail-popup')).toHaveScreenshot('popup-detail-visible.png');
    
    // ポップアップを閉じる
    await page.click('#detail-cancel');
    await page.waitForTimeout(300);
    
    // 請求書読取ポップアップ表示状態
    await page.click('#invoice-scan-btn');
    await page.waitForSelector('#invoice-scan-popup');
    
    await expect(page.locator('#invoice-scan-popup')).toHaveScreenshot('popup-invoice-scan-visible.png');
  });
});
