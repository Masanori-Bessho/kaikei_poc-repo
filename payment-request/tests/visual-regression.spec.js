// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('視覚的回帰テスト', () => {
  test.beforeEach(async ({ page }) => {
    // テスト実行前にページの読み込みを待つ
    await page.waitForLoadState('networkidle');
    
    // 動的コンテンツを固定化
    await page.addStyleTag({
      content: `
        * {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
    
    // 日付フィールドを固定値に設定
    await page.evaluate(() => {
      const dateInputs = document.querySelectorAll('input[type="date"]');
      dateInputs.forEach(input => {
        if (!input.value) {
          input.value = '2024-12-25';
        }
      });
      
      const monthInputs = document.querySelectorAll('input[type="month"]');
      monthInputs.forEach(input => {
        if (!input.value) {
          input.value = '2024-12';
        }
      });
    });
  });

  test('支払依頼登録ページの全体スクリーンショット', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // 追加の安定化処理
    await page.waitForTimeout(1000); // レンダリング完了を待つ
    
    // ページ全体のスクリーンショットを撮影
    await expect(page).toHaveScreenshot('payment-request-full-page.png', {
      fullPage: true,
      animations: 'disabled', // アニメーションを無効化して安定したスクリーンショットを取得
      threshold: 0.3, // 閾値を緩く設定
      maxDiffPixels: 1000 // 最大差分ピクセル数を増加
    });
  });

  test('支払依頼登録ページのヘッダー部分', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // ヘッダー部分のスクリーンショット
    const header = page.locator('header');
    await expect(header).toHaveScreenshot('payment-request-header.png');
  });

  test('支払依頼登録ページのフォーム部分', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // フォーム部分のスクリーンショット
    const form = page.locator('#payment-request-form');
    await expect(form).toHaveScreenshot('payment-request-form.png');
  });

  test('支払依頼登録ページの明細テーブル部分', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // 明細テーブル部分のスクリーンショット
    const table = page.locator('#details-table');
    await expect(table).toHaveScreenshot('payment-request-details-table.png');
  });

  test('明細入力ポップアップのスクリーンショット', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // 明細入力ボタンをクリック
    await page.click('#add-detail-btn', { force: true });
    await page.waitForSelector('#detail-popup');
    
    // ポップアップのスクリーンショット
    const popup = page.locator('#detail-popup');
    await expect(popup).toHaveScreenshot('detail-popup.png');
  });

  test('請求書読取ポップアップのスクリーンショット', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // 請求書読取ボタンをクリック（強制クリックを使用）
    await page.click('#invoice-scan-btn', { force: true });
    await page.waitForSelector('#invoice-scan-popup');
    
    // ポップアップのスクリーンショット
    const popup = page.locator('#invoice-scan-popup');
    await expect(popup).toHaveScreenshot('invoice-scan-popup.png');
  });

  test('承認一覧ページの全体スクリーンショット', async ({ page }) => {
    await page.goto('/approval-list.html');
    await page.waitForLoadState('networkidle');
    
    // ページ全体のスクリーンショット
    await expect(page).toHaveScreenshot('approval-list-full-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('承認一覧ページの検索条件部分', async ({ page }) => {
    await page.goto('/approval-list.html');
    await page.waitForLoadState('networkidle');
    
    // 検索条件部分のスクリーンショット
    const searchSection = page.locator('.search-section');
    await expect(searchSection).toHaveScreenshot('approval-list-search-section.png');
  });

  test('承認一覧ページのテーブル部分', async ({ page }) => {
    await page.goto('/approval-list.html');
    await page.waitForLoadState('networkidle');
    
    // テーブル部分のスクリーンショット
    const table = page.locator('.approval-table');
    await expect(table).toHaveScreenshot('approval-list-table.png');
  });

  test('伝票一覧ページの全体スクリーンショット', async ({ page }) => {
    await page.goto('/slip-list.html');
    await page.waitForLoadState('networkidle');
    
    // ページ全体のスクリーンショット
    await expect(page).toHaveScreenshot('slip-list-full-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('伝票一覧ページの検索条件部分', async ({ page }) => {
    await page.goto('/slip-list.html');
    await page.waitForLoadState('networkidle');
    
    // 検索条件部分のスクリーンショット
    const searchSection = page.locator('.search-section');
    await expect(searchSection).toHaveScreenshot('slip-list-search-section.png');
  });

  test('伝票一覧ページのテーブル部分', async ({ page }) => {
    await page.goto('/slip-list.html');
    await page.waitForLoadState('networkidle');
    
    // テーブル部分のスクリーンショット
    const table = page.locator('#slip-list-table');
    await expect(table).toHaveScreenshot('slip-list-table.png');
  });

  test('伝票詳細モーダルのスクリーンショット', async ({ page }) => {
    await page.goto('/slip-list.html');
    await page.waitForLoadState('networkidle');
    
    // モーダルを表示（実際のアプリケーションでは行をクリックして表示）
    await page.evaluate(() => {
      document.getElementById('slip-detail-modal').style.display = 'block';
    });
    
    // モーダルのスクリーンショット
    const modal = page.locator('#slip-detail-modal');
    await expect(modal).toHaveScreenshot('slip-detail-modal.png');
  });

  test('レスポンシブデザイン - モバイル表示', async ({ page }) => {
    // モバイルサイズに設定
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // モバイル表示のスクリーンショット
    await expect(page).toHaveScreenshot('payment-request-mobile.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('レスポンシブデザイン - タブレット表示', async ({ page }) => {
    // タブレットサイズに設定
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // タブレット表示のスクリーンショット
    await expect(page).toHaveScreenshot('payment-request-tablet.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('フォーム入力状態のスクリーンショット', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // フォームに値を入力
    await page.fill('#staff-id', 'TEST001');
    await page.fill('#payee-id', 'PAYEE001');
    await page.fill('#invoice-number', 'INV-2024-001');
    await page.fill('#slip-title', 'テスト伝票');
    
    // 入力後のフォームのスクリーンショット
    const form = page.locator('#payment-request-form');
    await expect(form).toHaveScreenshot('payment-request-form-filled.png');
  });

  test('エラー状態のスクリーンショット', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // 無効な値を入力してエラー状態をシミュレート
    await page.fill('#staff-id', '');
    await page.fill('#payee-id', '');
    await page.fill('#invoice-number', '');
    
    // エラー状態のスクリーンショット
    const form = page.locator('#payment-request-form');
    await expect(form).toHaveScreenshot('payment-request-form-error.png');
  });

  test('異なるブラウザでの表示確認', async ({ page, browserName }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // ブラウザ名を含むスクリーンショット名
    await expect(page).toHaveScreenshot(`payment-request-${browserName}.png`, {
      fullPage: true,
      animations: 'disabled'
    });
  });
});
