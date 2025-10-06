// @ts-check
const { expect } = require('@playwright/test');

/**
 * ページヘルパー関数
 * テストでよく使用される共通の操作を関数化
 */

/**
 * フォームフィールドに値を入力する
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 * @param {string} value
 */
async function fillField(page, selector, value) {
  await page.fill(selector, value);
  await expect(page.locator(selector)).toHaveValue(value);
}

/**
 * ラジオボタンを選択する
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 */
async function selectRadio(page, selector) {
  await page.check(selector);
  await expect(page.locator(selector)).toBeChecked();
}

/**
 * セレクトボックスからオプションを選択する
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 * @param {string} value
 */
async function selectOption(page, selector, value) {
  await page.selectOption(selector, value);
  await expect(page.locator(selector)).toHaveValue(value);
}

/**
 * チェックボックスをチェック/アンチェックする
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 * @param {boolean} checked
 */
async function toggleCheckbox(page, selector, checked = true) {
  if (checked) {
    await page.check(selector);
    await expect(page.locator(selector)).toBeChecked();
  } else {
    await page.uncheck(selector);
    await expect(page.locator(selector)).not.toBeChecked();
  }
}

/**
 * ボタンをクリックして表示を確認する
 * @param {import('@playwright/test').Page} page
 * @param {string} buttonSelector
 * @param {string} expectedElementSelector
 */
async function clickButtonAndVerify(page, buttonSelector, expectedElementSelector) {
  await page.click(buttonSelector);
  await expect(page.locator(expectedElementSelector)).toBeVisible();
}

/**
 * ポップアップを閉じる
 * @param {import('@playwright/test').Page} page
 * @param {string} popupSelector
 * @param {string} closeButtonSelector
 */
async function closePopup(page, popupSelector, closeButtonSelector) {
  await expect(page.locator(popupSelector)).toBeVisible();
  await page.click(closeButtonSelector);
  await expect(page.locator(popupSelector)).not.toBeVisible();
}

/**
 * テーブルの行数を取得する
 * @param {import('@playwright/test').Page} page
 * @param {string} tableSelector
 * @returns {Promise<number>}
 */
async function getTableRowCount(page, tableSelector) {
  const rows = page.locator(`${tableSelector} tbody tr`);
  return await rows.count();
}

/**
 * テーブルの特定の行のデータを取得する
 * @param {import('@playwright/test').Page} page
 * @param {string} tableSelector
 * @param {number} rowIndex
 * @returns {Promise<string[]>}
 */
async function getTableRowData(page, tableSelector, rowIndex) {
  const row = page.locator(`${tableSelector} tbody tr`).nth(rowIndex);
  const cells = row.locator('td');
  const cellCount = await cells.count();
  const rowData = [];
  
  for (let i = 0; i < cellCount; i++) {
    const cellText = await cells.nth(i).textContent();
    rowData.push(cellText?.trim() || '');
  }
  
  return rowData;
}

/**
 * 日付フィールドに今日の日付を入力する
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 */
async function fillTodayDate(page, selector) {
  const today = new Date().toISOString().split('T')[0];
  await fillField(page, selector, today);
}

/**
 * 金額フィールドに値を入力する（カンマ区切り形式）
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 * @param {number} amount
 */
async function fillAmount(page, selector, amount) {
  const formattedAmount = amount.toLocaleString('ja-JP');
  await fillField(page, selector, formattedAmount);
}

/**
 * ページの読み込み完了を待つ
 * @param {import('@playwright/test').Page} page
 */
async function waitForPageLoad(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * 要素が表示されるまで待つ
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 * @param {number} timeout
 */
async function waitForElement(page, selector, timeout = 5000) {
  await page.waitForSelector(selector, { timeout });
  await expect(page.locator(selector)).toBeVisible();
}

/**
 * アラートダイアログを処理する
 * @param {import('@playwright/test').Page} page
 * @param {string} action 'accept' | 'dismiss'
 */
async function handleAlert(page, action = 'accept') {
  page.on('dialog', async dialog => {
    if (action === 'accept') {
      await dialog.accept();
    } else {
      await dialog.dismiss();
    }
  });
}

/**
 * ファイルをアップロードする
 * @param {import('@playwright/test').Page} page
 * @param {string} fileInputSelector
 * @param {string} filePath
 */
async function uploadFile(page, fileInputSelector, filePath) {
  await page.setInputFiles(fileInputSelector, filePath);
}

/**
 * ページのスクリーンショットを撮る
 * @param {import('@playwright/test').Page} page
 * @param {string} name
 */
async function takeScreenshot(page, name) {
  await page.screenshot({ path: `test-results/screenshots/${name}.png` });
}

/**
 * フォームをリセットする
 * @param {import('@playwright/test').Page} page
 * @param {string} formSelector
 */
async function resetForm(page, formSelector) {
  await page.click(`${formSelector} button[type="reset"]`);
}

/**
 * テーブルをソートする
 * @param {import('@playwright/test').Page} page
 * @param {string} tableSelector
 * @param {string} columnName
 */
async function sortTable(page, tableSelector, columnName) {
  const header = page.locator(`${tableSelector} th[data-col="${columnName}"]`);
  await header.click();
}

/**
 * ページネーションを操作する
 * @param {import('@playwright/test').Page} page
 * @param {string} action 'next' | 'prev' | 'first' | 'last'
 */
async function navigatePagination(page, action) {
  const buttonMap = {
    next: '#next-page-btn',
    prev: '#prev-page-btn',
    first: '#first-page-btn',
    last: '#last-page-btn'
  };
  
  const buttonSelector = buttonMap[action];
  if (buttonSelector) {
    await page.click(buttonSelector);
  }
}

module.exports = {
  fillField,
  selectRadio,
  selectOption,
  toggleCheckbox,
  clickButtonAndVerify,
  closePopup,
  getTableRowCount,
  getTableRowData,
  fillTodayDate,
  fillAmount,
  waitForPageLoad,
  waitForElement,
  handleAlert,
  uploadFile,
  takeScreenshot,
  resetForm,
  sortTable,
  navigatePagination
};

