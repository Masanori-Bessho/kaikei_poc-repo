// @ts-check

/**
 * グローバルティアダウン
 * テスト実行後に必要なクリーンアップ処理を行う
 */
async function globalTeardown(config) {
  console.log('🧹 グローバルティアダウンを開始します...');
  
  // テスト結果の集計
  const fs = require('fs');
  const path = require('path');
  
  try {
    // テスト結果ファイルが存在するかチェック
    const resultsPath = path.join(__dirname, '..', 'test-results', 'results.json');
    
    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      
      console.log('📊 テスト結果サマリー:');
      console.log(`  総テスト数: ${results.stats?.total || 0}`);
      console.log(`  成功: ${results.stats?.passed || 0}`);
      console.log(`  失敗: ${results.stats?.failed || 0}`);
      console.log(`  スキップ: ${results.stats?.skipped || 0}`);
      console.log(`  実行時間: ${results.stats?.duration || 0}ms`);
    }
    
    // 一時ファイルのクリーンアップ（必要に応じて）
    // ここでテスト実行中に作成された一時ファイルを削除
    
  } catch (error) {
    console.warn('⚠️ ティアダウン処理中にエラーが発生しました:', error.message);
  }
  
  console.log('🎉 グローバルティアダウンが完了しました');
}

module.exports = globalTeardown;

