/**
 * 明細データ管理クラス
 * JSONファイルベースでデータの読み書きを行う
 */
class DetailDataManager {
    constructor() {
        this.dataFile = 'data/details.json';
        this.data = { details: [] };
        this.isLoaded = false;
    }

    /**
     * JSONファイルからデータを読み込み
     */
    async loadData() {
        try {
            console.log('明細データを読み込み中...');
            const response = await fetch(this.dataFile);
            
            if (!response.ok) {
                console.warn('JSONファイルが見つかりません。空のデータで初期化します。');
                this.data = { details: [] };
                this.isLoaded = true;
                return this.data.details;
            }
            
            this.data = await response.json();
            this.isLoaded = true;
            console.log(`${this.data.details.length}件の明細データを読み込みました`);
            return this.data.details;
            
        } catch (error) {
            console.error('データ読み込みエラー:', error);
            this.data = { details: [] };
            this.isLoaded = true;
            return this.data.details;
        }
    }

    /**
     * JSONファイルにデータを保存
     * 注意: ブラウザから直接ファイルに書き込むことはできないため、
     * ダウンロード機能として実装
     */
    async saveData() {
        try {
            const jsonString = JSON.stringify(this.data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // ダウンロードリンクを作成
            const a = document.createElement('a');
            a.href = url;
            a.download = 'details.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('データをダウンロードしました');
            return true;
            
        } catch (error) {
            console.error('データ保存エラー:', error);
            return false;
        }
    }

    /**
     * ローカルストレージにデータを保存（代替手段）
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('detailsData', JSON.stringify(this.data));
            console.log('データをローカルストレージに保存しました');
            return true;
        } catch (error) {
            console.error('ローカルストレージ保存エラー:', error);
            return false;
        }
    }

    /**
     * ローカルストレージからデータを読み込み
     */
    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('detailsData');
            if (savedData) {
                this.data = JSON.parse(savedData);
                this.isLoaded = true;
                console.log(`ローカルストレージから${this.data.details.length}件のデータを読み込みました`);
                return this.data.details;
            }
            return [];
        } catch (error) {
            console.error('ローカルストレージ読み込みエラー:', error);
            return [];
        }
    }

    /**
     * 全ての明細データを取得
     */
    getAllDetails() {
        if (!this.isLoaded) {
            console.warn('データが読み込まれていません');
            return [];
        }
        return this.data.details || [];
    }

    /**
     * IDで明細データを取得
     */
    getDetailById(id) {
        return this.data.details.find(detail => detail.id === id);
    }

    /**
     * 新しい明細データを追加
     */
    addDetail(detailData) {
        const newDetail = {
            id: this.generateId(),
            ...detailData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.data.details.push(newDetail);
        this.saveToLocalStorage(); // 自動保存
        console.log('新しい明細を追加しました:', newDetail.id);
        return newDetail;
    }

    /**
     * 明細データを更新
     */
    updateDetail(id, detailData) {
        const index = this.data.details.findIndex(detail => detail.id === id);
        if (index !== -1) {
            this.data.details[index] = {
                ...this.data.details[index],
                ...detailData,
                updatedAt: new Date().toISOString()
            };
            this.saveToLocalStorage(); // 自動保存
            console.log('明細を更新しました:', id);
            return this.data.details[index];
        }
        return null;
    }

    /**
     * 明細データを削除
     */
    deleteDetail(id) {
        const index = this.data.details.findIndex(detail => detail.id === id);
        if (index !== -1) {
            const deleted = this.data.details.splice(index, 1)[0];
            this.saveToLocalStorage(); // 自動保存
            console.log('明細を削除しました:', id);
            return deleted;
        }
        return null;
    }

    /**
     * 全ての明細データを削除
     */
    clearAllDetails() {
        this.data.details = [];
        this.saveToLocalStorage();
        console.log('全ての明細データを削除しました');
    }

    /**
     * ユニークIDを生成
     */
    generateId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `detail_${timestamp}_${random}`;
    }

    /**
     * JSONファイルをアップロード（インポート）
     */
    importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    if (importedData.details && Array.isArray(importedData.details)) {
                        this.data = importedData;
                        this.isLoaded = true;
                        this.saveToLocalStorage();
                        console.log(`${this.data.details.length}件のデータをインポートしました`);
                        resolve(this.data.details);
                    } else {
                        reject(new Error('無効なJSONファイル形式です'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('ファイル読み込みエラー'));
            reader.readAsText(file);
        });
    }

    /**
     * データの統計情報を取得
     */
    getStats() {
        const details = this.data.details;
        const totalAmount = details.reduce((sum, detail) => sum + (detail.amount || 0), 0);
        const totalTax = details.reduce((sum, detail) => sum + (detail.taxAmount || 0), 0);
        
        return {
            totalCount: details.length,
            totalAmount: totalAmount,
            totalTax: totalTax,
            byType: {
                project: details.filter(d => d.type === 'project').length,
                program: details.filter(d => d.type === 'program').length,
                other: details.filter(d => d.type === 'other').length
            }
        };
    }
}

// グローバルインスタンスを作成
window.detailDataManager = new DetailDataManager(); 