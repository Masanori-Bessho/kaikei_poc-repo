# 視覚的回帰テスト（Visual Regression Testing）

このディレクトリには、支払依頼システムの視覚的回帰テストが含まれています。

## 概要

視覚的回帰テストは、UIの見た目が意図せず変更されていないかを確認するテストです。スクリーンショットを撮影し、以前のバージョンと比較することで、レイアウトの崩れやデザインの変更を検出できます。

## テストファイル

### 1. `visual-regression.spec.js`
基本的な視覚的回帰テスト
- ページ全体のスクリーンショット
- 個別要素のスクリーンショット
- ポップアップ・モーダルのスクリーンショット
- レスポンシブデザインの確認

### 2. `visual-comparison.spec.js`
状態別の視覚比較テスト
- フォーム入力状態の比較
- ポップアップの表示・非表示状態比較
- 検索条件の状態比較
- テーブルの選択状態比較

### 3. `visual-regression-advanced.spec.js`
高度な視覚的回帰テスト
- 要素レベルの詳細比較
- 段階的なフォーム入力の視覚化
- アニメーション状態の比較
- アクセシビリティ状態の確認

## 実行方法

### 視覚的回帰テストのみを実行

```bash
# 視覚的回帰テストを実行
npm run test:visual

# スナップショットを更新（デザイン変更時）
npm run test:visual:update

# デバッグモードで実行
npm run test:visual:debug
```

### 個別のテストファイルを実行

```bash
# 基本的な視覚的回帰テスト
npx playwright test visual-regression.spec.js

# 視覚比較テスト
npx playwright test visual-comparison.spec.js

# 高度な視覚的回帰テスト
npx playwright test visual-regression-advanced.spec.js
```

## 設定

### 視覚比較の設定

`playwright.config.js` で以下の設定が可能です：

```javascript
expect: {
  // ピクセル差分の閾値（0.0-1.0）
  threshold: 0.2,
  // 最大異なるピクセル数
  maxDiffPixels: 100,
  // 最大異なるピクセル比率
  maxDiffPixelRatio: 0.1,
}
```

### スクリーンショットの設定

```javascript
await expect(page).toHaveScreenshot('filename.png', {
  fullPage: true,        // ページ全体を撮影
  animations: 'disabled', // アニメーションを無効化
  clip: { x: 0, y: 0, width: 800, height: 600 } // 特定の領域のみ撮影
});
```

## テストの種類

### 1. ページ全体テスト
- 各ページの完全なスクリーンショット
- レスポンシブデザインの確認
- 異なるブラウザでの表示確認

### 2. 要素別テスト
- ヘッダー、フッター、フォームなどの個別要素
- ポップアップ、モーダルなどの動的要素
- テーブル、ボタンなどのUI要素

### 3. 状態別テスト
- フォームの入力前・入力後・エラー状態
- ポップアップの表示・非表示状態
- テーブルの選択状態

### 4. レスポンシブテスト
- モバイル、タブレット、デスクトップでの表示
- 異なる画面サイズでのレイアウト確認
- ブレークポイントでの表示切り替え

## スナップショットの管理

### スナップショットの保存場所
```
test-results/
├── screenshots/
│   ├── payment-request-full-page.png
│   ├── approval-list-table.png
│   └── ...
└── ...
```

### スナップショットの更新

デザインが変更された場合、スナップショットを更新する必要があります：

```bash
# 全てのスナップショットを更新
npm run test:visual:update

# 特定のテストのみ更新
npx playwright test visual-regression.spec.js --update-snapshots
```

### スナップショットの確認

テスト実行後、以下の場所でスナップショットを確認できます：

1. **HTMLレポート**: `playwright-report/index.html`
2. **テスト結果ディレクトリ**: `test-results/`
3. **差分画像**: 失敗したテストの差分画像が自動生成

## ベストプラクティス

### 1. 安定したテストの作成
- アニメーションを無効化
- 動的コンテンツを固定
- ネットワークの読み込み完了を待機

### 2. 適切な閾値の設定
- フォントレンダリングの違いを考慮
- ブラウザ間の微細な差異を許容
- 重要な変更は確実に検出

### 3. テストデータの管理
- 一貫したテストデータを使用
- 日付や時刻を固定
- ランダム要素を排除

### 4. メンテナンス
- 定期的なスナップショットの更新
- 不要なテストの削除
- パフォーマンスの監視

## トラブルシューティング

### よくある問題

1. **スナップショットが一致しない**
   - フォントの違い
   - ブラウザのレンダリング差異
   - 動的コンテンツの変更

2. **テストが不安定**
   - アニメーションの無効化
   - 適切な待機時間の設定
   - ネットワーク状態の確認

3. **パフォーマンスの問題**
   - 不要なスクリーンショットの削除
   - テストの並列実行
   - リソースの最適化

### デバッグ方法

1. **差分画像の確認**
   ```bash
   # テスト実行後、差分画像を確認
   open test-results/
   ```

2. **個別テストの実行**
   ```bash
   # 特定のテストのみ実行
   npx playwright test --grep "ページ全体のスクリーンショット"
   ```

3. **デバッグモードでの実行**
   ```bash
   # ステップごとに確認
   npm run test:visual:debug
   ```

## 継続的インテグレーション

### CI/CDでの実行

```yaml
# GitHub Actions の例
- name: Run Visual Regression Tests
  run: |
    npm install
    npx playwright install
    npm run test:visual
```

### 失敗時の対応

1. 差分の原因を特定
2. 意図的な変更かどうかを判断
3. 必要に応じてスナップショットを更新
4. コードの修正

## 参考資料

- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Visual Regression Testing Best Practices](https://playwright.dev/docs/test-snapshots#best-practices)
- [Screenshot Options](https://playwright.dev/docs/api/class-page#page-screenshot)
