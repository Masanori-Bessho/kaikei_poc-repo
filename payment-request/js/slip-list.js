/**
 * 伝票一覧ページのJavaScript
 */

// グローバル変数
let slipDataManager;
let allSlips = [];
let filteredSlips = [];
let currentPage = 1;
let pageSize = 20;
let sortColumn = 'createdAt';
let sortOrder = -1; // -1: 降順, 1: 昇順

// DOM要素
let searchForm;
let slipListTbody;
let totalCountSpan;
let totalAmountSpan;
let pageInfoSpan;
let prevPageBtn;
let nextPageBtn;
let pageSizeSelect;
let slipDetailModal;

// DOMContentLoaded時の初期化
document.addEventListener('DOMContentLoaded', function() {
    // DOM要素を取得
    searchForm = document.getElementById('search-form');
    slipListTbody = document.getElementById('slip-list-tbody');
    totalCountSpan = document.getElementById('total-count');
    totalAmountSpan = document.getElementById('total-amount');
    pageInfoSpan = document.getElementById('page-info');
    prevPageBtn = document.getElementById('prev-page-btn');
    nextPageBtn = document.getElementById('next-page-btn');
    pageSizeSelect = document.getElementById('page-size-select');
    slipDetailModal = document.getElementById('slip-detail-modal');

    // データ管理システムを初期化
    slipDataManager = new SlipDataManager();
    
    // イベントリスナーを設定
    setupEventListeners();
    
    // 初期データを読み込み
    loadSlipData();
});

/**
 * イベントリスナーの設定
 */
function setupEventListeners() {
    // 検索フォーム
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        performSearch();
    });

    // 検索クリアボタン
    document.getElementById('clear-search-btn').addEventListener('click', function() {
        searchForm.reset();
        filteredSlips = [...allSlips];
        currentPage = 1;
        renderSlipList();
    });

    // ページネーション
    prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderSlipList();
        }
    });

    nextPageBtn.addEventListener('click', function() {
        const totalPages = Math.ceil(filteredSlips.length / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
            renderSlipList();
        }
    });

    // ページサイズ変更
    pageSizeSelect.addEventListener('change', function() {
        pageSize = parseInt(this.value);
        currentPage = 1;
        renderSlipList();
    });

    // ソート機能
    document.querySelectorAll('#slip-list-table th.sortable').forEach(th => {
        th.addEventListener('click', function() {
            const column = this.dataset.col;
            if (sortColumn === column) {
                sortOrder *= -1;
            } else {
                sortColumn = column;
                sortOrder = -1;
            }
            sortSlips();
            renderSlipList();
        });
    });

    // モーダル関連
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            slipDetailModal.style.display = 'none';
        });
    });

    // モーダル外クリックで閉じる
    window.addEventListener('click', function(e) {
        if (e.target === slipDetailModal) {
            slipDetailModal.style.display = 'none';
        }
    });
}

/**
 * 伝票データを読み込み
 */
async function loadSlipData() {
    try {
        allSlips = await slipDataManager.loadAllSlips();
        filteredSlips = [...allSlips];
        sortSlips();
        renderSlipList();
        console.log(`${allSlips.length}件の伝票データを読み込みました`);
    } catch (error) {
        console.error('伝票データの読み込みエラー:', error);
        allSlips = [];
        filteredSlips = [];
        renderSlipList();
    }
}

/**
 * 検索実行
 */
function performSearch() {
    const formData = new FormData(searchForm);
    const searchCriteria = {
        registrationNumber: formData.get('registration-number'),
        staffId: formData.get('staff-id'),
        payeeName: formData.get('payee-name'),
        dateFrom: formData.get('date-from'),
        dateTo: formData.get('date-to'),
        amountFrom: formData.get('amount-from'),
        amountTo: formData.get('amount-to')
    };

    filteredSlips = allSlips.filter(slip => {
        // 登録番号
        if (searchCriteria.registrationNumber && 
            !slip.registrationNumber.includes(searchCriteria.registrationNumber)) {
            return false;
        }

        // 担当者ID
        if (searchCriteria.staffId && 
            !slip.staffId.includes(searchCriteria.staffId)) {
            return false;
        }

        // 相手先名
        if (searchCriteria.payeeName && 
            !slip.payeeName.includes(searchCriteria.payeeName)) {
            return false;
        }

        // 取引日（開始）
        if (searchCriteria.dateFrom && 
            slip.transactionDate < searchCriteria.dateFrom) {
            return false;
        }

        // 取引日（終了）
        if (searchCriteria.dateTo && 
            slip.transactionDate > searchCriteria.dateTo) {
            return false;
        }

        // 金額（以上）
        if (searchCriteria.amountFrom && 
            slip.totalAmount < parseInt(searchCriteria.amountFrom)) {
            return false;
        }

        // 金額（以下）
        if (searchCriteria.amountTo && 
            slip.totalAmount > parseInt(searchCriteria.amountTo)) {
            return false;
        }

        return true;
    });

    currentPage = 1;
    renderSlipList();
}

/**
 * 伝票リストをソート
 */
function sortSlips() {
    filteredSlips.sort((a, b) => {
        let valueA = a[sortColumn];
        let valueB = b[sortColumn];

        // 数値の場合
        if (typeof valueA === 'number' && typeof valueB === 'number') {
            return (valueA - valueB) * sortOrder;
        }

        // 日付の場合
        if (sortColumn.includes('Date') || sortColumn === 'createdAt') {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
            return (valueA - valueB) * sortOrder;
        }

        // 文字列の場合
        return valueA.toString().localeCompare(valueB.toString(), 'ja') * sortOrder;
    });
}

/**
 * 伝票リストを描画
 */
function renderSlipList() {
    // ページネーション計算
    const totalPages = Math.ceil(filteredSlips.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredSlips.length);
    const pageSlips = filteredSlips.slice(startIndex, endIndex);

    // テーブル本体をクリア
    slipListTbody.innerHTML = '';

    // データ行を生成
    pageSlips.forEach(slip => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${slip.registrationNumber}</td>
            <td>${formatDateTime(slip.createdAt)}</td>
            <td>${slip.staffName}</td>
            <td>${slip.payeeName}</td>
            <td>${formatDate(slip.transactionDate)}</td>
            <td class="amount">${formatCurrency(slip.totalAmount)}</td>
            <td class="amount">${formatCurrency(slip.totalTax)}</td>
            <td class="center">${slip.detailCount}件</td>
            <td class="actions">
                <button type="button" class="view-btn" onclick="viewSlipDetail('${slip.id}')">詳細</button>
                <button type="button" class="edit-btn" onclick="editSlip('${slip.id}')">編集</button>
                <button type="button" class="delete-btn" onclick="deleteSlip('${slip.id}')">削除</button>
            </td>
        `;
        slipListTbody.appendChild(tr);
    });

    // 統計情報を更新
    updateStatistics();

    // ページネーション情報を更新
    updatePagination(totalPages);
}

/**
 * 統計情報を更新
 */
function updateStatistics() {
    const totalCount = filteredSlips.length;
    const totalAmount = filteredSlips.reduce((sum, slip) => sum + slip.totalAmount, 0);

    totalCountSpan.textContent = `${totalCount}件`;
    totalAmountSpan.textContent = `合計金額: ${formatCurrency(totalAmount)}`;
}

/**
 * ページネーション情報を更新
 */
function updatePagination(totalPages) {
    pageInfoSpan.textContent = `${currentPage} / ${totalPages} ページ`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
}

/**
 * 伝票詳細を表示
 */
function viewSlipDetail(slipId) {
    const slip = allSlips.find(s => s.id === slipId);
    if (!slip) {
        alert('伝票データが見つかりません');
        return;
    }

    const detailContent = document.getElementById('slip-detail-content');
    detailContent.innerHTML = `
        <div class="detail-section">
            <h4>基本情報</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <label>登録番号:</label>
                    <span>${slip.registrationNumber}</span>
                </div>
                <div class="detail-item">
                    <label>登録日時:</label>
                    <span>${formatDateTime(slip.createdAt)}</span>
                </div>
                <div class="detail-item">
                    <label>担当者:</label>
                    <span>${slip.staffName} (${slip.staffId})</span>
                </div>
                <div class="detail-item">
                    <label>相手先:</label>
                    <span>${slip.payeeName}</span>
                </div>
                <div class="detail-item">
                    <label>取引日:</label>
                    <span>${formatDate(slip.transactionDate)}</span>
                </div>
                <div class="detail-item">
                    <label>支払金額:</label>
                    <span>${formatCurrency(slip.totalAmount)}</span>
                </div>
            </div>
        </div>
        <div class="detail-section">
            <h4>明細情報（${slip.detailCount}件）</h4>
            <div class="detail-table">
                <table>
                    <thead>
                        <tr>
                            <th>科目</th>
                            <th>摘要</th>
                            <th>金額</th>
                            <th>消費税額</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${slip.details.map(detail => `
                            <tr>
                                <td>${detail.account || ''}</td>
                                <td>${detail.summary || ''}</td>
                                <td class="amount">${formatCurrency(detail.amount || 0)}</td>
                                <td class="amount">${formatCurrency(detail.taxAmount || 0)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    slipDetailModal.style.display = 'block';
}

/**
 * 伝票を編集
 */
function editSlip(slipId) {
    // 編集用のパラメータを付けて入力画面に遷移
    window.location.href = `index.html?edit=${slipId}`;
}

/**
 * 伝票を削除
 */
function deleteSlip(slipId) {
    const slip = allSlips.find(s => s.id === slipId);
    if (!slip) {
        alert('伝票データが見つかりません');
        return;
    }

    if (confirm(`伝票「${slip.registrationNumber}」を削除しますか？`)) {
        slipDataManager.deleteSlip(slipId);
        loadSlipData(); // データを再読み込み
        alert('伝票を削除しました');
    }
}

/**
 * 日時をフォーマット
 */
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * 日付をフォーマット
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
}

/**
 * 通貨をフォーマット
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        minimumFractionDigits: 0
    }).format(amount || 0);
}

/**
 * 伝票データ管理クラス（一覧ページ用）
 */
class SlipDataManager {
    constructor() {
        this.storageKey = 'slipData';
    }

    /**
     * 全ての伝票データを読み込み
     */
    async loadAllSlips() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                const slips = JSON.parse(savedData);
                return Array.isArray(slips) ? slips : [];
            }
            return [];
        } catch (error) {
            console.error('伝票データ読み込みエラー:', error);
            return [];
        }
    }

    /**
     * 伝票を削除
     */
    deleteSlip(slipId) {
        try {
            const slips = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
            const filteredSlips = slips.filter(slip => slip.id !== slipId);
            localStorage.setItem(this.storageKey, JSON.stringify(filteredSlips));
            return true;
        } catch (error) {
            console.error('伝票削除エラー:', error);
            return false;
        }
    }
} 