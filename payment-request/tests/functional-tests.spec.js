// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('機能テスト（視覚的回帰なし）', () => {
  test('支払依頼登録ページの基本機能', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // ページが正常に読み込まれることを確認
    await expect(page).toHaveTitle('支払依頼登録(github連携①)');
    await expect(page.locator('h1').filter({ hasText: '支払依頼登録' })).toContainText('支払依頼登録');
    
    // 主要な要素が表示されることを確認
    await expect(page.locator('#staff-id')).toBeVisible();
    await expect(page.locator('#payee-id')).toBeVisible();
    await expect(page.locator('#invoice-number')).toBeVisible();
    await expect(page.locator('#slip-title')).toBeVisible();
    
    // ボタンが表示されることを確認
    await expect(page.locator('#register-btn')).toBeVisible();
    await expect(page.locator('#clear-btn')).toBeVisible();
    await expect(page.locator('#add-detail-btn')).toBeVisible();
  });

  test('フォーム入力機能', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // フォームに値を入力
    await page.fill('#staff-id', 'TEST001');
    await page.fill('#payee-id', 'PAYEE001');
    await page.fill('#invoice-number', 'INV-2024-001');
    await page.fill('#slip-title', 'テスト伝票');
    
    // 入力値が正しく設定されることを確認
    await expect(page.locator('#staff-id')).toHaveValue('TEST001');
    await expect(page.locator('#payee-id')).toHaveValue('PAYEE001');
    await expect(page.locator('#invoice-number')).toHaveValue('INV-2024-001');
    await expect(page.locator('#slip-title')).toHaveValue('テスト伝票');
  });

  test('明細入力ポップアップの動作', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // 明細入力ボタンをクリック（強制クリックを使用）
    await page.click('#add-detail-btn', { force: true });
    
    // ポップアップが表示されることを確認
    await expect(page.locator('#detail-popup')).toBeVisible();
    
    // JavaScriptによる動的なタイトル更新を待つ
    await page.waitForTimeout(100); // JavaScriptの実行を待つ
    
    // デフォルトで「明細入力（番組）」が表示されることを確認
    await expect(page.locator('#detail-popup-title')).toContainText('明細入力（番組）');
    
    // ポップアップを閉じる（強制クリックを使用）
    await page.click('button#detail-cancel', { force: true });
    await expect(page.locator('#detail-popup')).not.toBeVisible();
  });

  test('明細タイプ切り替えの動作', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // 明細入力ボタンをクリック（強制クリックを使用）
    await page.click('#add-detail-btn', { force: true });
    
    // ポップアップが表示されることを確認
    await expect(page.locator('#detail-popup')).toBeVisible();
    
    // デフォルトで「明細入力（番組）」が表示されることを確認
    await expect(page.locator('#detail-popup-title')).toContainText('明細入力（番組）');
    
    // プロジェクトタイプに切り替え（強制クリックを使用）
    await page.click('input[name="detail-type"][value="project"]', { force: true });
    await page.waitForTimeout(100); // JavaScriptの実行を待つ
    await expect(page.locator('#detail-popup-title')).toContainText('明細入力（プロジェクト）');
    
    // 経費その他タイプに切り替え（強制クリックを使用）
    await page.click('input[name="detail-type"][value="other"]', { force: true });
    await page.waitForTimeout(100); // JavaScriptの実行を待つ
    await expect(page.locator('#detail-popup-title')).toContainText('明細入力（経費その他）');
    
    // ポップアップを閉じる（強制クリックを使用）
    await page.click('button#detail-cancel', { force: true });
    await expect(page.locator('#detail-popup')).not.toBeVisible();
  });

  test('請求書読取ポップアップの動作', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // 請求書読取ボタンをクリック（強制クリックを使用）
    await page.click('#invoice-scan-btn', { force: true });
    
    // ポップアップが表示されることを確認
    await expect(page.locator('#invoice-scan-popup')).toBeVisible();
    
    // JavaScriptによる動的な更新を待つ
    await page.waitForTimeout(100);
    
    // ポップアップのタイトルを確認
    await expect(page.locator('#invoice-scan-popup h2')).toContainText('請求書読取');
    
    // ポップアップを閉じる（強制クリックを使用）
    await page.click('#invoice-scan-cancel', { force: true });
    await expect(page.locator('#invoice-scan-popup')).not.toBeVisible();
  });

  test('承認一覧ページの基本機能', async ({ page }) => {
    await page.goto('/approval-list.html');
    await page.waitForLoadState('networkidle');
    
    // JavaScriptの初期化を待つ
    await page.waitForTimeout(100);
    
    // ページが正常に読み込まれることを確認
    await expect(page).toHaveTitle('承認一覧');
    await expect(page.locator('h1').filter({ hasText: '承認一覧' })).toContainText('承認一覧');
    
    // テーブルが表示されることを確認
    await expect(page.locator('.approval-table table')).toBeVisible();
    
    // ボタンが表示されることを確認
    await expect(page.locator('#select-all-btn')).toBeVisible();
    await expect(page.locator('#deselect-all-btn')).toBeVisible();
    await expect(page.locator('#csv-export-btn')).toBeVisible();
  });

  test('伝票一覧ページの基本機能', async ({ page }) => {
    await page.goto('/slip-list.html');
    await page.waitForLoadState('networkidle');
    
    // JavaScriptの初期化を待つ
    await page.waitForTimeout(100);
    
    // ページが正常に読み込まれることを確認
    await expect(page).toHaveTitle('伝票一覧');
    await expect(page.locator('h1').filter({ hasText: '伝票一覧' })).toContainText('伝票一覧');
    
    // 検索フォームが表示されることを確認
    await expect(page.locator('#search-form')).toBeVisible();
    await expect(page.locator('#search-registration-number')).toBeVisible();
    await expect(page.locator('#search-staff-id')).toBeVisible();
    
    // テーブルが表示されることを確認
    await expect(page.locator('#slip-list-table')).toBeVisible();
  });

  test('ナビゲーション機能', async ({ page }) => {
    // 各ページにアクセスして基本要素が表示されることを確認
    const pages = [
      { url: '/index.html', title: '支払依頼登録(github連携①)' },
      { url: '/approval-list.html', title: '承認一覧' },
      { url: '/slip-list.html', title: '伝票一覧' }
    ];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');
      
      // JavaScriptの初期化を待つ
      await page.waitForTimeout(100);
      
      // タイトルが正しいことを確認
      await expect(page).toHaveTitle(pageInfo.title);
      
      // ヘッダーが表示されることを確認
      await expect(page.locator('header h1')).toContainText('EXAS');
      await expect(page.locator('.user-info')).toContainText('ログインユーザ： テストユーザ①');
    }
  });

  test('レスポンシブデザインの基本動作', async ({ page }) => {
    // デスクトップサイズ
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // JavaScriptの初期化を待つ
    await page.waitForTimeout(100);
    await expect(page.locator('header')).toBeVisible();
    
    // モバイルサイズ
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // JavaScriptの初期化を待つ
    await page.waitForTimeout(100);
    await expect(page.locator('header')).toBeVisible();
  });
});
