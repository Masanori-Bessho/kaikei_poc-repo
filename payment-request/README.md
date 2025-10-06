# 支払依頼システム Playwright テスト

このプロジェクトは、支払依頼システムのPlaywrightテストスイートです。

## 概要

支払依頼システムの以下のページを対象としたE2Eテストを提供します：

- **支払依頼登録ページ** (`index.html`) - メインのフォーム入力画面
- **承認一覧ページ** (`approval-list.html`) - 承認待ちの伝票一覧
- **伝票一覧ページ** (`slip-list.html`) - 登録済み伝票の検索・一覧

## 機能

### テスト対象機能

1. **ページ読み込み・表示**
   - 各ページの正常な読み込み
   - ヘッダー・フッターの表示
   - レスポンシブデザインの動作

2. **フォーム操作**
   - 入力フィールドの動作
   - ラジオボタン・チェックボックスの選択
   - セレクトボックスの選択
   - 日付・金額フィールドの入力

3. **ポップアップ・モーダル**
   - 明細入力ポップアップ
   - 請求書読取ポップアップ
   - 詳細表示モーダル

4. **テーブル操作**
   - データ表示
   - ソート機能
   - ページネーション
   - チェックボックス操作

5. **ファイル操作**
   - ファイル選択
   - ファイルアップロード
   - CSV出力

6. **ナビゲーション**
   - ページ間の遷移
   - リンクの動作

## セットアップ

### 前提条件

- Node.js 18.0.0以上
- npm または yarn

### インストール

1. 依存関係をインストール：
```bash
npm install
```

2. Playwrightブラウザをインストール：
```bash
npx playwright install
```

### ローカルサーバーの起動

テスト実行前に、ローカルサーバーを起動してください：

```bash
# http-serverを使用する場合
npx http-server . -p 3000

# または他の静的ファイルサーバーを使用
python -m http.server 3000
```

## テスト実行

### 基本的な実行

```bash
# 全テストを実行
npm test

# ヘッドレスモードで実行
npx playwright test

# ブラウザを表示して実行
npm run test:headed

# UIモードで実行（推奨）
npm run test:ui

# デバッグモードで実行
npm run test:debug
```

### 特定のテストを実行

```bash
# 特定のテストファイルを実行
npx playwright test payment-request.spec.js

# 特定のブラウザで実行
npx playwright test --project=chromium

# 特定のテストケースを実行
npx playwright test --grep "ページが正常に読み込まれる"
```

### テストレポート

```bash
# テストレポートを表示
npm run test:report
```

## テスト構成

### テストファイル

- `tests/payment-request.spec.js` - 支払依頼登録ページのテスト
- `tests/approval-list.spec.js` - 承認一覧ページのテスト
- `tests/slip-list.spec.js` - 伝票一覧ページのテスト
- `tests/navigation.spec.js` - ナビゲーション機能のテスト

### 設定ファイル

- `playwright.config.js` - Playwrightの設定
- `package.json` - プロジェクトの依存関係とスクリプト

### ヘルパーファイル

- `tests/fixtures/test-data.js` - テスト用のデータフィクスチャ
- `tests/helpers/page-helpers.js` - ページ操作のヘルパー関数
- `tests/global-setup.js` - グローバルセットアップ
- `tests/global-teardown.js` - グローバルティアダウン

## ブラウザサポート

以下のブラウザでテストを実行できます：

- **Chromium** (デフォルト)
- **Firefox**
- **WebKit (Safari)**
- **Mobile Chrome**
- **Mobile Safari**

## テスト結果

テスト実行後、以下の場所に結果が保存されます：

- `test-results/` - テスト結果とトレースファイル
- `playwright-report/` - HTMLレポート
- `test-results/screenshots/` - 失敗時のスクリーンショット
- `test-results/videos/` - 失敗時の動画

## カスタマイズ

### テストデータの変更

`tests/fixtures/test-data.js` を編集して、テストデータをカスタマイズできます。

### ヘルパー関数の追加

`tests/helpers/page-helpers.js` に新しいヘルパー関数を追加できます。

### 設定の変更

`playwright.config.js` を編集して、テスト設定をカスタマイズできます。

## トラブルシューティング

### よくある問題

1. **ブラウザが起動しない**
   ```bash
   npx playwright install
   ```

2. **テストがタイムアウトする**
   - ローカルサーバーが起動しているか確認
   - ネットワーク接続を確認

3. **要素が見つからない**
   - ページの読み込みが完了しているか確認
   - セレクターが正しいか確認

4. **ファイルアップロードが失敗する**
   - テスト用のファイルが存在するか確認
   - ファイルパスが正しいか確認

### デバッグ方法

1. **デバッグモードで実行**
   ```bash
   npm run test:debug
   ```

2. **UIモードで実行**
   ```bash
   npm run test:ui
   ```

3. **スクリーンショットを確認**
   - `test-results/screenshots/` ディレクトリを確認

4. **トレースファイルを確認**
   - `test-results/` ディレクトリのトレースファイルを確認

## 貢献

テストの改善や新しいテストケースの追加を歓迎します。

1. このリポジトリをフォーク
2. フィーチャーブランチを作成
3. 変更をコミット
4. プルリクエストを作成

## ライセンス

MIT License

## サポート

問題が発生した場合は、以下の手順でサポートを求めてください：

1. エラーメッセージを確認
2. ログファイルを確認
3. 問題を再現する手順を文書化
4. 必要に応じてスクリーンショットを添付

