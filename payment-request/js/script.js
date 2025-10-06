// 前回入力された明細データを保存する変数
window.lastDetailData = null;

// 明細修正モード用の変数
window.editingDetailData = null;
window.editingDetailIndex = -1;

// DOM要素が読み込まれた後に実行
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing application');

    // 基本初期化
    initializeApplication();
    
    // 担当者のデフォルト値を設定（ヘッダーのログインユーザ情報から取得）
    initializeStaffDefault();
    
    // 支払日のデフォルト値を設定（翌月末日）
    initializePaymentDateDefault();
    
    // 相手先検索機能を初期化
    initializePayeeSearch();
    
    // 明細入力機能を初期化
    initializeDetailInput();
    
    // 明細テーブルを初期化
    initializeDetailsTable();
    
    // 添付ファイル機能を初期化
    initializeAttachmentSystem();
    
    // ナビゲーション機能を初期化
    initializeNavigation();
    
    // 伝票イメージボタンを初期化
    initializeSlipImageButton();
    
    // 虫眼鏡アイコン機能を初期化
    initializeMagnifyingGlass();
    
    // 伝票ポップアップを初期化
    initializeSlipPopup();
    
    // 発生期バリデーション
    initializeOccurrencePeriodValidation();
    
    // 伝票登録ボタンを初期化
    initializeRegisterButton();
    
    // 列幅リサイズ機能を初期化
    initializeColumnResize();
    
    // テーブルソート機能を初期化
    initializeTableSort();
    
    // 税金集計テーブルを初期化
    resetTaxSummaryTable();
    
    // 申し送りコメントのツールチップ機能を初期化
    initializeCommentTooltip();
    
    // 請求書読み取り機能を初期化
    // 請求書読み取り機能の初期化は invoice-scan.js で行います
    
    console.log('All systems initialized successfully');
});

// アプリケーション基本初期化
function initializeApplication() {
    // データマネージャーの初期化
    if (typeof window.detailDataManager !== 'undefined') {
        console.log('Detail Data Manager available');
    }
}

// 担当者のデフォルト値を設定（ヘッダーのログインユーザ情報から取得）
function initializeStaffDefault() {
    const staffIdInput = document.getElementById('staff-id');
    const staffNameSpan = document.getElementById('staff-name');
    const staffDepartmentSpan = document.getElementById('staff-department');
    
    // ヘッダーからログインユーザ情報を取得
    const userInfoSpan = document.querySelector('.user-info span');
    let userName = 'テストユーザ①'; // デフォルト値
    let staffId = '5551'; // デフォルトID
    
    if (userInfoSpan && userInfoSpan.textContent) {
        const match = userInfoSpan.textContent.match(/ログインユーザ：\s*(.+)/);
        if (match) {
            userName = match[1].trim();
            
            // ユーザ名からIDを決定
            switch(userName) {
                case 'テストユーザ①': staffId = '5551'; break;
                case 'テストユーザ②': staffId = '5552'; break;
                case 'テストユーザ③': staffId = '5553'; break;
                case 'テストユーザ④': staffId = '5554'; break;
                case 'テストユーザ⑤': staffId = '5555'; break;
                default: staffId = '5551'; userName = 'テストユーザ①'; break;
            }
        }
    }
    
    if (staffIdInput && staffNameSpan && staffDepartmentSpan) {
        // 正確な仕様に基づいてデフォルト値を設定
        staffIdInput.value = staffId;
        staffNameSpan.textContent = userName;
        staffDepartmentSpan.textContent = '経理部';
        
        console.log('Staff default set:', staffId, userName);
    }
    
    // 担当者検索機能も追加（イベントリスナーの重複を防ぐ）
    if (staffIdInput && !staffIdInput.hasAttribute('data-staff-initialized')) {
        staffIdInput.setAttribute('data-staff-initialized', 'true');
        
        let lastSearchValue = staffIdInput.value; // 最後に検索した値を記録
        
        staffIdInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (this.value.trim() !== lastSearchValue) {
                    lastSearchValue = this.value.trim();
                    handleStaffSearch();
                }
                // 担当者検索完了後、相手先IDにフォーカス移動
                setTimeout(() => {
                    const payeeIdInput = document.getElementById('payee-id');
                    if (payeeIdInput) {
                        payeeIdInput.focus();
                        console.log('Focus moved to payee-id field');
                    }
                }, 100);
            }
        });
        
        staffIdInput.addEventListener('blur', function() {
            if (this.value.trim() && this.value.trim() !== lastSearchValue) {
                lastSearchValue = this.value.trim();
                handleStaffSearch();
            }
        });
    }
}

// 支払日のデフォルト値を設定（翌月末日）
function initializePaymentDateDefault() {
    const paymentDateInput = document.getElementById('payment-date');
    
    if (paymentDateInput && !paymentDateInput.value) {
        const nextMonthLastDay = getNextMonthLastDay();
        paymentDateInput.value = nextMonthLastDay;
        console.log('Payment date default set to:', nextMonthLastDay);
    }
}

// 翌月末日を取得する関数
function getNextMonthLastDay() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // 翌月を計算（12月の場合は翌年1月になる）
    const nextMonth = currentMonth + 1;
    const nextYear = nextMonth > 11 ? currentYear + 1 : currentYear;
    const adjustedNextMonth = nextMonth > 11 ? 0 : nextMonth;
    
    // 翌月の末日を取得（翌々月の0日目 = 翌月の末日）
    const lastDayOfNextMonth = new Date(nextYear, adjustedNextMonth + 1, 0);
    
    // YYYY-MM-DD形式で返す
    const year = lastDayOfNextMonth.getFullYear();
    const month = String(lastDayOfNextMonth.getMonth() + 1).padStart(2, '0');
    const day = String(lastDayOfNextMonth.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// 担当者検索処理
function handleStaffSearch() {
    const staffIdInput = document.getElementById('staff-id');
    const staffNameSpan = document.getElementById('staff-name');
    const staffDepartmentSpan = document.getElementById('staff-department');
    
    const staffId = staffIdInput.value.trim();
    if (!staffId) return;
    
    // 正確な担当者データ
    const staffData = {
        '5551': { name: 'テストユーザ①', department: '経理部' },
        '5552': { name: 'テストユーザ②', department: '経理部' },
        '5553': { name: 'テストユーザ③', department: '経理部' },
        '5554': { name: 'テストユーザ④', department: '経理部' },
        '5555': { name: 'テストユーザ⑤', department: '経理部' }
    };
    
            const staff = staffData[staffId];
    if (staff) {
        if (staffNameSpan) staffNameSpan.textContent = staff.name;
        if (staffDepartmentSpan) staffDepartmentSpan.textContent = staff.department;
        console.log('Staff found:', staff.name);
        } else {
        if (staffNameSpan) staffNameSpan.textContent = '';
        if (staffDepartmentSpan) staffDepartmentSpan.textContent = '';
        
        // ポップアップの重複を防ぐため、setTimeout で一度だけ表示
        setTimeout(() => {
            alert('該当する担当者が見つかりません。（5551～5555で入力してください）');
        }, 100);
    }
}

// 相手先検索機能を初期化
function initializePayeeSearch() {
    const payeeIdInput = document.getElementById('payee-id');
    
    // イベントリスナーの重複を防ぐ
    if (payeeIdInput && !payeeIdInput.hasAttribute('data-payee-initialized')) {
        payeeIdInput.setAttribute('data-payee-initialized', 'true');
        
        let lastSearchValue = payeeIdInput.value; // 最後に検索した値を記録
        
        payeeIdInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (this.value.trim() !== lastSearchValue) {
                    lastSearchValue = this.value.trim();
                    handlePayeeSearch();
                }
                // 相手先検索完了後、請求書Noにフォーカス移動
                setTimeout(() => {
                    const invoiceNumberInput = document.getElementById('invoice-number');
                    if (invoiceNumberInput) {
                        invoiceNumberInput.focus();
                        console.log('Focus moved to invoice-number field');
                    }
                }, 100);
            }
        });
        
        payeeIdInput.addEventListener('blur', function() {
            if (this.value.trim() && this.value.trim() !== lastSearchValue) {
                lastSearchValue = this.value.trim();
                handlePayeeSearch();
            }
        });
    }
}

function handlePayeeSearch() {
    console.log('handlePayeeSearch called');
    
    const payeeIdInput = document.getElementById('payee-id');
    const payeeNameSpan = document.getElementById('payee-name');
    const payeeRegistrationSpan = document.getElementById('payee-registration');
    const paymentAccountText = document.getElementById('payment-account-text');
    
    console.log('Elements found:', {
        payeeIdInput: !!payeeIdInput,
        payeeNameSpan: !!payeeNameSpan,
        payeeRegistrationSpan: !!payeeRegistrationSpan,
        paymentAccountText: !!paymentAccountText
    });
    
    const payeeId = payeeIdInput.value.trim();
    console.log('Payee ID entered:', payeeId);
    
    if (!payeeId) return;
    
    // 正確なサンプルデータ
    const samplePayees = {
        '9999': { 
            name: 'サンプル株式会社', 
            registration: 'T1234567890123',
            zipCode: '〒123-4567',
            address: '東京都港区六本木１－２－３',
            building: 'サンプルビル5階',
            phone: '電話:03-1234-5678',
            bankName: 'サンプル銀行',
            branchName: '本店',
            accountType: '普通',
            accountNumber: '1234567',
            accountHolder: 'サンプルカブシキガイシャ'
        }
    };
    
    console.log('Sample payees data:', samplePayees);
    
    const payee = samplePayees[payeeId];
    console.log('Found payee:', payee);
    
    if (payee) {
        console.log('Setting payee data to elements');
        if (payeeNameSpan) {
            payeeNameSpan.textContent = payee.name;
            console.log('Set name:', payee.name);
        }
        if (payeeRegistrationSpan) {
            payeeRegistrationSpan.textContent = payee.registration;
            console.log('Set registration:', payee.registration);
        }
        if (paymentAccountText) {
            paymentAccountText.style.display = 'inline';
            console.log('Showed payment account text');
        }
        
        // グローバルに相手先情報を保存（虫眼鏡マークで使用）
        window.currentPayeeData = payee;
        console.log('Saved to window.currentPayeeData:', window.currentPayeeData);
    } else {
        console.log('Payee not found, clearing fields');
        if (payeeNameSpan) payeeNameSpan.textContent = '';
        if (payeeRegistrationSpan) payeeRegistrationSpan.textContent = '';
        if (paymentAccountText) paymentAccountText.style.display = 'none';
        
        // 相手先データをクリア
        window.currentPayeeData = null;
        
        // ポップアップの重複を防ぐため、setTimeout で一度だけ表示
        setTimeout(() => {
            alert('該当する相手先が見つかりません。（9999で入力してください）');
        }, 100);
    }
}

// 明細入力機能を初期化
function initializeDetailInput() {
    const addDetailBtn = document.getElementById('add-detail-btn');
    const editBtn = document.getElementById('edit-detail-btn');
    const deleteBtn = document.getElementById('delete-detail-btn');
    
    if (addDetailBtn) {
        addDetailBtn.addEventListener('click', function() {
            showDetailInputPopup();
        });
    }
    
    // 初期状態では編集・削除ボタンを無効化
    if (editBtn) editBtn.disabled = true;
    if (deleteBtn) {
        deleteBtn.disabled = true;
        deleteBtn.addEventListener('click', function() {
            deleteSelectedDetails();
        });
    }
    
    // 処理区分の変更イベントを初期化
    initializeDetailTypeSelection();
    
    // 明細入力フォームの機能を初期化
    initializeDetailFormHandlers();
    
    // 明細入力ポップアップの閉じるボタン
    const closeButtons = document.querySelectorAll('#detail-popup .close, #detail-cancel');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            hideDetailInputPopup();
        });
    });
    
    // ポップアップの外側クリックで閉じる（オプション）
    const popup = document.getElementById('detail-popup');
    if (popup) {
        popup.addEventListener('click', function(e) {
            if (e.target === popup) {
                hideDetailInputPopup();
            }
        });
    }
}

function showDetailInputPopup() {
    const popup = document.getElementById('detail-popup');
    const popupTitle = document.getElementById('detail-popup-title');
    
    console.log('Popup element found:', !!popup);
    
    if (popup) {
        // 修正モードをクリア
        window.editingDetailData = null;
        window.editingDetailIndex = -1;
        
        // タイトルを新規モードに設定
        if (popupTitle) {
            popupTitle.textContent = '明細入力';
        }
        
        // フォームをリセット
        resetDetailForm();
        
        // 前回入力データがあれば、金額以外をコピー
        if (window.lastDetailData) {
            copyPreviousDetailData(window.lastDetailData);
        }
        
        // 処理区分をデフォルト（番組）に設定（前回データがない場合）
        if (!window.lastDetailData) {
            const programRadio = document.getElementById('detail-type-program');
            if (programRadio) {
                programRadio.checked = true;
            }
            // グループ表示を初期化
            switchDetailGroup('program');
        }
        
        popup.style.display = 'block';
        console.log('Detail input popup opened');
    } else {
        console.error('Detail input popup elements not found');
        alert('明細入力ポップアップが見つかりません。');
    }
}

// 明細フォームをリセット
function resetDetailForm() {
    const form = document.getElementById('detail-form');
    if (form) {
        // 全てのテキスト入力、日付入力、数値入力をクリア
        const inputs = form.querySelectorAll('input[type="text"], input[type="date"], input[type="number"]');
        inputs.forEach(input => {
            input.value = '';
        });
        
        // 全てのセレクトボックスを最初のオプションに設定
        const selects = form.querySelectorAll('select');
        selects.forEach(select => {
            if (select.options.length > 0) {
                        // 消費税区分は「課仕10%」をデフォルトに設定
        if (select.id.includes('detail-tax-category')) {
            select.value = '課仕10%';
        } else if (select.id.includes('detail-tax-type')) {
            // 外税・内税区分は「外税」をデフォルトに設定
            select.value = '外税';
            // 外税がデフォルトなので消費税額フィールドを編集可能にする
            setTimeout(() => {
                if (select.id === 'detail-tax-type') {
                    updateTaxAmountFieldEditability('detail-amount');
                } else if (select.id === 'detail-tax-type-project') {
                    updateTaxAmountFieldEditability('detail-amount-project');
                } else if (select.id === 'detail-tax-type-other') {
                    updateTaxAmountFieldEditability('detail-amount-other');
                }
            }, 50);
        } else {
            select.selectedIndex = 0;
        }
            }
        });
        
        // 全てのチェックボックスをオフに設定
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // ラジオボタンはデフォルト（番組）を選択
        const programRadio = document.getElementById('detail-type-program');
        if (programRadio) {
            programRadio.checked = true;
        }
        
        console.log('Detail form reset');
    }
}

function hideDetailInputPopup() {
    const popup = document.getElementById('detail-popup');
    
    if (popup) {
        popup.style.display = 'none';
        
        // ポップアップを閉じるときもフォームをリセット（次回開く時のため）
        resetDetailForm();
        
        console.log('Detail input popup closed');
    }
}

// 処理区分選択機能を初期化
function initializeDetailTypeSelection() {
    const detailTypeRadios = document.querySelectorAll('input[name="detail-type"]');
    
    detailTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                switchDetailGroup(this.value);
            }
        });
    });
    
    // 初期状態を設定（番組がデフォルト選択）
    switchDetailGroup('program');
}

// 明細グループの表示を切り替える
function switchDetailGroup(selectedType) {
    const groups = {
        'program': document.getElementById('detail-program-group'),
        'project': document.getElementById('detail-project-group'),
        'other': document.getElementById('detail-other-group')
    };
    
    const titles = {
        'program': '明細入力（番組）',
        'project': '明細入力（プロジェクト）',
        'other': '明細入力（経費その他）'
    };
    
    // 全てのグループを非表示にする
    Object.values(groups).forEach(group => {
        if (group) {
            group.style.display = 'none';
        }
    });
    
    // 選択されたグループのみ表示する
    const selectedGroup = groups[selectedType];
    if (selectedGroup) {
        selectedGroup.style.display = 'flex';
        selectedGroup.style.flexDirection = 'column';
        console.log(`Detail group switched to: ${selectedType}`);
    }
    
    // ポップアップのタイトルを更新
    const titleElement = document.getElementById('detail-popup-title');
    if (titleElement && titles[selectedType]) {
        titleElement.textContent = titles[selectedType];
    }
    
    // フォームフィールドのクリア（オプション）
    clearPreviousGroupFields(selectedType, groups);
}

// 他のグループのフィールドをクリア
function clearPreviousGroupFields(currentType, groups) {
    Object.keys(groups).forEach(groupType => {
        if (groupType !== currentType) {
            const group = groups[groupType];
            if (group) {
                const inputs = group.querySelectorAll('input[type="text"], input[type="date"], input[type="number"], select');
                inputs.forEach(input => {
                    if (input.type === 'checkbox') {
                        input.checked = false;
                    } else {
                        input.value = '';
                    }
                });
            }
        }
    });
}

// 明細入力フォームのハンドラーを初期化
function initializeDetailFormHandlers() {
    // 消費税計算機能を初期化
    initializeTaxCalculation();
    
    // 登録ボタンの機能を初期化
    initializeRegistrationHandler();
    
    // クリアボタンの機能を初期化
    initializeClearHandler();
}

// 消費税計算機能を初期化
function initializeTaxCalculation() {
    // 各処理区分の金額フィールドにイベントリスナーを追加
    const amountFields = [
        'detail-amount',           // 番組
        'detail-amount-project',   // プロジェクト
        'detail-amount-other'      // 経費その他
    ];
    
    // 消費税区分・外税内税区分フィールド
    const taxFields = [
        { category: 'detail-tax-category', type: 'detail-tax-type', amount: 'detail-amount' },
        { category: 'detail-tax-category-project', type: 'detail-tax-type-project', amount: 'detail-amount-project' },
        { category: 'detail-tax-category-other', type: 'detail-tax-type-other', amount: 'detail-amount-other' }
    ];
    
    // 金額フィールドのイベントリスナー
    amountFields.forEach(fieldId => {
        const amountField = document.getElementById(fieldId);
        if (amountField) {
            amountField.addEventListener('input', function() {
                calculateTaxForGroup(fieldId);
            });
            
            amountField.addEventListener('blur', function() {
                calculateTaxForGroup(fieldId);
            });
        }
    });
    
    // 消費税区分・外税内税区分の変更イベントリスナー
    taxFields.forEach(field => {
        const categoryField = document.getElementById(field.category);
        const typeField = document.getElementById(field.type);
        
        if (categoryField) {
            categoryField.addEventListener('change', function() {
                calculateTaxForGroup(field.amount);
            });
        }
        
        if (typeField) {
            typeField.addEventListener('change', function() {
                calculateTaxForGroup(field.amount);
                // 外税内税区分変更時に消費税額フィールドの編集可能状態を制御
                updateTaxAmountFieldEditability(field.amount);
            });
        }
    });
}

// 外税内税区分に応じて消費税額フィールドの編集可能状態を制御
function updateTaxAmountFieldEditability(amountFieldId) {
    let taxTypeFieldId = '';
    let taxAmountFieldId = '';
    
    // amountFieldIdから対応する税区分と税額フィールドIDを決定
    if (amountFieldId === 'detail-amount') {
        taxTypeFieldId = 'detail-tax-type';
        taxAmountFieldId = 'detail-tax-amount';
    } else if (amountFieldId === 'detail-amount-project') {
        taxTypeFieldId = 'detail-tax-type-project';
        taxAmountFieldId = 'detail-tax-amount-project';
    } else if (amountFieldId === 'detail-amount-other') {
        taxTypeFieldId = 'detail-tax-type-other';
        taxAmountFieldId = 'detail-tax-amount-other';
    }
    
    const taxTypeField = document.getElementById(taxTypeFieldId);
    const taxAmountField = document.getElementById(taxAmountFieldId);
    
    if (taxTypeField && taxAmountField) {
        const taxType = taxTypeField.value;
        
        if (taxType === '外税') {
            // 外税の場合：編集可能にする
            taxAmountField.removeAttribute('readonly');
            taxAmountField.style.backgroundColor = '#fff';
            taxAmountField.style.cursor = 'text';
            console.log(`Tax amount field ${taxAmountFieldId} enabled for manual edit (外税)`);
        } else {
            // 内税・対象外の場合：読み取り専用にする
            taxAmountField.setAttribute('readonly', 'readonly');
            taxAmountField.style.backgroundColor = '#f5f5f5';
            taxAmountField.style.cursor = 'not-allowed';
            console.log(`Tax amount field ${taxAmountFieldId} disabled for manual edit (${taxType})`);
        }
    }
}

// グループ別の消費税計算
function calculateTaxForGroup(amountFieldId) {
    const amountField = document.getElementById(amountFieldId);
    if (!amountField) return;
    
    // 対応する消費税額フィールドを特定
    let taxAmountFieldId, taxCategoryFieldId, taxTypeFieldId;
    
    if (amountFieldId === 'detail-amount') {
        taxAmountFieldId = 'detail-tax-amount';
        taxCategoryFieldId = 'detail-tax-category';
        taxTypeFieldId = 'detail-tax-type';
    } else if (amountFieldId === 'detail-amount-project') {
        taxAmountFieldId = 'detail-tax-amount-project';
        taxCategoryFieldId = 'detail-tax-category-project';
        taxTypeFieldId = 'detail-tax-type-project';
    } else if (amountFieldId === 'detail-amount-other') {
        taxAmountFieldId = 'detail-tax-amount-other';
        taxCategoryFieldId = 'detail-tax-category-other';
        taxTypeFieldId = 'detail-tax-type-other';
    }
    
    const taxAmountField = document.getElementById(taxAmountFieldId);
    const taxCategoryField = document.getElementById(taxCategoryFieldId);
    const taxTypeField = document.getElementById(taxTypeFieldId);
    
    if (!taxAmountField || !taxCategoryField || !taxTypeField) return;
    
    // 金額を取得
    const amount = parseFloat(amountField.value.replace(/,/g, '')) || 0;
    
    // 消費税区分と外税/内税区分を取得
    const taxCategory = taxCategoryField.value;
    const taxType = taxTypeField.value;
    
    let taxAmount = 0;
    
    // 消費税区分に応じて税率を決定
    let taxRate = 0;
    
    switch (taxCategory) {
        case '課仕8%':
        case '課仕8%（軽減）':
            taxRate = 0.08;
            break;
        case '課仕10%':
            taxRate = 0.10;
            break;
        case '課仕5%':
            taxRate = 0.05;
            break;
        case '非課仕':
        case '対象外':
        case '免税8%':
        case '免税8%（軽減）':
        case '免税10%':
        case '免税5%':
            taxRate = 0;
            break;
        default:
            taxRate = 0;
    }
    
    // 税率が0より大きく、かつ外税・内税区分が「対象外」でない場合のみ計算
    if (taxRate > 0 && taxType !== '対象外') {
        if (taxType === '外税') {
            // 外税の場合：金額 × 税率
            taxAmount = Math.floor(amount * taxRate);
        } else if (taxType === '内税') {
            // 内税の場合：金額 × 税率/(1+税率)
            taxAmount = Math.floor(amount * taxRate / (1 + taxRate));
        }
    }
    
    // 消費税額を表示（カンマ区切り）
    taxAmountField.value = taxAmount > 0 ? new Intl.NumberFormat('ja-JP').format(taxAmount) : '';
    
    console.log(`Tax calculated for ${amountFieldId}: amount=${amount}, tax=${taxAmount}`);
}

// 登録ボタンの機能を初期化
function initializeRegistrationHandler() {
    const form = document.getElementById('detail-form');
    const submitBtn = document.getElementById('detail-submit-btn');
    
    if (form && submitBtn) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleDetailRegistration();
        });
        
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleDetailRegistration();
        });
    }
}

// 明細登録処理
function handleDetailRegistration() {
    // 現在選択されている処理区分を取得
    const selectedType = document.querySelector('input[name="detail-type"]:checked')?.value;
    if (!selectedType) {
        alert('処理区分を選択してください。');
        return;
    }
    
    // 処理区分に応じてデータを収集
    const detailData = collectDetailData(selectedType);
    
    if (!validateDetailData(detailData)) {
        return; // バリデーションエラー
    }
    
    // 修正モードか新規追加かを判定
    if (window.editingDetailData && window.editingDetailIndex >= 0) {
        // 修正モード：既存データを更新
        if (window.temporaryDetailData && window.temporaryDetailData.length > window.editingDetailIndex) {
            const updatedDetail = {
                ...window.temporaryDetailData[window.editingDetailIndex],
                ...detailData,
                updatedAt: new Date().toISOString()
            };
            window.temporaryDetailData[window.editingDetailIndex] = updatedDetail;
            console.log('Detail updated in temporary data:', updatedDetail);
        } else {
            console.error('Invalid editing index:', window.editingDetailIndex);
            alert('修正対象の明細が見つかりません。');
            return;
        }
        
        // 修正モードをクリア
        window.editingDetailData = null;
        window.editingDetailIndex = -1;
        
    } else {
        // 新規追加モード
        const newDetail = {
            id: 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            ...detailData,
            createdAt: new Date().toISOString()
        };
        
        window.temporaryDetailData.push(newDetail);
        console.log('Detail added to temporary data:', newDetail);
    }
    
    console.log('Current temporary data count:', window.temporaryDetailData.length);
    
    // テーブルを更新
    renderDetailsTable();
    
    // メインフォームの合計金額を更新
    updateMainFormTotals();
    
    // 前回入力データとして保存（金額以外をコピー用）
    window.lastDetailData = { ...detailData };
    
    // ポップアップを閉じる
    hideDetailInputPopup();
    
    console.log('明細を登録しました。テーブルを更新中...', 'Previous data saved:', window.lastDetailData);
}

// 処理区分に応じたデータ収集
function collectDetailData(selectedType) {
    const data = {
        type: selectedType
    };
    
    if (selectedType === 'program') {
        data.main = document.getElementById('detail-program')?.value || '';
        data.department = ''; // 番組の場合は空
        data.sub = document.getElementById('detail-broadcast-date')?.value || '';
        data.account = document.getElementById('detail-account')?.value || '';
        data.summary = document.getElementById('detail-summary')?.value || '';
        data.amount = parseFloat(document.getElementById('detail-amount')?.value?.replace(/,/g, '')) || 0;
        data.taxAmount = parseFloat(document.getElementById('detail-tax-amount')?.value?.replace(/,/g, '')) || 0;
        data.taxCategory = document.getElementById('detail-tax-category')?.value || '';
        data.taxType = document.getElementById('detail-tax-type')?.value || '';
        data.advance = document.getElementById('detail-advance')?.value || '';
        data.segment = document.getElementById('detail-segment')?.value || '';
        data.subcontract = document.getElementById('detail-subcontract')?.checked ? 'あり' : '';
    } else if (selectedType === 'project') {
        data.main = document.getElementById('detail-project')?.value || '';
        data.department = ''; // プロジェクトの場合は空
        data.sub = document.getElementById('detail-project-detail')?.value || '';
        data.account = document.getElementById('detail-account-project')?.value || '';
        data.summary = document.getElementById('detail-summary-project')?.value || '';
        data.amount = parseFloat(document.getElementById('detail-amount-project')?.value?.replace(/,/g, '')) || 0;
        data.taxAmount = parseFloat(document.getElementById('detail-tax-amount-project')?.value?.replace(/,/g, '')) || 0;
        data.taxCategory = document.getElementById('detail-tax-category-project')?.value || '';
        data.taxType = document.getElementById('detail-tax-type-project')?.value || '';
        data.advance = document.getElementById('detail-advance-project')?.value || '';
        data.segment = document.getElementById('detail-segment-project')?.value || '';
        data.subcontract = document.getElementById('detail-subcontract-project')?.checked ? 'あり' : '';
    } else if (selectedType === 'other') {
        data.main = ''; // 経費その他の場合は空
        data.department = document.getElementById('detail-department')?.value || '';
        data.sub = document.getElementById('detail-purpose')?.value || '';
        data.account = document.getElementById('detail-account-other')?.value || '';
        data.summary = document.getElementById('detail-summary-other')?.value || '';
        data.amount = parseFloat(document.getElementById('detail-amount-other')?.value?.replace(/,/g, '')) || 0;
        data.taxAmount = parseFloat(document.getElementById('detail-tax-amount-other')?.value?.replace(/,/g, '')) || 0;
        data.taxCategory = document.getElementById('detail-tax-category-other')?.value || '';
        data.taxType = document.getElementById('detail-tax-type-other')?.value || '';
        data.advance = document.getElementById('detail-advance-other')?.value || '';
        data.segment = ''; // 経費その他の場合は空
        data.subcontract = '';
    }
    
    return data;
}

// 明細データのバリデーション
function validateDetailData(data) {
    const errors = [];
    
    if (data.type === 'program') {
        if (!data.main) errors.push('番組名を入力してください。');
        if (!data.sub) errors.push('放送日を入力してください。');
        if (!data.account) errors.push('科目を入力してください。');
    } else if (data.type === 'project') {
        if (!data.main) errors.push('プロジェクト名を入力してください。');
        if (!data.sub) errors.push('プロジェクト内訳を入力してください。');
        if (!data.account) errors.push('科目を入力してください。');
    } else if (data.type === 'other') {
        if (!data.department) errors.push('部署を入力してください。');
        if (!data.account) errors.push('科目を入力してください。');
    }
    
    if (!data.amount || data.amount <= 0) {
        errors.push('金額を正しく入力してください。');
    }
    
    if (errors.length > 0) {
        alert('入力エラー:\n' + errors.join('\n'));
        return false;
    }
    
    return true;
}

// クリアボタンの機能を初期化
function initializeClearHandler() {
    const clearBtn = document.getElementById('detail-clear');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (confirm('入力内容をクリアしますか？')) {
                resetDetailForm();
            }
        });
    }
}

// メインフォームの合計金額を更新
function updateMainFormTotals() {
    let details = [];
    
    // 一時的なデータがある場合はそれを使用、なければJSONから取得
    if (window.temporaryDetailData && window.temporaryDetailData.length > 0) {
        details = window.temporaryDetailData;
        console.log('Calculating totals from temporary data');
    } else if (window.detailDataManager) {
        details = window.detailDataManager.getAllDetails();
        console.log('Calculating totals from JSON data');
    }
    
    // 消費税区分ごとに金額を集計
    const taxSummary = {
        '課仕10%': { taxExcluded: 0, taxAmount: 0, taxIncluded: 0 },
        '課仕8%': { taxExcluded: 0, taxAmount: 0, taxIncluded: 0 },
        '課仕8%（軽減）': { taxExcluded: 0, taxAmount: 0, taxIncluded: 0 },
        '課仕5%': { taxExcluded: 0, taxAmount: 0, taxIncluded: 0 },
        '非課仕': { taxExcluded: 0, taxAmount: 0, taxIncluded: 0 },
        '対象外': { taxExcluded: 0, taxAmount: 0, taxIncluded: 0 },
        '免税8%': { taxExcluded: 0, taxAmount: 0, taxIncluded: 0 },
        '免税8%（軽減）': { taxExcluded: 0, taxAmount: 0, taxIncluded: 0 },
        '免税10%': { taxExcluded: 0, taxAmount: 0, taxIncluded: 0 },
        '免税5%': { taxExcluded: 0, taxAmount: 0, taxIncluded: 0 }
    };
    
    // 各明細を消費税区分別に集計
    details.forEach(detail => {
        const amount = parseFloat(detail.amount) || 0;
        const taxAmount = parseFloat(detail.taxAmount) || 0;
        const taxCategory = detail.taxCategory || '';
        const taxType = detail.taxType || '';
        
        if (taxSummary[taxCategory]) {
            // 税抜額と税込額を計算
            let taxExcluded = amount;
            let taxIncluded = amount;
            
            if (taxType === '内税' && taxAmount > 0) {
                // 内税の場合、金額から税額を引いたものが税抜額
                taxExcluded = amount - taxAmount;
                taxIncluded = amount;
            } else if (taxType === '外税' && taxAmount > 0) {
                // 外税の場合、金額が税抜額
                taxExcluded = amount;
                taxIncluded = amount + taxAmount;
            } else {
                // 税額が0の場合（非課税、対象外、免税など）
                taxExcluded = amount;
                taxIncluded = amount;
            }
            
            taxSummary[taxCategory].taxExcluded += taxExcluded;
            taxSummary[taxCategory].taxAmount += taxAmount;
            taxSummary[taxCategory].taxIncluded += taxIncluded;
        }
    });
    
    // テーブルに集計結果を反映
    updateTaxSummaryTable(taxSummary, details);
    
    // 従来の合計計算（支払金額フィールド用）
    const totalAmount = details.reduce((sum, detail) => sum + (parseFloat(detail.amount) || 0), 0);
    const totalTaxAmount = details.reduce((sum, detail) => sum + (parseFloat(detail.taxAmount) || 0), 0);
    
    // メインフォームの支払金額を更新
    const paymentAmountField = document.getElementById('payment-amount');
    if (paymentAmountField) {
        paymentAmountField.value = new Intl.NumberFormat('ja-JP').format(totalAmount);
    }
    
    // 明細テーブル下部の合計表示を更新
    const internalTaxValue = document.getElementById('internal-tax-value');
    const paymentAmountValue = document.getElementById('payment-amount-value');
    
    if (internalTaxValue) {
        internalTaxValue.textContent = '￥' + new Intl.NumberFormat('ja-JP').format(totalTaxAmount);
    }
    
    if (paymentAmountValue) {
        paymentAmountValue.textContent = '￥' + new Intl.NumberFormat('ja-JP').format(totalAmount);
    }
    
    console.log(`Totals updated: amount=${totalAmount}, tax=${totalTaxAmount}`);
}

// 税金集計テーブルを更新
function updateTaxSummaryTable(taxSummary, details = []) {
    // 消費税区分とテーブルIDのマッピング
    const categoryMapping = {
        '課仕10%': '10',
        '課仕8%': '8',
        '課仕8%（軽減）': '8-reduced',
        '課仕5%': '5',
        '非課仕': 'exempt',
        '対象外': 'excluded',
        '免税8%': 'exempt',     // 非課税として扱う
        '免税8%（軽減）': 'exempt',
        '免税10%': 'exempt',
        '免税5%': 'exempt'
    };
    
    // 使用されている消費税区分を特定
    const usedCategories = new Set();
    details.forEach(detail => {
        const taxCategory = detail.taxCategory || '';
        if (taxCategory && categoryMapping[taxCategory]) {
            usedCategories.add(categoryMapping[taxCategory]);
        }
    });
    
    // 全ての消費税区分列を非表示にする
    Object.values(categoryMapping).forEach(suffix => {
        showTaxColumn(suffix, false);
    });
    
    // 使用されている消費税区分の列のみを表示
    usedCategories.forEach(suffix => {
        showTaxColumn(suffix, true);
    });
    
    // 各セルをクリア
    Object.values(categoryMapping).forEach(suffix => {
        const taxExcludedCell = document.getElementById(`tax-excluded-${suffix}`);
        const taxAmountCell = document.getElementById(`tax-amount-${suffix}`);
        const taxIncludedCell = document.getElementById(`tax-included-${suffix}`);
        
        if (taxExcludedCell) taxExcludedCell.textContent = '0';
        if (taxAmountCell) taxAmountCell.textContent = '0';
        if (taxIncludedCell) taxIncludedCell.textContent = '0';
    });
    
    // 各消費税区分の値を設定
    Object.entries(taxSummary).forEach(([category, amounts]) => {
        const suffix = categoryMapping[category];
        if (!suffix || (amounts.taxExcluded === 0 && amounts.taxAmount === 0 && amounts.taxIncluded === 0)) {
            return; // 該当なしまたは金額が0の場合はスキップ
        }
        
        const taxExcludedCell = document.getElementById(`tax-excluded-${suffix}`);
        const taxAmountCell = document.getElementById(`tax-amount-${suffix}`);
        const taxIncludedCell = document.getElementById(`tax-included-${suffix}`);
        
        if (taxExcludedCell && amounts.taxExcluded > 0) {
            taxExcludedCell.textContent = new Intl.NumberFormat('ja-JP').format(Math.floor(amounts.taxExcluded));
        }
        if (taxAmountCell && amounts.taxAmount > 0) {
            taxAmountCell.textContent = new Intl.NumberFormat('ja-JP').format(Math.floor(amounts.taxAmount));
        }
        if (taxIncludedCell && amounts.taxIncluded > 0) {
            taxIncludedCell.textContent = new Intl.NumberFormat('ja-JP').format(Math.floor(amounts.taxIncluded));
        }
    });
    
    console.log('Tax summary table updated:', { 
        usedCategories: Array.from(usedCategories) 
    });
}

// 消費税区分の列の表示/非表示を切り替え
function showTaxColumn(suffix, show) {
    const display = show ? 'table-cell' : 'none';
    
    // ヘッダー列
    const headerCell = document.getElementById(`tax-category-${suffix}`);
    if (headerCell) {
        headerCell.style.display = display;
    }
    
    // データ列
    const taxExcludedCell = document.getElementById(`tax-excluded-${suffix}`);
    const taxAmountCell = document.getElementById(`tax-amount-${suffix}`);
    const taxIncludedCell = document.getElementById(`tax-included-${suffix}`);
    
    if (taxExcludedCell) taxExcludedCell.style.display = display;
    if (taxAmountCell) taxAmountCell.style.display = display;
    if (taxIncludedCell) taxIncludedCell.style.display = display;
}

// 税金集計テーブルをリセット
function resetTaxSummaryTable() {
    // 全ての金額セルを0にリセット
    const cellIds = [
        'tax-excluded-10', 'tax-excluded-8', 'tax-excluded-8-reduced', 'tax-excluded-5', 
        'tax-excluded-exempt', 'tax-excluded-excluded',
        'tax-amount-10', 'tax-amount-8', 'tax-amount-8-reduced', 'tax-amount-5',
        'tax-amount-exempt', 'tax-amount-excluded',
        'tax-included-10', 'tax-included-8', 'tax-included-8-reduced', 'tax-included-5',
        'tax-included-exempt', 'tax-included-excluded'
    ];
    
    cellIds.forEach(cellId => {
        const cell = document.getElementById(cellId);
        if (cell) {
            cell.textContent = '0';
        }
    });
    
    // 全ての消費税区分列を非表示にする
    const suffixes = ['10', '8', '8-reduced', '5', 'exempt', 'excluded'];
    suffixes.forEach(suffix => {
        showTaxColumn(suffix, false);
    });
    
    console.log('Tax summary table reset');
}

// 明細修正機能
function handleDetailEdit(rowIndex) {
    console.log('Detail edit requested for row:', rowIndex);
    
    // データを取得（一時的なデータを優先）
    let detailData = null;
    
    if (window.temporaryDetailData && window.temporaryDetailData.length > rowIndex) {
        detailData = window.temporaryDetailData[rowIndex];
        console.log('Detail data from temporary data:', detailData);
    } else if (window.detailDataManager) {
        const allDetails = window.detailDataManager.getAllDetails();
        if (allDetails && allDetails.length > rowIndex) {
            detailData = allDetails[rowIndex];
            console.log('Detail data from detailDataManager:', detailData);
        }
    }
    
    if (!detailData) {
        console.error('Detail data not found for row index:', rowIndex);
        alert('明細データが見つかりません。');
        return;
    }
    
    // 修正モードを設定
    window.editingDetailData = detailData;
    window.editingDetailIndex = rowIndex;
    
    // 明細入力ポップアップを修正モードで開く
    showDetailInputPopupForEdit(detailData);
}

function showDetailInputPopupForEdit(detailData) {
    const popup = document.getElementById('detail-popup');
    const popupTitle = document.getElementById('detail-popup-title');
    
    if (popup && popupTitle) {
        // タイトルを修正モードに変更
        popupTitle.textContent = '明細修正';
        
        // フォームをリセット
        resetDetailForm();
        
        // 既存データをフォームに設定
        populateDetailForm(detailData);
        
        popup.style.display = 'block';
        console.log('Detail input popup opened for edit:', detailData);
    } else {
        console.error('Detail input popup elements not found');
        alert('明細入力ポップアップが見つかりません。');
    }
}

function populateDetailForm(detailData) {
    // 処理区分を設定
    const typeRadio = document.getElementById(`detail-type-${detailData.type}`);
    if (typeRadio) {
        typeRadio.checked = true;
        switchDetailGroup(detailData.type);
    }
    
    // 処理区分に応じてデータを設定
    if (detailData.type === 'program') {
        setFieldValue('detail-program', detailData.main);
        setFieldValue('detail-broadcast-date', detailData.sub);
        setFieldValue('detail-account', detailData.account);
        setFieldValue('detail-summary', detailData.summary);
        setFieldValue('detail-amount', detailData.amount ? detailData.amount.toString() : '');
        setFieldValue('detail-tax-amount', detailData.taxAmount ? detailData.taxAmount.toString() : '');
        setFieldValue('detail-tax-category', detailData.taxCategory);
        setFieldValue('detail-tax-type', detailData.taxType);
        setFieldValue('detail-advance', detailData.advance);
        setFieldValue('detail-segment', detailData.segment);
        setCheckboxValue('detail-subcontract', detailData.subcontract === 'あり');
        
    } else if (detailData.type === 'project') {
        setFieldValue('detail-project', detailData.main);
        setFieldValue('detail-project-detail', detailData.sub);
        setFieldValue('detail-account-project', detailData.account);
        setFieldValue('detail-summary-project', detailData.summary);
        setFieldValue('detail-amount-project', detailData.amount ? detailData.amount.toString() : '');
        setFieldValue('detail-tax-amount-project', detailData.taxAmount ? detailData.taxAmount.toString() : '');
        setFieldValue('detail-tax-category-project', detailData.taxCategory);
        setFieldValue('detail-tax-type-project', detailData.taxType);
        setFieldValue('detail-advance-project', detailData.advance);
        setFieldValue('detail-segment-project', detailData.segment);
        setCheckboxValue('detail-subcontract-project', detailData.subcontract === 'あり');
        
    } else if (detailData.type === 'other') {
        setFieldValue('detail-department', detailData.department);
        setFieldValue('detail-purpose', detailData.sub);
        setFieldValue('detail-account-other', detailData.account);
        setFieldValue('detail-summary-other', detailData.summary);
        setFieldValue('detail-amount-other', detailData.amount ? detailData.amount.toString() : '');
        setFieldValue('detail-tax-amount-other', detailData.taxAmount ? detailData.taxAmount.toString() : '');
        setFieldValue('detail-tax-category-other', detailData.taxCategory);
        setFieldValue('detail-tax-type-other', detailData.taxType);
        setFieldValue('detail-advance-other', detailData.advance);
    }
    
    // 外税内税区分に応じて消費税額フィールドの編集可能状態を設定
    if (detailData.type === 'program') {
        updateTaxAmountFieldEditability('detail-amount');
    } else if (detailData.type === 'project') {
        updateTaxAmountFieldEditability('detail-amount-project');
    } else if (detailData.type === 'other') {
        updateTaxAmountFieldEditability('detail-amount-other');
    }
    
    console.log('Detail form populated with existing data');
}

// 申し送りコメントのツールチップ機能を初期化
function initializeCommentTooltip() {
    const commentTextarea = document.getElementById('comment');
    
    if (commentTextarea) {
        // 入力時にツールチップを更新
        commentTextarea.addEventListener('input', function() {
            updateCommentTooltip();
        });
        
        // フォーカス時にツールチップを更新
        commentTextarea.addEventListener('focus', function() {
            updateCommentTooltip();
        });
        
        // ブラー時にツールチップを更新
        commentTextarea.addEventListener('blur', function() {
            updateCommentTooltip();
        });
        
        console.log('Comment tooltip functionality initialized');
    }
}

// 前回入力データをコピーする関数
function copyPreviousDetailData(lastData) {
    if (!lastData) return;
    
    console.log('Copying previous detail data:', lastData);
    
    // 処理区分を設定
    const typeRadio = document.getElementById(`detail-type-${lastData.type}`);
    if (typeRadio) {
        typeRadio.checked = true;
        switchDetailGroup(lastData.type);
    }
    
    // 処理区分に応じてデータをコピー（金額以外）
    if (lastData.type === 'program') {
        setFieldValue('detail-program', lastData.main);
        setFieldValue('detail-broadcast-date', lastData.sub);
        setFieldValue('detail-account', lastData.account);
        setFieldValue('detail-summary', lastData.summary);
        setFieldValue('detail-tax-category', lastData.taxCategory);
        setFieldValue('detail-tax-type', lastData.taxType);
        setFieldValue('detail-advance', lastData.advance);
        setFieldValue('detail-segment', lastData.segment);
        setCheckboxValue('detail-subcontract', lastData.subcontract === 'あり');
        
        // 金額は常にクリア
        setFieldValue('detail-amount', '');
        setFieldValue('detail-tax-amount', '');
        
    } else if (lastData.type === 'project') {
        setFieldValue('detail-project', lastData.main);
        setFieldValue('detail-project-detail', lastData.sub);
        setFieldValue('detail-account-project', lastData.account);
        setFieldValue('detail-summary-project', lastData.summary);
        setFieldValue('detail-tax-category-project', lastData.taxCategory);
        setFieldValue('detail-tax-type-project', lastData.taxType);
        setFieldValue('detail-advance-project', lastData.advance);
        setFieldValue('detail-segment-project', lastData.segment);
        setCheckboxValue('detail-subcontract-project', lastData.subcontract === 'あり');
        
        // 金額は常にクリア
        setFieldValue('detail-amount-project', '');
        setFieldValue('detail-tax-amount-project', '');
        
    } else if (lastData.type === 'other') {
        setFieldValue('detail-department', lastData.department);
        setFieldValue('detail-purpose', lastData.sub);
        setFieldValue('detail-account-other', lastData.account);
        setFieldValue('detail-summary-other', lastData.summary);
        setFieldValue('detail-tax-category-other', lastData.taxCategory);
        setFieldValue('detail-tax-type-other', lastData.taxType);
        setFieldValue('detail-advance-other', lastData.advance);
        
        // 金額は常にクリア
        setFieldValue('detail-amount-other', '');
        setFieldValue('detail-tax-amount-other', '');
    }
    
    console.log('Previous detail data copied (excluding amounts)');
}

// フィールドに値を設定するヘルパー関数
function setFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field && value !== undefined && value !== null) {
        field.value = value;
    }
}

// チェックボックスの値を設定するヘルパー関数
function setCheckboxValue(fieldId, checked) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.checked = !!checked;
    }
}

// 明細テーブルを初期化
function initializeDetailsTable() {
    console.log('Initializing details table...');
    
    // 選択状態管理の初期化
    window.selectedDetailRows = new Set();
    // 一時的な明細データ（画面表示用、JSON保存前）
    window.temporaryDetailData = window.temporaryDetailData || [];
    
    // 新規作成モードの場合は空の行を表示
    const isNewForm = checkIfNewForm();
    
    if (isNewForm) {
        console.log('New form detected, showing empty row');
        renderEmptyDetailsTable();
    } else {
        // データマネージャーの初期化を待つ
        if (window.detailDataManager) {
            window.detailDataManager.loadData().then(() => {
                renderDetailsTable();
            }).catch((error) => {
                console.error('Failed to load detail data:', error);
                renderDetailsTable(); // エラーでも空のテーブルを表示
            });
        } else {
            // データマネージャーが利用できない場合も空のテーブルを表示
            renderDetailsTable();
        }
    }
    
    // 行選択機能を初期化
    initializeRowSelection();
    
    // キーボードショートカットを初期化
    initializeKeyboardShortcuts();
}

// 新規作成フォームかどうかを判定
function checkIfNewForm() {
    // URLパラメータやフォームの状態から新規作成かどうかを判定
    const urlParams = new URLSearchParams(window.location.search);
    const isNew = urlParams.get('mode') === 'new';
    
    // または、フォームが空かどうかで判定
    const payeeName = document.getElementById('payee-name')?.value || '';
    const paymentAmount = document.getElementById('payment-amount')?.value || '';
    const slipTitle = document.getElementById('slip-title')?.value || '';
    
    // フォームが空の場合は新規作成とみなす
    const isFormEmpty = !payeeName && !paymentAmount && !slipTitle;
    
    // 一時的なデータか既存のJSONデータが存在する場合は新規ではない
    const hasTemporaryData = window.temporaryDetailData && window.temporaryDetailData.length > 0;
    const hasJsonData = window.detailDataManager && window.detailDataManager.getAllDetails().length > 0;
    
    if (hasTemporaryData || hasJsonData) {
        console.log('Found existing data, not treating as new form');
        return false;
    }
    
    const result = isNew || isFormEmpty;
    console.log('checkIfNewForm result:', result);
    return result;
}

// 空の明細テーブルを表示
function renderEmptyDetailsTable() {
    const tableBody = document.querySelector('#details-table tbody');
    if (!tableBody) {
        console.error('Details table tbody not found');
        return;
    }
    
    renderEmptyRow(tableBody);
}

// 明細テーブルを描画
function renderDetailsTable() {
    const tableBody = document.querySelector('#details-table tbody');
    if (!tableBody) {
        console.error('Details table tbody not found');
        return;
    }
    
    let details = [];
    
    // 一時的なデータを使用（画面表示用）
    if (window.temporaryDetailData && window.temporaryDetailData.length > 0) {
        details = window.temporaryDetailData;
        console.log('Rendering details table with temporary data:', details.length, 'details');
    } else {
        // 一時的なデータがない場合はJSONから取得（既存データの場合）
        if (window.detailDataManager) {
            details = window.detailDataManager.getAllDetails();
            console.log('Rendering details table with JSON data:', details.length, 'details');
        }
    }
    
    // データがない場合は空の行を1行表示
    if (details.length === 0) {
        console.log('No details found, rendering empty row');
        renderEmptyRow(tableBody);
    } else {
        console.log('Rendering data rows for', details.length, 'details');
        renderDataRows(tableBody, details);
    }
    
    // 選択状態を復元
    restoreRowSelections();
    
    // ボタンの状態を更新
    updateDetailButtons();
}

// 空の行を描画
function renderEmptyRow(tableBody) {
    tableBody.innerHTML = `
        <tr class="empty-row selectable-row" data-row-index="0">
            <td>1</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
    `;
    
    // 既存の列幅設定を空行に適用
    applyColumnWidthsToRows();
    
    console.log('Empty row rendered');
}

// データ行を描画
function renderDataRows(tableBody, details) {
    console.log('renderDataRows called with details:', details);
    
    const dataRowsHtml = details.map((detail, index) => {
        console.log(`Processing detail ${index}:`, detail);
        return `
        <tr data-id="${detail.id || index}" data-row-index="${index}" class="selectable-row">
            <td>${index + 1}</td>
            <td>${detail.main || ''}</td>
            <td>${detail.department || ''}</td>
            <td>${detail.sub || ''}</td>
            <td>${detail.account || ''}</td>
            <td>${detail.summary || ''}</td>
            <td>${detail.amount ? new Intl.NumberFormat('ja-JP').format(detail.amount) : ''}</td>
            <td>${detail.taxCategory || ''}</td>
            <td>${detail.taxType || ''}</td>
            <td>${detail.taxAmount ? new Intl.NumberFormat('ja-JP').format(detail.taxAmount) : ''}</td>
            <td>${detail.advance || ''}</td>
            <td>${detail.extraBudget || ''}</td>
            <td>${detail.segment || ''}</td>
            <td>${detail.counterSegment || ''}</td>
            <td>${detail.postingNo || ''}</td>
            <td>${detail.entertainment || ''}</td>
            <td>${detail.subcontract || ''}</td>
            <td>${detail.content || ''}</td>
        </tr>
    `;
    }).join('');
    
    // 末尾に空白行を追加
    const emptyRowHtml = `
        <tr class="empty-row selectable-row" data-row-index="${details.length}">
            <td>${details.length + 1}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
    `;
    
    const fullHtml = dataRowsHtml + emptyRowHtml;
    console.log('Generated full HTML content with empty row:', fullHtml);
    tableBody.innerHTML = fullHtml;
    
    // 既存の列幅設定を新しい行に適用
    applyColumnWidthsToRows();
    
    console.log(`${details.length} data rows + 1 empty row rendered to table`);
}

// 既存の列幅設定を行に適用
function applyColumnWidthsToRows() {
    const table = document.getElementById('details-table');
    if (!table) return;
    
    const headers = table.querySelectorAll('thead th');
    const rows = table.querySelectorAll('tbody tr');
    
    headers.forEach((header, columnIndex) => {
        const computedStyle = window.getComputedStyle(header);
        const width = computedStyle.width;
        const minWidth = computedStyle.minWidth;
        const maxWidth = computedStyle.maxWidth;
        
        // ヘッダーに明示的な幅が設定されている場合のみ適用
        if (header.style.width) {
            rows.forEach(row => {
                const cell = row.children[columnIndex];
                if (cell) {
                    cell.style.width = width;
                    cell.style.minWidth = minWidth;
                    cell.style.maxWidth = maxWidth;
                }
            });
        }
    });
}

// 明細テーブルを更新（外部から呼び出し可能）
window.updateDetailsTable = function() {
    renderDetailsTable();
};

// 全ての行選択を解除（外部から呼び出し可能）
window.clearAllSelections = function() {
    clearAllRowSelections();
    updateSelectedRowsDisplay();
};

// 明細データをクリアして空の行を表示
window.clearDetailsTable = function() {
    if (window.detailDataManager) {
        // データマネージャーのデータをクリア
        window.detailDataManager.data.details = [];
    }
    // 選択状態をクリア
    window.selectedDetailRows.clear();
    renderEmptyDetailsTable();
    console.log('Details table cleared');
};

// 行選択機能を初期化
function initializeRowSelection() {
    const tableBody = document.querySelector('#details-table tbody');
    if (!tableBody) return;
    
    // 最後に選択された行のインデックスを保存
    window.lastSelectedRowIndex = null;
    
    // イベント委譲を使用してtbodyにクリックイベントを設定
    tableBody.addEventListener('click', function(e) {
        const row = e.target.closest('tr');
        if (!row || !row.classList.contains('selectable-row')) return;
        
        const rowIndex = parseInt(row.getAttribute('data-row-index'));
        if (isNaN(rowIndex)) return;
        
        if (e.shiftKey && window.lastSelectedRowIndex !== null) {
            // Shift+クリックで範囲選択
            selectRowRange(window.lastSelectedRowIndex, rowIndex);
        } else if (e.ctrlKey || e.metaKey) {
            // Ctrl+クリックで複数選択
            toggleRowSelection(row, rowIndex);
            window.lastSelectedRowIndex = rowIndex;
        } else {
            // 通常クリックで単一選択または選択解除
            handleSingleRowClick(row, rowIndex);
            window.lastSelectedRowIndex = rowIndex;
        }
        
        updateSelectedRowsDisplay();
    });
    
    // ダブルクリックイベントを追加（明細修正機能）
    tableBody.addEventListener('dblclick', function(e) {
        const row = e.target.closest('tr');
        if (!row || !row.classList.contains('selectable-row')) return;
        
        // 空行の場合は無視
        if (row.classList.contains('empty-row')) return;
        
        const rowIndex = parseInt(row.getAttribute('data-row-index'));
        if (isNaN(rowIndex)) return;
        
        // 明細修正機能を呼び出し
        handleDetailEdit(rowIndex);
    });
}

// キーボードショートカットを初期化
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // テーブルが表示されている場合のみ有効
        const detailsTable = document.getElementById('details-table');
        if (!detailsTable) return;
        
        // 入力フィールドにフォーカスがある場合は無効
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            return;
        }
        
        switch(e.key) {
            case 'a':
            case 'A':
                if (e.ctrlKey || e.metaKey) {
                    // Ctrl+A で全選択
                    e.preventDefault();
                    selectAllRows();
                }
                break;
            case 'Escape':
                // Esc で選択解除
                e.preventDefault();
                clearAllRowSelections();
                updateSelectedRowsDisplay();
                break;
        }
    });
}

// 全行選択
function selectAllRows() {
    const allRows = document.querySelectorAll('#details-table tbody tr.selectable-row');
    
    // 全ての選択をクリア
    clearAllRowSelections();
    
    // 全ての行を選択
    allRows.forEach((row, index) => {
        const rowIndex = parseInt(row.getAttribute('data-row-index'));
        if (!isNaN(rowIndex)) {
            row.classList.add('selected');
            window.selectedDetailRows.add(rowIndex);
        }
    });
    
    // 最後の行を記録
    if (allRows.length > 0) {
        const lastRow = allRows[allRows.length - 1];
        const lastRowIndex = parseInt(lastRow.getAttribute('data-row-index'));
        if (!isNaN(lastRowIndex)) {
            window.lastSelectedRowIndex = lastRowIndex;
        }
    }
    
    updateSelectedRowsDisplay();
}

// 範囲選択
function selectRowRange(startIndex, endIndex) {
    // 範囲を正規化
    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);
    
    // 既存の選択をクリア
    clearAllRowSelections();
    
    // 範囲内の行を選択
    for (let i = minIndex; i <= maxIndex; i++) {
        const row = document.querySelector(`#details-table tbody tr[data-row-index="${i}"]`);
        if (row) {
            row.classList.add('selected');
            window.selectedDetailRows.add(i);
        }
    }
}

// 単一行クリックの処理
function handleSingleRowClick(row, rowIndex) {
    // 既に選択されている行かどうかチェック
    const isCurrentlySelected = window.selectedDetailRows.has(rowIndex);
    
    if (isCurrentlySelected && window.selectedDetailRows.size === 1) {
        // 既に選択されている行で、かつ唯一の選択行の場合は選択解除
        row.classList.remove('selected');
        window.selectedDetailRows.delete(rowIndex);
        window.lastSelectedRowIndex = null;
    } else {
        // それ以外の場合は単一選択
        selectSingleRow(row, rowIndex);
    }
}

// 単一行選択
function selectSingleRow(row, rowIndex) {
    // 全ての選択を解除
    clearAllRowSelections();
    
    // 指定された行を選択
    row.classList.add('selected');
    window.selectedDetailRows.add(rowIndex);
}

// 行選択の切り替え
function toggleRowSelection(row, rowIndex) {
    if (window.selectedDetailRows.has(rowIndex)) {
        // 選択解除
        row.classList.remove('selected');
        window.selectedDetailRows.delete(rowIndex);
    } else {
        // 選択
        row.classList.add('selected');
        window.selectedDetailRows.add(rowIndex);
    }
}

// 全ての行選択を解除
function clearAllRowSelections() {
    const selectedRows = document.querySelectorAll('#details-table tbody tr.selected');
    selectedRows.forEach(row => row.classList.remove('selected'));
    window.selectedDetailRows.clear();
    window.lastSelectedRowIndex = null;
}

// 選択された行の表示を更新
function updateSelectedRowsDisplay() {
    const selectedCount = window.selectedDetailRows.size;
    console.log(`Selected rows: ${selectedCount}`);
    
    // 選択状況を表示
    updateSelectionInfo(selectedCount);
    
    // 選択された行数をボタンに反映
    updateDetailButtons();
}

// 選択状況の表示を更新
function updateSelectionInfo(selectedCount) {
    // 選択状況表示エリアがあれば更新
    const selectionInfo = document.getElementById('selection-info');
    if (selectionInfo) {
        if (selectedCount > 0) {
            selectionInfo.textContent = `${selectedCount}行選択中`;
            selectionInfo.style.display = 'inline';
        } else {
            selectionInfo.style.display = 'none';
        }
    }
}

// 明細ボタンの状態を更新
function updateDetailButtons() {
    const selectedCount = window.selectedDetailRows.size;
    const editBtn = document.getElementById('edit-detail-btn');
    const deleteBtn = document.getElementById('delete-detail-btn');
    
    if (editBtn) {
        editBtn.disabled = selectedCount !== 1; // 編集は1行のみ
    }
    
    if (deleteBtn) {
        deleteBtn.disabled = selectedCount === 0; // 削除は1行以上選択
    }
}

// 選択された行のデータを取得
window.getSelectedRowData = function() {
    const selectedData = [];
    
    // 一時的なデータがある場合はそれを使用、なければJSONから取得
    let details = [];
    if (window.temporaryDetailData && window.temporaryDetailData.length > 0) {
        details = window.temporaryDetailData;
    } else if (window.detailDataManager) {
        details = window.detailDataManager.getAllDetails();
    }
    
    window.selectedDetailRows.forEach(rowIndex => {
        if (details[rowIndex]) {
            selectedData.push({
                index: rowIndex,
                data: details[rowIndex]
            });
        }
    });
    
    return selectedData;
};

// 選択状態を復元
function restoreRowSelections() {
    if (!window.selectedDetailRows) return;
    
    window.selectedDetailRows.forEach(rowIndex => {
        const row = document.querySelector(`#details-table tbody tr[data-row-index="${rowIndex}"]`);
        if (row) {
            row.classList.add('selected');
        }
    });
}

// 添付ファイル機能を初期化
function initializeAttachmentSystem() {
    const dropZone = document.getElementById('attachment-drop-zone');
    const fileInput = document.getElementById('file-input');
    const selectFileBtn = document.getElementById('select-file-btn');
    const attachmentList = document.getElementById('attachment-list');
    const detachBtn = document.getElementById('detach-btn');
    const previewBtn = document.getElementById('preview-btn');
    
    let attachedFiles = [];
    let selectedFiles = [];
    
    if (selectFileBtn && fileInput) {
        selectFileBtn.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            addFilesDirectly(files);
        });
    }
    
    // ドラッグ&ドロップ機能
    if (dropZone) {
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const files = Array.from(e.dataTransfer.files);
            addFilesDirectly(files);
        });
    }
    
    // ファイルを直接添付済みとして追加
    function addFilesDirectly(files) {
        files.forEach(file => {
            const exists = attachedFiles.some(f => f.file.name === file.name && f.file.size === file.size);
            if (!exists) {
                attachedFiles.push({
                    file: file,
                    id: 'attached_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    status: 'attached',
                    attachedAt: new Date().toISOString()
                });
            }
        });
        renderFileList();
        updateButtonStates();
    }
    
    // ファイルリストを描画
    function renderFileList() {
        if (!attachmentList) return;
        
        if (attachedFiles.length === 0) {
            attachmentList.style.display = 'none';
            return;
        }
        
        attachmentList.style.display = 'block';
        attachmentList.innerHTML = attachedFiles.map(fileObj => {
            const file = fileObj.file;
            const isSelected = selectedFiles.includes(fileObj.id);
            
            return `
                <div class="attachment-item ${isSelected ? 'selected' : ''}" data-file-id="${fileObj.id}">
                    <div class="attachment-item-info">
                        <button type="button" class="attachment-item-popup-btn" onclick="openFileInNewWindow('${fileObj.id}')" title="別ウィンドウで表示">
                            ↗
                        </button>
                        <button type="button" class="attachment-item-split-btn" onclick="openFileInSplitView('${fileObj.id}')" title="分割画面で表示">
                            ⊞
                        </button>
                        <input type="checkbox" class="attachment-item-checkbox" ${isSelected ? 'checked' : ''}>
                        <div class="attachment-item-icon ${getFileIconClass(file)}"></div>
                        <div class="attachment-item-details">
                            <div class="attachment-item-name">${file.name}</div>
                            <div class="attachment-item-size">${formatFileSize(file.size)} • 添付済み</div>
                    </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // チェックボックスのイベントリスナーを設定
        attachmentList.querySelectorAll('.attachment-item-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const fileId = this.closest('.attachment-item').dataset.fileId;
                if (this.checked) {
                    if (!selectedFiles.includes(fileId)) {
                        selectedFiles.push(fileId);
                    }
                } else {
                    selectedFiles = selectedFiles.filter(id => id !== fileId);
                }
                renderFileList();
                updateButtonStates();
        });
    });
    }
    
    // ボタンの状態を更新
    function updateButtonStates() {
        const selectedAttached = attachedFiles.filter(f => selectedFiles.includes(f.id));
        
        if (detachBtn) detachBtn.disabled = selectedAttached.length === 0;
        if (previewBtn) previewBtn.disabled = selectedFiles.length === 0;
    }
    
    // 参照ボタンのクリックイベント
    if (previewBtn) {
        previewBtn.addEventListener('click', function() {
            if (selectedFiles.length > 0) {
                // 選択された最初のファイルを新規ウィンドウで開く
                window.openFileInNewWindow(selectedFiles[0]);
            }
        });
    }
    
    // 解除ボタンの機能
    if (detachBtn) {
        detachBtn.addEventListener('click', function() {
            const selectedAttached = attachedFiles.filter(f => selectedFiles.includes(f.id));
            
            if (selectedAttached.length > 0) {
                if (confirm(`選択した${selectedAttached.length}個のファイルを解除しますか？`)) {
                    // 選択されたファイルを添付リストから削除
                    attachedFiles = attachedFiles.filter(f => !selectedFiles.includes(f.id));
                    selectedFiles = [];
                    renderFileList();
                    updateButtonStates();
                }
            }
        });
    }
    
    // ファイルサイズをフォーマット
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // ファイルタイプに応じたアイコンクラスを取得
    function getFileIconClass(file) {
        const type = file.type.toLowerCase();
        const name = file.name.toLowerCase();
        
        if (type.includes('pdf')) return 'file-icon-pdf';
        if (type.includes('image')) return 'file-icon-image';
        if (type.includes('excel') || type.includes('spreadsheet') || name.endsWith('.xlsx') || name.endsWith('.xls')) return 'file-icon-excel';
        if (type.includes('word') || type.includes('document') || name.endsWith('.docx') || name.endsWith('.doc')) return 'file-icon-document';
        return 'file-icon-default';
    }
    
    // グローバルアクセス用
    window.attachmentSystem = {
        getAttachedFiles: () => attachedFiles,
        clearAll: () => {
            attachedFiles = [];
            selectedFiles = [];
            renderFileList();
            updateButtonStates();
        }
    };
}

// ナビゲーション機能を初期化
function initializeNavigation() {
    const slipListLink = document.getElementById('slip-list-link');
    
    if (slipListLink) {
        slipListLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('現在の入力内容は保存されません。一覧画面に移動しますか？')) {
                window.location.href = 'slip-list.html';
            }
        });
    }
}

// 伝票イメージボタンを初期化
function initializeSlipImageButton() {
    const slipImageBtn = document.getElementById('show-slip-btn-bottom');
    
    if (slipImageBtn) {
        slipImageBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showSlipPopup();
        });
    }
}

// 虫眼鏡アイコン機能を初期化
function initializeMagnifyingGlass() {
    const addressInfoBtns = document.querySelectorAll('.address-info-btn');
    
    addressInfoBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const popup = this.querySelector('.address-popup');
            if (popup) {
                const isVisible = popup.style.display === 'block';
                
                // 全てのポップアップを閉じる
                document.querySelectorAll('.address-popup').forEach(p => {
                    p.style.display = 'none';
                });
                
                // クリックされたポップアップを表示/非表示
                if (!isVisible) {
                    popup.style.display = 'block';
                    
                    // 内容を設定
                    const content = popup.querySelector('.address-popup-content');
                    if (content) {
                        if (this.id === 'payment-account-info-btn') {
                            // 支払先口座情報
                            if (window.currentPayeeData) {
                                const payee = window.currentPayeeData;
                                content.innerHTML = `
                                    <div style="font-family: 'MS Gothic', monospace; font-size: 12px; line-height: 1.0; color: black; white-space: nowrap;">
                                        <div>${payee.accountNumber}</div>
                                        <div>みずほ 内幸町営業部 普通 ${payee.accountNumber}</div>
                                        <div>フジック（カ</div>
                                    </div>
                                `;
                            } else {
                                content.innerHTML = '<div style="color: black; white-space: nowrap;">相手先を入力してください。</div>';
                            }
                        } else {
                            // 相手先住所情報
                            if (window.currentPayeeData) {
                                const payee = window.currentPayeeData;
                                content.innerHTML = `
                                    <div style="font-family: 'MS Gothic', monospace; font-size: 12px; line-height: 1.0; color: black; white-space: nowrap;">
                                        <div>${payee.zipCode}</div>
                                        <div>${payee.address}</div>
                                        <div>${payee.building}</div>
                                        <div>${payee.phone}</div>
                                    </div>
                                `;
                            } else {
                                content.innerHTML = '<div style="color: black; white-space: nowrap;">相手先を入力してください。</div>';
                            }
                        }
                    }
                }
            }
        });
    });
    
    // ドキュメントクリックでポップアップを閉じる
    document.addEventListener('click', function() {
        document.querySelectorAll('.address-popup').forEach(popup => {
            popup.style.display = 'none';
        });
    });
}

// 発生期バリデーション
function initializeOccurrencePeriodValidation() {
    const startMonthInput = document.getElementById('occurrence-start-month-picker');
    const endMonthInput = document.getElementById('occurrence-end-month-picker');
    
    if (!startMonthInput || !endMonthInput) {
        console.error('発生月の入力フィールドが見つかりません');
        return;
    }
    
    // デフォルト値として当月を設定
    const currentMonth = getCurrentMonth();
    startMonthInput.value = currentMonth;
    endMonthInput.value = currentMonth;
    
    console.log('発生月のデフォルト値を設定:', currentMonth);
    
    // 開始月変更時のイベント
    startMonthInput.addEventListener('change', function() {
        const startMonth = startMonthInput.value;
        
        if (startMonth) {
            // 終了月の最小値を開始月に設定
            endMonthInput.min = startMonth;
            console.log('終了月の最小値を設定:', startMonth);
            
            // 現在の終了月が開始月より前の場合、開始月と同じ値に修正
            const endMonth = endMonthInput.value;
            if (endMonth && endMonth < startMonth) {
                endMonthInput.value = startMonth;
                console.log('終了月を自動修正:', startMonth);
            }
        }
        
        validateOccurrencePeriod();
    });
    
    // 終了月変更時のイベント
    endMonthInput.addEventListener('change', function() {
        const startMonth = startMonthInput.value;
        const endMonth = endMonthInput.value;
        
        // 終了月が開始月より前の場合、開始月と同じ値に修正
        if (startMonth && endMonth && endMonth < startMonth) {
            endMonthInput.value = startMonth;
            console.log('終了月を自動修正（変更時）:', startMonth);
        }
        
        validateOccurrencePeriod();
    });
    
    // バリデーション関数
    function validateOccurrencePeriod() {
        const startMonth = startMonthInput.value;
        const endMonth = endMonthInput.value;
        
        if (startMonth && endMonth) {
            const startDate = new Date(startMonth + '-01');
            const endDate = new Date(endMonth + '-01');
            const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
            
            // 12ヶ月を超える場合の警告
            if (diffMonths > 12) {
                if (!confirm('発生期の期間が12ヶ月を超えています。この設定でよろしいですか？')) {
                    endMonthInput.value = startMonth;
                    return false;
                }
            }
        }
        
        return true;
    }
}

// 現在月を YYYY-MM 形式で取得
function getCurrentMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

// 伝票登録後にフォームをクリア
function clearFormAfterRegistration() {
    console.log('フォームをクリア中...');
    
    try {
        // 担当者情報をクリア
        const staffIdInput = document.getElementById('staff-id');
        const staffNameSpan = document.getElementById('staff-name');
        const staffDepartmentSpan = document.getElementById('staff-department');
        
        if (staffIdInput) staffIdInput.value = '';
        if (staffNameSpan) staffNameSpan.textContent = '';
        if (staffDepartmentSpan) staffDepartmentSpan.textContent = '';
        
        // 相手先情報をクリア
        const payeeIdInput = document.getElementById('payee-id');
        const payeeNameSpan = document.getElementById('payee-name');
        const payeeRegistrationSpan = document.getElementById('payee-registration');
        const paymentAccountText = document.getElementById('payment-account-text');
        
        if (payeeIdInput) payeeIdInput.value = '';
        if (payeeNameSpan) payeeNameSpan.textContent = '';
        if (payeeRegistrationSpan) payeeRegistrationSpan.textContent = '';
        if (paymentAccountText) paymentAccountText.style.display = 'none';
        
        // グローバルな相手先データをクリア
        window.currentPayeeData = null;
        
        // 支払金額をクリア
        const paymentAmountInput = document.getElementById('payment-amount');
        if (paymentAmountInput) paymentAmountInput.value = '';
        
        // 発生月をデフォルト値（当月）に戻す
        const startMonthInput = document.getElementById('occurrence-start-month-picker');
        const endMonthInput = document.getElementById('occurrence-end-month-picker');
        const currentMonth = getCurrentMonth();
        
        if (startMonthInput) startMonthInput.value = currentMonth;
        if (endMonthInput) {
            endMonthInput.value = currentMonth;
            endMonthInput.min = currentMonth; // 最小値もリセット
        }
        
        // 取引年月日をクリア
        const transactionDateInput = document.getElementById('transaction-date');
        if (transactionDateInput) transactionDateInput.value = '';
        
        // 請求書Noをクリア
        const invoiceNumberInput = document.getElementById('invoice-number');
        if (invoiceNumberInput) invoiceNumberInput.value = '';
        
        // 備考をクリア
        const remarksInput = document.getElementById('remarks');
        if (remarksInput) remarksInput.value = '';
        
        const commentInput = document.getElementById('comment');
        if (commentInput) {
            commentInput.value = '';
            updateCommentTooltip(); // ツールチップもクリア
        }
        
        // 伝票タイトルをクリア
        const slipTitleInput = document.getElementById('slip-title');
        const slipTitleExtraInput = document.getElementById('slip-title-extra');
        if (slipTitleInput) slipTitleInput.value = '';
        if (slipTitleExtraInput) slipTitleExtraInput.value = '';
        
        // 明細テーブルを空の状態に戻す
        window.temporaryDetailData = [];
        window.selectedDetailRows.clear();
        renderEmptyDetailsTable();
        
        // 合計金額表示をリセット
        const internalTaxValue = document.getElementById('internal-tax-value');
        const paymentAmountValue = document.getElementById('payment-amount-value');
        
        if (internalTaxValue) internalTaxValue.textContent = '￥0';
        if (paymentAmountValue) paymentAmountValue.textContent = '￥0';
        
        // 税金集計テーブルをリセット
        resetTaxSummaryTable();
        
        // 登録番号表示をクリア（5秒後に非表示）
        const registrationDisplay = document.getElementById('registration-number-display');
        if (registrationDisplay) {
            setTimeout(() => {
                registrationDisplay.textContent = '';
                registrationDisplay.style.display = 'none';
            }, 5000);
        }
        
        // 添付ファイルをクリア
        clearAttachmentFiles();
        
        // 明細ボタンの状態をリセット
        updateDetailButtons();
        
        // 担当者のデフォルト値を再設定
        initializeStaffDefault();
        
        // 支払日のデフォルト値を再設定
        initializePaymentDateDefault();
        
        console.log('フォームのクリアが完了しました');
        
    } catch (error) {
        console.error('フォームクリア中にエラーが発生しました:', error);
    }
}

// 添付ファイルをクリア
function clearAttachmentFiles() {
    try {
        // ファイル入力をクリア
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = '';
        
        // 添付ファイル一覧をクリア
        const fileList = document.getElementById('file-list');
        if (fileList) fileList.innerHTML = '';
        
        // グローバルな添付ファイル配列をクリア（もし存在する場合）
        if (window.attachedFiles) {
            window.attachedFiles = [];
        }
        
        console.log('添付ファイルがクリアされました');
        
    } catch (error) {
        console.error('添付ファイルクリア中にエラーが発生しました:', error);
    }
}

// 列幅リサイズ機能を初期化
function initializeColumnResize() {
    const table = document.getElementById('details-table');
    if (!table) {
        console.error('明細テーブルが見つかりません');
        return;
    }
    
    let isResizing = false;
    let currentColumn = null;
    let startX = 0;
    let startWidth = 0;
    
    // 各列リサイザーにイベントリスナーを追加
    const resizers = table.querySelectorAll('.column-resizer');
    resizers.forEach((resizer, index) => {
        resizer.addEventListener('mousedown', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            isResizing = true;
            currentColumn = this.parentElement;
            startX = e.clientX;
            startWidth = parseInt(window.getComputedStyle(currentColumn).width, 10);
            
            document.body.classList.add('column-resizing');
            
            console.log('列リサイズ開始:', currentColumn.textContent.trim(), 'width:', startWidth);
        });
    });
    
    // マウス移動イベント
    document.addEventListener('mousemove', function(e) {
        if (!isResizing || !currentColumn) return;
        
        e.preventDefault();
        
        const diff = e.clientX - startX;
        const newWidth = Math.max(30, startWidth + diff); // 最小幅30px
        
        // 列幅を更新
        currentColumn.style.width = newWidth + 'px';
        currentColumn.style.minWidth = newWidth + 'px';
        currentColumn.style.maxWidth = newWidth + 'px';
        
        // 対応するtdの幅も更新
        const columnIndex = Array.from(currentColumn.parentElement.children).indexOf(currentColumn);
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const cell = row.children[columnIndex];
            if (cell) {
                cell.style.width = newWidth + 'px';
                cell.style.minWidth = newWidth + 'px';
                cell.style.maxWidth = newWidth + 'px';
            }
        });
    });
    
    // マウスアップイベント
    document.addEventListener('mouseup', function(e) {
        if (!isResizing) return;
        
        isResizing = false;
        currentColumn = null;
        document.body.classList.remove('column-resizing');
        
        console.log('列リサイズ終了');
    });
    
    // テーブルの初期設定
    table.style.tableLayout = 'fixed';
    table.style.width = '100%';
    
    console.log('列幅リサイズ機能が初期化されました');
}

// テーブルソート機能を初期化
function initializeTableSort() {
    const table = document.getElementById('details-table');
    if (!table) {
        console.error('明細テーブルが見つかりません');
        return;
    }
    
    // ソート状態を管理
    let currentSortColumn = null;
    let currentSortOrder = 'asc'; // 'asc' or 'desc'
    
    // 各ソート可能な列ヘッダーにクリックイベントを追加
    const sortableHeaders = table.querySelectorAll('th.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', function(e) {
            // リサイザー部分をクリックした場合はソートしない
            if (e.target.classList.contains('column-resizer')) {
                return;
            }
            
            const column = this.getAttribute('data-col');
            console.log('ソート実行:', column);
            
            // 同じ列の場合は順序を反転、異なる列の場合は昇順から開始
            if (currentSortColumn === column) {
                currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortColumn = column;
                currentSortOrder = 'asc';
            }
            
            // ソート実行
            sortTable(column, currentSortOrder);
            
            // ソート状態の表示を更新
            updateSortDisplay(this, currentSortOrder);
        });
    });
    
    console.log('テーブルソート機能が初期化されました');
}

// テーブルをソート
function sortTable(column, order) {
    console.log(`テーブルソート: ${column} (${order})`);
    
    // データを取得
    let details = [];
    if (window.temporaryDetailData && window.temporaryDetailData.length > 0) {
        details = [...window.temporaryDetailData]; // コピーを作成
    } else if (window.detailDataManager) {
        details = [...window.detailDataManager.getAllDetails()]; // コピーを作成
    }
    
    if (details.length === 0) {
        console.log('ソートするデータがありません');
        return;
    }
    
    // ソート関数
    details.sort((a, b) => {
        let valueA = getSortValue(a, column);
        let valueB = getSortValue(b, column);
        
        // 数値比較
        if (!isNaN(valueA) && !isNaN(valueB)) {
            const numA = parseFloat(valueA) || 0;
            const numB = parseFloat(valueB) || 0;
            return order === 'asc' ? numA - numB : numB - numA;
        }
        
        // 文字列比較
        const strA = String(valueA).toLowerCase();
        const strB = String(valueB).toLowerCase();
        
        if (order === 'asc') {
            return strA.localeCompare(strB, 'ja');
        } else {
            return strB.localeCompare(strA, 'ja');
        }
    });
    
    // ソート後のデータで配列を更新
    if (window.temporaryDetailData && window.temporaryDetailData.length > 0) {
        window.temporaryDetailData = details;
    }
    
    // テーブルを再描画
    renderDetailsTable();
    
    console.log(`ソート完了: ${details.length}件`);
}

// ソート用の値を取得
function getSortValue(detail, column) {
    switch (column) {
        case 'no':
            return 0; // No列は行番号なのでソート不要
        case 'main':
            return detail.main || '';
        case 'department':
            return detail.department || '';
        case 'sub':
            return detail.sub || '';
        case 'account':
            return detail.account || '';
        case 'summary':
            return detail.summary || '';
        case 'amount':
            return parseFloat(detail.amount) || 0;
        case 'taxCategory':
            return detail.taxCategory || '';
        case 'taxType':
            return detail.taxType || '';
        case 'taxAmount':
            return parseFloat(detail.taxAmount) || 0;
        case 'advance':
            return detail.advance || '';
        case 'extraBudget':
            return detail.extraBudget || '';
        case 'segment':
            return detail.segment || '';
        case 'counterSegment':
            return detail.counterSegment || '';
        case 'postingNo':
            return detail.postingNo || '';
        case 'entertainment':
            return detail.entertainment || '';
        case 'subcontract':
            return detail.subcontract || '';
        case 'content':
            return detail.content || '';
        default:
            return '';
    }
}

// ソート状態の表示を更新
function updateSortDisplay(activeHeader, order) {
    // 全ての列ヘッダーからソートクラスを削除
    const allHeaders = document.querySelectorAll('#details-table th.sortable');
    allHeaders.forEach(header => {
        header.classList.remove('sort-asc', 'sort-desc');
    });
    
    // アクティブな列ヘッダーにソートクラスを追加
    if (order === 'asc') {
        activeHeader.classList.add('sort-asc');
    } else {
        activeHeader.classList.add('sort-desc');
    }
}

// グローバル関数
window.showSlipPopup = function() {
    const popup = document.getElementById('slip-popup');
    
    if (popup) {
        // フォームデータを伝票に反映
        updateSlipData();
        
        // ポップアップを表示
        popup.style.display = 'block';
        document.body.style.overflow = 'hidden'; // スクロールを無効化
        
        console.log('Slip popup opened');
    } else {
        alert('伝票イメージ機能の準備中です。');
    }
};

// 伝票データを更新する関数
function updateSlipData() {
    // 基本情報
    const inputDate = new Date().toLocaleDateString('ja-JP');
    document.getElementById('slip-input-date').textContent = inputDate;
    
    // 相手先
    const payeeName = document.getElementById('payee-name')?.value || '';
    document.getElementById('slip-payee-name').textContent = payeeName;
    
    // タイトル
    const slipTitle = document.getElementById('slip-title')?.value || '';
    document.getElementById('slip-title-display').textContent = slipTitle;
    
    // 支払金額
    const paymentAmount = document.getElementById('payment-amount')?.value || '0';
    const formattedAmount = new Intl.NumberFormat('ja-JP').format(paymentAmount);
    document.getElementById('slip-payment-amount').textContent = formattedAmount + '円';
    document.getElementById('slip-payment-amount-footer').textContent = formattedAmount + '円';
    
    // 発生月
    const occurrenceStartMonth = document.getElementById('occurrence-start-month-picker')?.value || '';
    const occurrenceEndMonth = document.getElementById('occurrence-end-month-picker')?.value || '';
    let occurrenceMonth = '';
    if (occurrenceStartMonth && occurrenceEndMonth) {
        occurrenceMonth = occurrenceStartMonth === occurrenceEndMonth ? 
            occurrenceStartMonth : occurrenceStartMonth + '～' + occurrenceEndMonth;
    } else if (occurrenceStartMonth) {
        occurrenceMonth = occurrenceStartMonth;
    }
    document.getElementById('slip-occurrence-month').textContent = occurrenceMonth;
    
    // 支払予定日
    const paymentDate = document.getElementById('payment-date')?.value || '';
    document.getElementById('slip-payment-date').textContent = paymentDate;
    
    // 請求書No
    const invoiceNumber = document.getElementById('invoice-number')?.value || '';
    document.getElementById('slip-invoice-number').textContent = invoiceNumber;
    
    // 備考
    const remarks = document.getElementById('remarks')?.value || '';
    document.getElementById('slip-remarks').textContent = remarks;
    
    // 振込先（デフォルト値を設定）
    document.getElementById('slip-payment-account').textContent = '〇〇銀行 営業部 普通 0001 ◯◯◯◯';
    document.getElementById('slip-payment-account-footer').textContent = '〇〇銀行';
    
    // 税額計算（仮）
    const taxAmount = Math.floor(paymentAmount * 0.1);
    const taxExcludedAmount = paymentAmount - taxAmount;
    document.getElementById('slip-internal-tax').textContent = new Intl.NumberFormat('ja-JP').format(taxAmount) + '円';
    document.getElementById('slip-tax-included-amount').textContent = new Intl.NumberFormat('ja-JP').format(taxAmount) + '円';
    document.getElementById('slip-internal-tax-footer').textContent = new Intl.NumberFormat('ja-JP').format(paymentAmount) + '円';
    
    // 明細データを更新
    updateSlipDetails();
}

// 伝票ポップアップを閉じる関数
window.closeSlipPopup = function() {
    const popup = document.getElementById('slip-popup');
    if (popup) {
        popup.style.display = 'none';
        document.body.style.overflow = ''; // スクロールを元に戻す
        console.log('Slip popup closed');
    }
};

// 伝票明細を更新する関数
function updateSlipDetails() {
    const tbody = document.querySelector('#slip-details-table tbody');
    if (!tbody) return;
    
    // 既存の明細をクリア
    tbody.innerHTML = '';
    
    // 明細データマネージャーから明細を取得
    if (window.detailDataManager) {
        const details = window.detailDataManager.getAllDetails();
        
                details.forEach((detail, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${detail.main || ''}</td>
                <td>${detail.department || ''}</td>
                <td>${detail.sub || ''}</td>
                <td>${detail.account || ''}</td>
                <td>${detail.summary || ''}</td>
                <td>${detail.amount ? new Intl.NumberFormat('ja-JP').format(detail.amount) + '円' : ''}</td>
                <td>${detail.taxCategory || ''}</td>
                <td>${detail.taxType || ''}</td>
                <td>${detail.taxAmount ? new Intl.NumberFormat('ja-JP').format(detail.taxAmount) + '円' : ''}</td>
                <td>${detail.advance || ''}</td>
                <td>${detail.extraBudget || ''}</td>
                <td>${detail.segment || ''}</td>
                <td>${detail.counterSegment || ''}</td>
                <td>${detail.postingNo || ''}</td>
                <td>${detail.entertainment || ''}</td>
                <td>${detail.subcontract || ''}</td>
                <td>${detail.content || ''}</td>
            `;
            tbody.appendChild(row);
        });
     }
}

// 伝票ポップアップの初期化
function initializeSlipPopup() {
    // 閉じるボタンのイベントリスナー
    const closeBtn = document.querySelector('#slip-popup .slip-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', window.closeSlipPopup);
    }
    
    // ポップアップの外側をクリックしたら閉じる
    const popup = document.getElementById('slip-popup');
    if (popup) {
        popup.addEventListener('click', function(e) {
            // ポップアップのコンテンツ部分（.slip-modal）をクリックした場合は閉じない
            if (e.target === popup) {
                window.closeSlipPopup();
            }
        });
    }
    
    // ESCキーで閉じる
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const popup = document.getElementById('slip-popup');
            if (popup && popup.style.display === 'block') {
                window.closeSlipPopup();
            }
        }
    });
}

window.openFileInNewWindow = function(fileId) {
    const attachedFiles = window.attachmentSystem?.getAttachedFiles() || [];
    const fileObj = attachedFiles.find(f => f.id === fileId);
    
    if (fileObj) {
        const file = fileObj.file;
        const url = URL.createObjectURL(file);
        // 小窓（ポップアップウィンドウ）のオプション
        const windowFeatures = 'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no';
        const newWindow = window.open(url, '_blank', windowFeatures);
        if (newWindow) {
            newWindow.document.title = file.name;
        }
    } else {
        alert('ファイルが見つかりません。');
    }
};

window.openFileInSplitView = function(fileId) {
    const attachedFiles = window.attachmentSystem?.getAttachedFiles() || [];
    const fileObj = attachedFiles.find(f => f.id === fileId);
    
    if (!fileObj) {
        alert('ファイルが見つかりません。');
        return;
    }
    
    // 既存の分割ビューがあれば閉じる
    window.closeSplitView();
    
    const file = fileObj.file;
    const url = URL.createObjectURL(file);
    
    // 分割ビューコンテナを作成
    const splitViewContainer = document.createElement('div');
    splitViewContainer.id = 'split-view-container';
    
    // リサイザーを作成
    const resizer = document.createElement('div');
    resizer.className = 'split-view-resizer';
    
    // ヘッダーを作成
    const header = document.createElement('div');
    header.className = 'split-view-header';
    
    const title = document.createElement('div');
    title.className = 'split-view-title';
    title.textContent = file.name;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'split-view-close-btn';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = window.closeSplitView;
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    
    // コンテンツエリアを作成
    const content = document.createElement('div');
    content.className = 'split-view-content';
    
    // ファイルタイプに応じた表示
    if (file.type.includes('pdf')) {
        // PDF表示
        const embed = document.createElement('embed');
        embed.src = url;
        embed.type = 'application/pdf';
        embed.style.width = '100%';
        embed.style.height = '100%';
        content.appendChild(embed);
    } else if (file.type.includes('image')) {
        // 画像表示
        const img = document.createElement('img');
        img.src = url;
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.maxHeight = '100%';
        img.style.objectFit = 'contain';
        img.style.display = 'block';
        img.style.margin = '0 auto';
        content.appendChild(img);
    } else {
        // その他のファイル
        const message = document.createElement('div');
        message.className = 'split-view-loading';
        message.textContent = 'このファイル形式はプレビューできません。';
        content.appendChild(message);
    }
    
    // 要素を組み立て
    splitViewContainer.appendChild(resizer);
    splitViewContainer.appendChild(header);
    splitViewContainer.appendChild(content);
    
    // DOMに追加
    document.body.appendChild(splitViewContainer);
    document.body.classList.add('split-view-active');
    
    // 初期の伝票イメージボタン位置を設定
    const initialWidth = splitViewContainer.offsetWidth;
    updateFixedButtonPosition(initialWidth);
    
    // リサイズ機能を追加
    setupSplitViewResizer(resizer, splitViewContainer);
};

// 分割ビューのリサイズ機能を設定
function setupSplitViewResizer(resizer, container) {
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;
    let currentX = 0;
    let animationId = null;
    
    resizer.addEventListener('mousedown', function(e) {
        isResizing = true;
        startX = e.clientX;
        currentX = e.clientX;
        startWidth = container.offsetWidth;
        document.body.classList.add('split-view-resizing');
        
        // アニメーションループを開始
        animateResize();
        
        // ドキュメント全体でマウスイベントを監視
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        e.preventDefault();
        e.stopPropagation();
    });
    
    function handleMouseMove(e) {
        if (!isResizing) return;
        currentX = e.clientX;
        e.preventDefault();
    }
    
    function animateResize() {
        if (!isResizing) {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            return;
        }
        
        const deltaX = startX - currentX;
        const newWidth = startWidth + deltaX;
        const minWidth = 300; // 最小幅
        const maxWidth = window.innerWidth * 0.85; // 最大幅（画面の85%）
        
        // 幅を制限内に調整
        const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
        
        // スムーズにサイズを適用
        container.style.width = clampedWidth + 'px';
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.style.marginRight = clampedWidth + 'px';
        }
        
        // 伝票イメージボタンの位置を調整
        updateFixedButtonPosition(clampedWidth);
        
        // 次のフレームでも継続
        animationId = requestAnimationFrame(animateResize);
    }
    
    function handleMouseUp(e) {
        isResizing = false;
        document.body.classList.remove('split-view-resizing');
        
        // アニメーションを停止
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        e.preventDefault();
    }
    
    // ESCキーで分割ビューを閉じる
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('split-view-container')) {
            window.closeSplitView();
        }
    });
}

// 固定ボタンの位置を更新する関数
function updateFixedButtonPosition(splitViewWidth) {
    const fixedButtonContainer = document.querySelector('[style*="position: fixed"][style*="right: 24px"][style*="bottom: 18px"]');
    if (fixedButtonContainer) {
        fixedButtonContainer.style.right = (splitViewWidth + 24) + 'px';
    }
}

window.closeSplitView = function() {
    const splitViewContainer = document.getElementById('split-view-container');
    if (splitViewContainer) {
        // オブジェクトURLをクリーンアップ
        const embed = splitViewContainer.querySelector('embed');
        const img = splitViewContainer.querySelector('img');
        if (embed && embed.src) {
            URL.revokeObjectURL(embed.src);
        }
        if (img && img.src) {
            URL.revokeObjectURL(img.src);
        }
        
        splitViewContainer.remove();
    }
    document.body.classList.remove('split-view-active');
    document.body.classList.remove('split-view-resizing');
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.style.marginRight = '';
    }
    
    // 伝票イメージボタンを元の位置に戻す
    const fixedButtonContainer = document.querySelector('[style*="position: fixed"][style*="right:"][style*="bottom: 18px"]');
    if (fixedButtonContainer) {
        fixedButtonContainer.style.right = '24px';
    }
};

// 伝票登録ボタンの初期化
function initializeRegisterButton() {
    const registerBtn = document.getElementById('register-btn');
    
    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('伝票登録ボタンがクリックされました');
            
            // 伝票データと明細データを保存
            if (window.temporaryDetailData && window.temporaryDetailData.length > 0) {
                console.log('伝票データと明細データを保存中...');
                
                try {
                    // 伝票データを収集
                    const slipData = collectSlipData();
                    
                    // 明細データをJSONに保存
                    window.temporaryDetailData.forEach(detail => {
                        const cleanDetail = { ...detail };
                        delete cleanDetail.id;
                        window.detailDataManager.addDetail(cleanDetail);
                    });
                    
                    // 伝票データを保存
                    saveSlipData(slipData);
                    
                    // 一時的なデータをクリア
                    window.temporaryDetailData = [];
                    
                    // テーブルを再描画（JSONデータから）
                    renderDetailsTable();
                    
                    console.log('伝票登録が完了しました');
                    alert('伝票登録が完了しました。');
                    
                            // フォームをクリア
        clearFormAfterRegistration();
        
        // 前回入力データもクリア（新規フォーム開始）
        window.lastDetailData = null;
                    
                    // 支払日のデフォルト値を再設定
                    initializePaymentDateDefault();
                    
                } catch (error) {
                    console.error('伝票登録中にエラーが発生しました:', error);
                    alert('伝票登録中にエラーが発生しました。');
                }
            } else {
                console.log('保存する明細データがありません');
                alert('登録する明細データがありません。');
            }
        });
        
        console.log('伝票登録ボタンが初期化されました');
    } else {
        console.error('伝票登録ボタンが見つかりません');
    }
}

// 選択された明細を削除
function deleteSelectedDetails() {
    const selectedRows = Array.from(window.selectedDetailRows).sort((a, b) => b - a); // 逆順でソート（後ろから削除）
    
    if (selectedRows.length === 0) {
        alert('削除する行を選択してください。');
        return;
    }
    
    const confirmMessage = `選択された${selectedRows.length}件の明細を削除しますか？`;
    if (!confirm(confirmMessage)) {
        return;
    }
    
    try {
        // 一時的なデータがある場合
        if (window.temporaryDetailData && window.temporaryDetailData.length > 0) {
            console.log('一時的なデータから削除中...', selectedRows);
            
            // 後ろのインデックスから削除（配列の要素がずれるのを防ぐため）
            selectedRows.forEach(rowIndex => {
                if (rowIndex < window.temporaryDetailData.length) {
                    window.temporaryDetailData.splice(rowIndex, 1);
                }
            });
            
            console.log('一時的なデータから削除完了。残り:', window.temporaryDetailData.length, '件');
        } else if (window.detailDataManager) {
            // JSONデータから削除
            console.log('JSONデータから削除中...', selectedRows);
            const allDetails = window.detailDataManager.getAllDetails();
            
            selectedRows.forEach(rowIndex => {
                if (rowIndex < allDetails.length) {
                    const detail = allDetails[rowIndex];
                    if (detail && detail.id) {
                        window.detailDataManager.deleteDetail(detail.id);
                    }
                }
            });
            
            console.log('JSONデータから削除完了');
        }
        
        // 選択状態をクリア
        window.selectedDetailRows.clear();
        
        // テーブルを再描画
        renderDetailsTable();
        
        // 合計金額を更新
        updateMainFormTotals();
        
        console.log('明細削除完了');
        
    } catch (error) {
        console.error('明細削除中にエラーが発生しました:', error);
        alert('明細削除中にエラーが発生しました。');
    }
}

// 伝票データを収集
function collectSlipData() {
    const now = new Date();
    const registrationNumber = generateRegistrationNumber();
    
    // フォームから基本情報を取得
    const staffName = document.getElementById('staff-name')?.textContent || '';
    const payeeName = document.getElementById('payee-name')?.textContent || '';
    const transactionDate = document.getElementById('transaction-date')?.value || '';
    const slipTitle = document.getElementById('slip-title')?.value || '';
    const invoiceNumber = document.getElementById('invoice-number')?.value || '';
    const remarks = document.getElementById('remarks')?.value || '';
    const occurrenceStartMonth = document.getElementById('occurrence-start-month-picker')?.value || '';
    const occurrenceEndMonth = document.getElementById('occurrence-end-month-picker')?.value || '';
    
    // 明細から合計金額を計算
    let totalAmount = 0;
    let totalTax = 0;
    
    window.temporaryDetailData.forEach(detail => {
        totalAmount += parseFloat(detail.amount) || 0;
        totalTax += parseFloat(detail.taxAmount) || 0;
    });
    
    const slipData = {
        id: 'slip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        registrationNumber: registrationNumber,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        staffName: staffName,
        payeeName: payeeName,
        transactionDate: transactionDate,
        slipTitle: slipTitle,
        invoiceNumber: invoiceNumber,
        remarks: remarks,
        occurrenceStartMonth: occurrenceStartMonth,
        occurrenceEndMonth: occurrenceEndMonth,
        totalAmount: totalAmount,
        totalTax: totalTax,
        totalTaxIncluded: totalAmount + totalTax,
        detailCount: window.temporaryDetailData.length,
        status: 'registered'
    };
    
    console.log('収集された伝票データ:', slipData);
    return slipData;
}

// 登録番号を生成
function generateRegistrationNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `${year}${month}${day}-${time}-${random}`;
}

// 伝票データを保存
function saveSlipData(slipData) {
    try {
        // 既存の伝票データを取得
        const existingSlips = JSON.parse(localStorage.getItem('slipData') || '[]');
        
        // 新しい伝票を追加
        existingSlips.push(slipData);
        
        // ローカルストレージに保存
        localStorage.setItem('slipData', JSON.stringify(existingSlips));
        
        console.log('伝票データが保存されました:', slipData.registrationNumber);
        
        // 登録番号を画面に表示
        const registrationDisplay = document.getElementById('registration-number-display');
        if (registrationDisplay) {
            registrationDisplay.textContent = `登録番号: ${slipData.registrationNumber}`;
            registrationDisplay.style.display = 'inline';
        }
        
    } catch (error) {
        console.error('伝票データ保存エラー:', error);
        throw error;
    }
}    

// 請求書データをフォームに適用
function applyInvoiceDataToForm(data) {
    // 相手先情報を設定
    const payeeIdInput = document.getElementById('payee-id');
    const payeeNameSpan = document.getElementById('payee-name');
    
    if (payeeIdInput) payeeIdInput.value = data.payeeId;
    if (payeeNameSpan) payeeNameSpan.textContent = data.payeeName;
    
    // vendorAddressRecipientが設定されている場合は相手先検索をスキップ
    if (data.payeeName && data.payeeName.trim() !== '') {
        console.log('vendorAddressRecipientが設定されているため、相手先検索をスキップします');
    } else {
        // 相手先検索を実行
        handlePayeeSearch();
    }
    
    // 請求書番号を設定
    const invoiceNumberInput = document.getElementById('invoice-number');
    if (invoiceNumberInput) invoiceNumberInput.value = data.invoiceNumber;
    
    // 取引年月日を設定（invoiceDateを優先、なければissueDateを使用）
    const transactionDateInput = document.getElementById('transaction-date');
    if (transactionDateInput) {
        if (data.invoiceDate) {
            transactionDateInput.value = data.invoiceDate;
            console.log('取引年月日にinvoiceDateを設定しました:', data.invoiceDate);
        } else if (data.issueDate) {
            transactionDateInput.value = data.issueDate;
            console.log('取引年月日にissueDateを設定しました:', data.issueDate);
        }
    }
    

    
    console.log('請求書データをフォームに適用しました:', data);
}


