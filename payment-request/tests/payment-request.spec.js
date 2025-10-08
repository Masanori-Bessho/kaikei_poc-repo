// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('支払依頼登録ページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('ページが正常に読み込まれる', async ({ page }) => {
    await expect(page).toHaveTitle('支払依頼登録(github連携②)');
    await expect(page.locator('h1').filter({ hasText: '支払依頼登録' })).toContainText('支払依頼登録');
  });

  test('ヘッダー要素が表示される', async ({ page }) => {
    await expect(page.locator('header h1')).toContainText('EXAS');
    await expect(page.locator('.user-info')).toContainText('ログインユーザ： テストユーザ①');
  });

  test('必須フィールドが表示される', async ({ page }) => {
    // 担当者フィールド
    await expect(page.locator('#staff-id')).toBeVisible();
    await expect(page.locator('button:has-text("担当者")')).toBeVisible();
    
    // 相手先フィールド
    await expect(page.locator('#payee-id')).toBeVisible();
    await expect(page.locator('button:has-text("相手先")')).toBeVisible();
    
    // 請求書Noフィールド
    await expect(page.locator('#invoice-number')).toBeVisible();
  });

  test('消費税端数処理のラジオボタンが機能する', async ({ page }) => {
    const halfUpRadio = page.locator('#round-half-up');
    const upRadio = page.locator('#round-up');
    const downRadio = page.locator('#round-down');

    await expect(halfUpRadio).toBeChecked();
    
    await upRadio.check({ force: true });
    await expect(upRadio).toBeChecked();
    await expect(halfUpRadio).not.toBeChecked();
    
    await downRadio.check({ force: true });
    await expect(downRadio).toBeChecked();
    await expect(upRadio).not.toBeChecked();
  });

  test('明細入力ボタンが機能する', async ({ page }) => {
    await page.click('#add-detail-btn', { force: true });
    await expect(page.locator('#detail-popup')).toBeVisible();
    
    // JavaScriptによる動的なタイトル更新を待つ
    await page.waitForTimeout(100);
    
    // デフォルトで「明細入力（番組）」が表示されることを確認
    await expect(page.locator('#detail-popup-title')).toContainText('明細入力（番組）');
  });

  test('明細入力ポップアップの処理区分が機能する', async ({ page }) => {
    await page.click('#add-detail-btn');
    
    // JavaScriptによる動的な更新を待つ
    await page.waitForTimeout(100);
    
    const programRadio = page.locator('#detail-type-program');
    const projectRadio = page.locator('#detail-type-project');
    const otherRadio = page.locator('#detail-type-other');

    await expect(programRadio).toBeChecked();
    await expect(page.locator('#detail-program-group')).toBeVisible();
    await expect(page.locator('#detail-project-group')).not.toBeVisible();
    await expect(page.locator('#detail-other-group')).not.toBeVisible();

    await projectRadio.check({ force: true });
    await page.waitForTimeout(100); // JavaScriptの実行を待つ
    await expect(page.locator('#detail-project-group')).toBeVisible();
    await expect(page.locator('#detail-program-group')).not.toBeVisible();

    await otherRadio.check({ force: true });
    await page.waitForTimeout(100); // JavaScriptの実行を待つ
    await expect(page.locator('#detail-other-group')).toBeVisible();
    await expect(page.locator('#detail-project-group')).not.toBeVisible();
  });

  test('明細入力ポップアップを閉じることができる', async ({ page }) => {
    await page.click('#add-detail-btn');
    await expect(page.locator('#detail-popup')).toBeVisible();
    
    // JavaScriptによる動的な更新を待つ
    await page.waitForTimeout(100);
    
    await page.click('#detail-cancel', { force: true });
    await expect(page.locator('#detail-popup')).not.toBeVisible();
  });

  test('請求書読取ボタンが機能する', async ({ page }) => {
    await page.click('#invoice-scan-btn', { force: true });
    await expect(page.locator('#invoice-scan-popup')).toBeVisible();
    
    // JavaScriptによる動的な更新を待つ
    await page.waitForTimeout(100);
    
    await expect(page.locator('#invoice-scan-popup h2')).toContainText('請求書読取');
  });

  test('請求書読取ポップアップを閉じることができる', async ({ page }) => {
    await page.click('#invoice-scan-btn', { force: true });
    await expect(page.locator('#invoice-scan-popup')).toBeVisible();
    
    // JavaScriptによる動的な更新を待つ
    await page.waitForTimeout(100);
    
    await page.click('#invoice-scan-cancel', { force: true });
    await expect(page.locator('#invoice-scan-popup')).not.toBeVisible();
  });

  test('ファイル選択機能が動作する', async ({ page }) => {
    await page.click('#select-file-btn', { force: true });
    
    // ファイル選択ダイアログのテストは実際のファイル選択が必要
    // ここではボタンがクリック可能であることを確認
    await expect(page.locator('#select-file-btn')).toBeEnabled();
  });

  test('伝票登録ボタンが表示される', async ({ page }) => {
    await expect(page.locator('#register-btn')).toBeVisible();
    await expect(page.locator('#register-btn')).toContainText('伝票登録');
  });

  test('クリアボタンが表示される', async ({ page }) => {
    await expect(page.locator('#clear-btn')).toBeVisible();
    await expect(page.locator('#clear-btn')).toContainText('クリア');
  });

  test('伝票イメージボタンが表示される', async ({ page }) => {
    await expect(page.locator('#show-slip-btn-bottom')).toBeVisible();
    await expect(page.locator('#show-slip-btn-bottom')).toContainText('伝票イメージ');
  });

  test('フォーム入力の基本動作', async ({ page }) => {
    // 担当者IDを入力
    await page.fill('#staff-id', 'TEST001');
    
    // 相手先IDを入力
    await page.fill('#payee-id', 'PAYEE001');
    
    // 請求書Noを入力
    await page.fill('#invoice-number', 'INV-2024-001');
    
    // 伝票タイトルを入力
    await page.fill('#slip-title', 'テスト伝票');
    
    // 入力内容を確認
    await expect(page.locator('#staff-id')).toHaveValue('TEST001');
    await expect(page.locator('#payee-id')).toHaveValue('PAYEE001');
    await expect(page.locator('#invoice-number')).toHaveValue('INV-2024-001');
    await expect(page.locator('#slip-title')).toHaveValue('テスト伝票');
  });

  test('日付フィールドの動作', async ({ page }) => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    await page.fill('#transaction-date', todayString);
    await expect(page.locator('#transaction-date')).toHaveValue(todayString);
  });

  test('支払要件の選択が機能する', async ({ page }) => {
    const paymentRequirements = page.locator('#payment-requirements');
    
    await expect(paymentRequirements).toHaveValue('当店券振込');
    
    await paymentRequirements.selectOption('現金支払');
    await expect(paymentRequirements).toHaveValue('現金支払');
    
    await paymentRequirements.selectOption('小切手支払');
    await expect(paymentRequirements).toHaveValue('小切手支払');
  });
});

