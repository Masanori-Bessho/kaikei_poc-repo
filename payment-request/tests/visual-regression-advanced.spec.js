// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('高度な視覚的回帰テスト', () => {
  test('要素レベルの視覚比較', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // 個別の要素のスクリーンショットを撮影
    const elements = [
      { selector: 'header', name: 'header' },
      { selector: '.form-row.staff-row', name: 'staff-row' },
      { selector: '.form-row.simple-row', name: 'date-row' },
      { selector: '#details-table', name: 'details-table' },
      { selector: '.tax-summary-section', name: 'tax-summary' },
      { selector: '.form-row.button-row', name: 'button-row' }
    ];

    for (const element of elements) {
      const locator = page.locator(element.selector);
      if (await locator.isVisible()) {
        await expect(locator).toHaveScreenshot(`${element.name}.png`);
      }
    }
  });

  test('フォーム入力の段階的視覚比較', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    const form = page.locator('#payment-request-form');
    
    // 段階1: 初期状態
    await expect(form).toHaveScreenshot('form-step-1-initial.png');
    
    // 段階2: 担当者入力
    await page.fill('#staff-id', 'TEST001');
    await expect(form).toHaveScreenshot('form-step-2-staff.png');
    
    // 段階3: 相手先入力
    await page.fill('#payee-id', 'PAYEE001');
    await expect(form).toHaveScreenshot('form-step-3-payee.png');
    
    // 段階4: 請求書No入力
    await page.fill('#invoice-number', 'INV-2024-001');
    await expect(form).toHaveScreenshot('form-step-4-invoice.png');
    
    // 段階5: 伝票タイトル入力
    await page.fill('#slip-title', 'テスト伝票');
    await expect(form).toHaveScreenshot('form-step-5-title.png');
    
    // 段階6: 日付入力
    const today = new Date().toISOString().split('T')[0];
    await page.fill('#transaction-date', today);
    await expect(form).toHaveScreenshot('form-step-6-date.png');
  });

  test('ポップアップのアニメーション状態比較', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // 明細入力ポップアップの表示アニメーション
    await page.click('#add-detail-btn');
    
    // 表示中の状態
    await page.waitForSelector('#detail-popup', { state: 'visible' });
    await expect(page.locator('#detail-popup')).toHaveScreenshot('popup-detail-opening.png');
    
    // 完全に表示された状態
    await page.waitForTimeout(500);
    await expect(page.locator('#detail-popup')).toHaveScreenshot('popup-detail-opened.png');
    
    // 閉じるアニメーション
    await page.click('#detail-cancel');
    await page.waitForTimeout(300);
    await expect(page.locator('#detail-popup')).toHaveScreenshot('popup-detail-closing.png');
  });

  test('テーブルの状態変化の視覚比較', async ({ page }) => {
    await page.goto('/approval-list.html');
    await page.waitForLoadState('networkidle');
    
    const table = page.locator('.approval-table table');
    
    // 初期状態
    await expect(table).toHaveScreenshot('table-state-initial.png');
    
    // 1行目を選択
    const firstCheckbox = table.locator('tbody tr:first-child input[type="checkbox"]');
    await firstCheckbox.check();
    await expect(table).toHaveScreenshot('table-state-row1-selected.png');
    
    // 2行目も選択
    const secondCheckbox = table.locator('tbody tr:nth-child(2) input[type="checkbox"]');
    await secondCheckbox.check();
    await expect(table).toHaveScreenshot('table-state-row1-2-selected.png');
    
    // 全選択
    await page.click('#select-all-btn');
    await expect(table).toHaveScreenshot('table-state-all-selected.png');
    
    // 全解除
    await page.click('#deselect-all-btn');
    await expect(table).toHaveScreenshot('table-state-none-selected.png');
  });

  test('レスポンシブデザインの詳細比較', async ({ page }) => {
    const breakpoints = [
      { name: 'mobile-s', width: 320, height: 568 },
      { name: 'mobile-m', width: 375, height: 667 },
      { name: 'mobile-l', width: 425, height: 812 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'laptop', width: 1024, height: 768 },
      { name: 'desktop', width: 1200, height: 800 },
      { name: 'large', width: 1440, height: 900 },
      { name: 'xl', width: 1920, height: 1080 }
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await page.goto('/index.html');
      await page.waitForLoadState('networkidle');
      
      // 全体のスクリーンショット
      await expect(page).toHaveScreenshot(`responsive-${breakpoint.name}-full.png`, {
        fullPage: true,
        animations: 'disabled'
      });
      
      // ヘッダー部分のスクリーンショット
      await expect(page.locator('header')).toHaveScreenshot(`responsive-${breakpoint.name}-header.png`);
      
      // フォーム部分のスクリーンショット
      await expect(page.locator('#payment-request-form')).toHaveScreenshot(`responsive-${breakpoint.name}-form.png`);
    }
  });

  test('異なるテーマ・状態での視覚比較', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // 通常状態
    await expect(page).toHaveScreenshot('theme-normal.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // フォーカス状態（最初の入力フィールドにフォーカス）
    await page.focus('#staff-id');
    await expect(page).toHaveScreenshot('theme-focused.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // ホバー状態（ボタンにホバー）
    await page.hover('#register-btn');
    await expect(page).toHaveScreenshot('theme-hovered.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('エラー状態の視覚比較', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // 無効なデータでフォーム送信を試行
    await page.fill('#staff-id', 'INVALID');
    await page.fill('#payee-id', 'INVALID');
    await page.click('#register-btn');
    
    // エラー状態のスクリーンショット
    await expect(page.locator('#payment-request-form')).toHaveScreenshot('error-state-invalid-data.png');
    
    // フォームをクリア
    await page.click('#clear-btn');
    await page.waitForTimeout(500);
    
    // 空の状態で送信を試行
    await page.click('#register-btn');
    await expect(page.locator('#payment-request-form')).toHaveScreenshot('error-state-empty-fields.png');
  });

  test('動的コンテンツの視覚比較', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // 明細を追加
    await page.click('#add-detail-btn');
    await page.waitForSelector('#detail-popup');
    
    // 明細データを入力
    await page.fill('#detail-program', 'テスト番組');
    await page.fill('#detail-broadcast-date', '2024-12-25');
    await page.fill('#detail-account', '外注費');
    await page.fill('#detail-summary', 'テスト摘要');
    await page.fill('#detail-amount', '100000');
    
    // 明細を登録
    await page.click('#detail-submit-btn');
    await page.waitForTimeout(500);
    
    // 明細が追加された状態のスクリーンショット
    await expect(page.locator('#details-table')).toHaveScreenshot('dynamic-content-detail-added.png');
    
    // 金額表示の更新を確認
    await expect(page.locator('.details-amount-group')).toHaveScreenshot('dynamic-content-amount-updated.png');
  });

  test('ブラウザ間の視覚的差異検出', async ({ page, browserName }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // 各ブラウザでの表示を詳細に比較
    const sections = [
      { selector: 'header', name: 'header' },
      { selector: '#payment-request-form', name: 'form' },
      { selector: '#details-table', name: 'table' },
      { selector: 'footer', name: 'footer' }
    ];

    for (const section of sections) {
      const locator = page.locator(section.selector);
      if (await locator.isVisible()) {
        await expect(locator).toHaveScreenshot(`${section.name}-${browserName}.png`);
      }
    }
  });

  test('アクセシビリティ状態の視覚比較', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // 通常状態
    await expect(page).toHaveScreenshot('accessibility-normal.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // 高コントラストモードをシミュレート
    await page.addStyleTag({
      content: `
        * {
          filter: contrast(150%) brightness(120%);
        }
      `
    });
    
    await expect(page).toHaveScreenshot('accessibility-high-contrast.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // フォーカス表示を強調
    await page.addStyleTag({
      content: `
        *:focus {
          outline: 3px solid #ff0000 !important;
          outline-offset: 2px !important;
        }
      `
    });
    
    await page.focus('#staff-id');
    await expect(page).toHaveScreenshot('accessibility-focus-visible.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});
