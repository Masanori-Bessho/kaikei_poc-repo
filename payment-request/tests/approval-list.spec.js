// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('承認一覧ページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/approval-list.html');
    await page.waitForLoadState('networkidle');
    
    // JavaScriptの初期化を待つ
    await page.waitForTimeout(100);
  });

  test('ページが正常に読み込まれる', async ({ page }) => {
    await expect(page).toHaveTitle('承認一覧');
    await expect(page.locator('h1').filter({ hasText: '承認一覧' })).toContainText('承認一覧');
  });

  test('ヘッダー要素が表示される', async ({ page }) => {
    await expect(page.locator('header h1')).toContainText('EXAS');
    await expect(page.locator('.user-info')).toContainText('ログインユーザ： テストユーザ①');
  });

  test('検索条件セクションが表示される', async ({ page }) => {
    await expect(page.locator('.search-section')).toBeVisible();
    await expect(page.locator('.search-section h2')).toContainText('検索条件');
  });

  test('伝票区分のラジオボタンが機能する', async ({ page }) => {
    const generalRadio = page.locator('#slip-type-general');
    const gratuityRadio = page.locator('#slip-type-gratuity');
    const estimateRadio = page.locator('#slip-type-estimate');

    await expect(generalRadio).toBeChecked();
    
    await gratuityRadio.check({ force: true });
    await page.waitForTimeout(100); // JavaScriptの実行を待つ
    await expect(gratuityRadio).toBeChecked();
    await expect(generalRadio).not.toBeChecked();
    
    await estimateRadio.check({ force: true });
    await page.waitForTimeout(100); // JavaScriptの実行を待つ
    await expect(estimateRadio).toBeChecked();
    await expect(gratuityRadio).not.toBeChecked();
  });

  test('承認状況のラジオボタンが機能する', async ({ page }) => {
    const pendingRadio = page.locator('#approval-status-pending');
    const approvedRadio = page.locator('#approval-status-approved');
    const rejectedRadio = page.locator('#approval-status-rejected');
    const allRadio = page.locator('#approval-status-all');

    await expect(allRadio).toBeChecked();
    
    await pendingRadio.check({ force: true });
    await page.waitForTimeout(100); // JavaScriptの実行を待つ
    await expect(pendingRadio).toBeChecked();
    await expect(allRadio).not.toBeChecked();
    
    await approvedRadio.check({ force: true });
    await page.waitForTimeout(100); // JavaScriptの実行を待つ
    await expect(approvedRadio).toBeChecked();
    await expect(pendingRadio).not.toBeChecked();
    
    await rejectedRadio.check({ force: true });
    await page.waitForTimeout(100); // JavaScriptの実行を待つ
    await expect(rejectedRadio).toBeChecked();
    await expect(approvedRadio).not.toBeChecked();
  });

  test('入力日の日付フィールドが機能する', async ({ page }) => {
    const fromDate = page.locator('#input-date-from');
    const toDate = page.locator('#input-date-to');
    
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    await fromDate.fill(todayString);
    await toDate.fill(todayString);
    
    await expect(fromDate).toHaveValue(todayString);
    await expect(toDate).toHaveValue(todayString);
  });

  test('データテーブルが表示される', async ({ page }) => {
    await expect(page.locator('.approval-table table')).toBeVisible();
    await expect(page.locator('.approval-table thead')).toBeVisible();
    await expect(page.locator('.approval-table tbody')).toBeVisible();
  });

  test('テーブルヘッダーが正しく表示される', async ({ page }) => {
    const table = page.locator('.approval-table table');
    
    await expect(table.locator('th:has-text("No")')).toBeVisible();
    await expect(table.locator('th:has-text("M")')).toBeVisible();
    await expect(table.locator('th:has-text("承認状況")')).toBeVisible();
    await expect(table.locator('th:has-text("相手先")')).toBeVisible();
    await expect(table.locator('th:has-text("支払情報")')).toBeVisible();
    await expect(table.locator('th:has-text("請求情報")')).toBeVisible();
  });

  test('テーブルデータが表示される', async ({ page }) => {
    const table = page.locator('.approval-table table tbody');
    const rows = table.locator('tr');
    
    await expect(rows).toHaveCount(4); // サンプルデータの行数
    
    // 最初の行のデータを確認
    const firstRow = rows.first();
    await expect(firstRow.locator('td').nth(0)).toContainText('1');
    await expect(firstRow.locator('td').nth(2)).toContainText('経理承認');
    await expect(firstRow.locator('td').nth(3)).toContainText('テレビ朝日サービス');
  });

  test('チェックボックスが機能する', async ({ page }) => {
    const checkboxes = page.locator('.approval-table input[type="checkbox"]');
    const firstCheckbox = checkboxes.first();
    
    await expect(firstCheckbox).toBeChecked();
    
    await firstCheckbox.uncheck({ force: true });
    await expect(firstCheckbox).not.toBeChecked();
    
    await firstCheckbox.check({ force: true });
    await expect(firstCheckbox).toBeChecked();
  });

  test('全選択ボタンが機能する', async ({ page }) => {
    const selectAllBtn = page.locator('#select-all-btn');
    const checkboxes = page.locator('.approval-table input[type="checkbox"]');
    
    // まず全てのチェックボックスを外す
    for (let i = 0; i < await checkboxes.count(); i++) {
      await checkboxes.nth(i).uncheck({ force: true });
    }
    
    await selectAllBtn.click();
    await page.waitForTimeout(100); // JavaScriptの実行を待つ
    
    // 全てのチェックボックスがチェックされていることを確認
    for (let i = 0; i < await checkboxes.count(); i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }
  });

  test('全解除ボタンが機能する', async ({ page }) => {
    const deselectAllBtn = page.locator('#deselect-all-btn');
    const checkboxes = page.locator('.approval-table input[type="checkbox"]');
    
    // まず全てのチェックボックスをチェック
    for (let i = 0; i < await checkboxes.count(); i++) {
      await checkboxes.nth(i).check({ force: true });
    }
    
    await deselectAllBtn.click();
    await page.waitForTimeout(100); // JavaScriptの実行を待つ
    
    // 全てのチェックボックスが外されていることを確認
    for (let i = 0; i < await checkboxes.count(); i++) {
      await expect(checkboxes.nth(i)).not.toBeChecked();
    }
  });

  test('CSV出力ボタンが機能する', async ({ page }) => {
    const csvBtn = page.locator('#csv-export-btn');
    
    // ダウンロードイベントを待機
    const downloadPromise = page.waitForEvent('download');
    await csvBtn.click();
    await page.waitForTimeout(100); // JavaScriptの実行を待つ
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/承認一覧_.*\.csv/);
  });

  test('アクションボタンが表示される', async ({ page }) => {
    await expect(page.locator('#modify-btn')).toBeVisible();
    await expect(page.locator('#inquiry-btn')).toBeVisible();
    await expect(page.locator('#approve-btn')).toBeVisible();
    await expect(page.locator('#cancel-approval-btn')).toBeVisible();
    await expect(page.locator('#reject-btn')).toBeVisible();
    await expect(page.locator('#print-btn')).toBeVisible();
  });

  test('アクションボタンのテキストが正しい', async ({ page }) => {
    await expect(page.locator('#modify-btn')).toContainText('修正(U)');
    await expect(page.locator('#inquiry-btn')).toContainText('照会(R)');
    await expect(page.locator('#approve-btn')).toContainText('承認(S)');
    await expect(page.locator('#cancel-approval-btn')).toContainText('承認解除');
    await expect(page.locator('#reject-btn')).toContainText('否認');
    await expect(page.locator('#print-btn')).toContainText('印刷(P)');
  });

  test('アクションボタンがクリック可能', async ({ page }) => {
    // 各ボタンがクリック可能であることを確認
    await expect(page.locator('#modify-btn')).toBeEnabled();
    await expect(page.locator('#inquiry-btn')).toBeEnabled();
    await expect(page.locator('#approve-btn')).toBeEnabled();
    await expect(page.locator('#cancel-approval-btn')).toBeEnabled();
    await expect(page.locator('#reject-btn')).toBeEnabled();
    await expect(page.locator('#print-btn')).toBeEnabled();
  });

  test('金額表示が正しい形式', async ({ page }) => {
    const amountCells = page.locator('.approval-table .amount');
    
    // 金額セルが存在することを確認
    await expect(amountCells.first()).toBeVisible();
    
    // 金額の形式を確認（カンマ区切り）
    const firstAmount = await amountCells.first().textContent();
    expect(firstAmount).toMatch(/^\d{1,3}(,\d{3})*$/);
  });

  test('承認状況の色分けが適用される', async ({ page }) => {
    const statusCells = page.locator('.approval-table .status-approved');
    
    // 承認済みのセルが存在することを確認
    await expect(statusCells.first()).toBeVisible();
  });
});

