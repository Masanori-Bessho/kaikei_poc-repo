// 請求書読み取り機能を初期化
function initializeInvoiceScan() {
    const invoiceScanBtn = document.getElementById('invoice-scan-btn');
    const invoiceScanPopup = document.getElementById('invoice-scan-popup');
    const invoiceScanForm = document.getElementById('invoice-scan-form');
    const invoiceScanCancel = document.getElementById('invoice-scan-cancel');
    const loadingPopup = document.getElementById('loading-popup');
    const resultPopup = document.getElementById('result-popup');
    const resultCloseBtn = document.getElementById('result-close-btn');
    
    // 請求書読み取りボタンのクリックイベント
    if (invoiceScanBtn) {
        invoiceScanBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showInvoiceScanPopup();
        });
    }
    
    // 請求書読み取りフォームの送信イベント
    if (invoiceScanForm) {
        invoiceScanForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleInvoiceScan();
        });
    }
    
    // ファイル選択時のイベント
    const fileInput = document.getElementById('invoice-scan-file');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                showSelectedFileName(file.name);
            } else {
                hideSelectedFileName();
            }
        });
    }
    
    // キャンセルボタンのクリックイベント
    if (invoiceScanCancel) {
        invoiceScanCancel.addEventListener('click', function(e) {
            e.preventDefault();
            hideInvoiceScanPopup();
        });
    }
    
    // ×ボタンのクリックイベント
    const closeBtn = invoiceScanPopup.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            hideInvoiceScanPopup();
        });
    }
    
    // 結果ポップアップの閉じるボタン
    if (resultCloseBtn) {
        resultCloseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            hideResultPopup();
        });
    }
    
    // ポップアップの外側クリックで閉じる
    if (invoiceScanPopup) {
        invoiceScanPopup.addEventListener('click', function(e) {
            if (e.target === invoiceScanPopup) {
                hideInvoiceScanPopup();
            }
        });
    }
    
    if (resultPopup) {
        resultPopup.addEventListener('click', function(e) {
            if (e.target === resultPopup) {
                hideResultPopup();
            }
        });
    }
    
    console.log('請求書読み取り機能が初期化されました');
}

// 選択されたファイル名を表示
function showSelectedFileName(fileName) {
    const fileNameDisplay = document.getElementById('file-name-display');
    const selectedFileName = document.getElementById('selected-file-name');
    
    if (fileNameDisplay && selectedFileName) {
        fileNameDisplay.textContent = fileName;
        selectedFileName.style.display = 'block';
        console.log('ファイル名を表示:', fileName);
    }
}

// 選択されたファイル名を非表示
function hideSelectedFileName() {
    const selectedFileName = document.getElementById('selected-file-name');
    
    if (selectedFileName) {
        selectedFileName.style.display = 'none';
        console.log('ファイル名を非表示にしました');
    }
}

// 請求書読み取りポップアップを表示
function showInvoiceScanPopup() {
    const popup = document.getElementById('invoice-scan-popup');
    if (popup) {
        popup.style.display = 'block';
        console.log('請求書読み取りポップアップを表示');
    }
}

// 請求書読み取りポップアップを非表示
function hideInvoiceScanPopup() {
    const popup = document.getElementById('invoice-scan-popup');
    const form = document.getElementById('invoice-scan-form');
    
    if (popup) {
        popup.style.display = 'none';
    }
    
    if (form) {
        form.reset();
    }
    
    hideSelectedFileName();
    console.log('請求書読み取りポップアップを非表示');
}

// 請求書読み取り処理
function handleInvoiceScan() {
    const fileInput = document.getElementById('invoice-scan-file');
    
    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        
        // ファイルサイズチェック（10MB以下）
        if (file.size > 10 * 1024 * 1024) {
            showErrorPopup('ファイルサイズが大きすぎます。10MB以下のファイルを選択してください。');
            return;
        }
        
        // ファイル形式チェック
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            showErrorPopup('対応していないファイル形式です。PDF、JPEG、PNGファイルを選択してください。');
            return;
        }
        
        console.log('請求書読み取り開始:', file.name);
        
        // ローディングポップアップを表示
        showLoadingPopup();
        
        // OCR APIにファイルを送信
        sendFileToOCRAPI(file);
    } else {
        showErrorPopup('ファイルを選択してください。');
    }
}

// ファイルをBase64に変換
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// OCR APIにファイルを送信
async function sendFileToOCRAPI(file) {
    try {
        console.log('OCR APIにファイルを送信中:', file.name);
        
        // ファイルをBase64に変換
        const base64Data = await fileToBase64(file);
        
        // OCR APIのURL
        const ocrApiUrl = 'https://defaultbf0b15c4879942ca8d1392a189d92c.ad.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/1583c87ce32140da89bbda59262d9b9b/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Ks_NweUPf-N0QmZ5K6mq9gFUyzWQm38nXsx8fC1hOps';
        
        // リクエストボディ
        const requestBody = {
            fileName: file.name,
            file: base64Data
        };
        
        const response = await fetch(ocrApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        const result = await response.json();
        console.log('OCR API応答:', result);
        
        // ローディングポップアップを非表示
        hideLoadingPopup();
        
        // OCR結果を処理
        processOCRResult(result, file);
        
    } catch (error) {
        console.error('OCR API呼び出しエラー:', error);
        hideLoadingPopup();
        showErrorPopup('OCR処理中にエラーが発生しました。\n' + error.message);
    }
}

// OCR結果を処理
function processOCRResult(ocrResult, file) {
    try {
        // OCR結果からデータを抽出
        const extractedData = extractDataFromOCRResult(ocrResult);
        
        // 結果ポップアップを表示
        showResultPopup(extractedData, ocrResult);
        
        // 請求書読み取りポップアップを閉じる
        hideInvoiceScanPopup();
        
    } catch (error) {
        console.error('OCR結果処理エラー:', error);
        showErrorPopup('OCR結果の処理中にエラーが発生しました。\n' + error.message);
    }
}

// OCR結果からデータを抽出
function extractDataFromOCRResult(ocrResult) {
    // OCR結果の構造に応じてデータを抽出
    // 実際のAPI応答形式に合わせて調整が必要
    
    const extractedData = {
        payeeName: '',
        payeeId: '',
        invoiceNumber: '',
        amount: 0,
        taxAmount: 0,
        issueDate: '',
        occurrenceMonthStart: '', // 発生月（開始）フィールドを追加
        occurrenceMonthEnd: '', // 発生月（終了）フィールドを追加
        paymentDate: '', // 支払日フィールドを追加
        staffName: '', // 担当者フィールドを追加
        paymentMethod: '', // 支払方法フィールドを追加
        dueDate: '',
        fileName: '',
        confidence: 0,
        comment: '', // 申送りコメントを追加
        unitPrice: 0 // 単価を追加
    };
    
    // OCR結果からデータを抽出するロジック
    if (ocrResult && typeof ocrResult === 'object') {
        
        // 相手先名の抽出（json3の値を使用）
        if (ocrResult.json3) {
            extractedData.payeeName = ocrResult.json3;
        }
        
        // 請求書番号の抽出（json2の値を使用）
        if (ocrResult.json2) {
            extractedData.invoiceNumber = ocrResult.json2;
            console.log('請求書番号として設定:', ocrResult.json2);
        }
        

        
        // 信頼度の抽出
        if (ocrResult.confidence) {
            extractedData.confidence = parseFloat(ocrResult.confidence) || 0;
        }
        
        // vendorAddressRecipientの抽出
        const vendorAddressRecipient = extractVendorAddressRecipientFromOCRResult(ocrResult);
        if (vendorAddressRecipient) {
            extractedData.payeeName = vendorAddressRecipient;
            console.log('vendorAddressRecipientとして設定:', vendorAddressRecipient);
        }
        
        // 発行日の抽出（json4の値を使用）
        if (ocrResult.json4) {
            extractedData.issueDate = ocrResult.json4;
            console.log('発行日として設定:', ocrResult.json4);
        }
        
        // 発生月（開始）の抽出（json5の値を使用）
        if (ocrResult.json5) {
            extractedData.occurrenceMonthStart = ocrResult.json5;
            console.log('発生月（開始）として設定:', ocrResult.json5);
        }
        
        // 発生月（終了）の抽出（json6の値を使用）
        if (ocrResult.json6) {
            extractedData.occurrenceMonthEnd = ocrResult.json6;
            console.log('発生月（終了）として設定:', ocrResult.json6);
        }
        

        
        // amountValuesの抽出
        const amountValues = extractAmountValueTextFromOCRResult(ocrResult);
        if (amountValues && amountValues.length > 0) {
            extractedData.amountValues = amountValues;
            console.log('amountValuesとして設定:', amountValues);
        }
        
        // parentKeyOfItemNameの抽出
        const parentKeyOfItemName = extractAndProcessParentKeyOfItemNameFromOCRResult(ocrResult);
        if (parentKeyOfItemName) {
            extractedData.parentKeyOfItemName = parentKeyOfItemName;
            console.log('parentKeyOfItemNameとして設定:', parentKeyOfItemName);
        }
        
        // 明細行の抽出（json10の配列から設定）
        const lineItems = [];
        
        if (ocrResult.json10 && Array.isArray(ocrResult.json10)) {
            ocrResult.json10.forEach((item, index) => {
                const lineItem = {
                    description: item.タイトル || '',
                    quantity: parseInt(item.数量) || 0,
                    unitPrice: parseFloat(item.単価.replace(/,/g, '')) || 0,
                    amount: parseFloat(item.金額.replace(/,/g, '')) || 0
                };
                
                lineItems.push(lineItem);
                console.log(`明細行${index + 1}として設定:`, lineItem);
            });
        }
        
        if (lineItems.length > 0) {
            extractedData.lineItems = lineItems;
            console.log('明細行リストとして設定:', lineItems);
        }
        
        // 支払日の抽出（json7の値を使用）
        if (ocrResult.json7) {
            extractedData.paymentDate = ocrResult.json7;
            console.log('支払日として設定:', ocrResult.json7);
        }
        
        // 担当者の抽出（json8の値を使用）
        if (ocrResult.json8) {
            extractedData.staffName = ocrResult.json8;
            console.log('担当者として設定:', ocrResult.json8);
        }
        
        // 支払方法の抽出（json9の値を使用）
        if (ocrResult.json9) {
            extractedData.paymentMethod = ocrResult.json9;
            console.log('支払方法として設定:', ocrResult.json9);
        }
    }
    
    return extractedData;
}







// OCR結果から明細行を抽出
function extractLineItemsFromOCRResult(ocrResult) {
    try {
        const lineItems = [];
        
        // responsev2のitemsから明細行を抽出
        if (ocrResult && ocrResult.responsev2 && ocrResult.responsev2.predictionOutput && 
            ocrResult.responsev2.predictionOutput.result && ocrResult.responsev2.predictionOutput.result.items) {
            
            const items = ocrResult.responsev2.predictionOutput.result.items;
            console.log('OCR結果からitemsを発見:', items);
            
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item && item.fields) {
                    const lineItem = {
                        description: '',
                        quantity: 0,
                        unitPrice: 0,
                        amount: 0,
                        boundingBox: null
                    };
                    
                    // 各フィールドの値を抽出
                    if (item.fields.description) {
                        lineItem.description = item.fields.description.valueText || '';
                        if (item.fields.description.location && item.fields.description.location.boundingBox) {
                            lineItem.boundingBox = item.fields.description.location.boundingBox;
                        }
                    }
                    
                    if (item.fields.quantity) {
                        lineItem.quantity = item.fields.quantity.valueNumber || 
                                          parseInt(item.fields.quantity.valueText) || 0;
                    }
                    
                    if (item.fields.unitPrice) {
                        lineItem.unitPrice = item.fields.unitPrice.valueNumber || 
                                           parseFloat(item.fields.unitPrice.valueText.replace(/[¥,]/g, '')) || 0;
                    }
                    
                    if (item.fields.amount) {
                        lineItem.amount = item.fields.amount.valueNumber || 
                                        parseFloat(item.fields.amount.valueText.replace(/[¥,]/g, '')) || 0;
                    }
                    
                    // 明細行が有効な場合のみ追加
                    if (lineItem.description || lineItem.quantity || lineItem.unitPrice || lineItem.amount) {
                        lineItems.push(lineItem);
                        console.log(`明細行${i + 1}を抽出:`, lineItem);
                    }
                }
            }
        }
        
        // boundingBox.topの値でソート（上から下へ）
        lineItems.sort((a, b) => {
            if (a.boundingBox && b.boundingBox) {
                return a.boundingBox.top - b.boundingBox.top;
            }
            return 0;
        });
        
        console.log('抽出された明細行:', lineItems);
        return lineItems;
        
    } catch (error) {
        console.error('明細行抽出中にエラーが発生しました:', error);
        return [];
    }
}

// OCR結果からdescription.valueTextを抽出
function extractDescriptionValueTextFromOCRResult(ocrResult) {
    try {
        const descriptionValues = [];
        
        const searchDescriptionValueText = (obj, currentPath = '') => {
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                    const newPath = currentPath ? `${currentPath}.${key}` : key;
                    
                    if (key === 'description' && value && value.valueText && typeof value.valueText === 'string' && value.valueText.trim()) {
                        const trimmedValue = value.valueText.trim();
                        if (trimmedValue && !descriptionValues.includes(trimmedValue)) {
                            descriptionValues.push(trimmedValue);
                            console.log(`description.valueTextを発見 (${newPath}):`, trimmedValue);
                        }
                    } else if (typeof value === 'object' && value !== null) {
                        searchDescriptionValueText(value, newPath);
                    } else if (Array.isArray(value)) {
                        value.forEach((item, index) => {
                            if (typeof item === 'object' && item !== null) {
                                searchDescriptionValueText(item, `${newPath}[${index}]`);
                            }
                        });
                    }
                }
            }
        };
        
        searchDescriptionValueText(ocrResult);
        console.log('抽出されたdescription.valueText:', descriptionValues);
        return descriptionValues;
        
    } catch (error) {
        console.error('description.valueText抽出中にエラーが発生しました:', error);
        return [];
    }
}

// OCR結果からamount.valueTextを抽出
function extractAmountValueTextFromOCRResult(ocrResult) {
    try {
        const amountValues = [];
        
        const searchAmountValueText = (obj, currentPath = '') => {
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                    const newPath = currentPath ? `${currentPath}.${key}` : key;
                    
                    if (key === 'amount' && value && value.valueText && typeof value.valueText === 'string' && value.valueText.trim()) {
                        // 空白とカンマを取り除き、数値化
                        const cleanedValue = value.valueText.trim().replace(/[\s,]/g, '');
                        if (cleanedValue && !amountValues.includes(cleanedValue)) {
                            amountValues.push(cleanedValue);
                            console.log(`amount.valueTextを発見 (${newPath}):`, cleanedValue);
                        }
                    } else if (typeof value === 'object' && value !== null) {
                        searchAmountValueText(value, newPath);
                    } else if (Array.isArray(value)) {
                        value.forEach((item, index) => {
                            if (typeof item === 'object' && item !== null) {
                                searchAmountValueText(item, `${newPath}[${index}]`);
                            }
                        });
                    }
                }
            }
        };
        
        searchAmountValueText(ocrResult);
        console.log('抽出されたamount.valueText:', amountValues);
        
        // 合計金額を計算
        const totalAmount = amountValues.reduce((sum, amountStr) => {
            const amount = parseFloat(amountStr) || 0;
            return sum + amount;
        }, 0);
        
        console.log('合計金額:', totalAmount);
        return [totalAmount.toString()];
        
    } catch (error) {
        console.error('amount.valueText抽出中にエラーが発生しました:', error);
        return [];
    }
}

// OCR結果からparentKeyOfItemNameを抽出・処理
function extractAndProcessParentKeyOfItemNameFromOCRResult(ocrResult) {
    try {
        const parentKeyOfItemName = [];
        
        const searchParentKeyOfItemName = (obj, currentPath = '') => {
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                    const newPath = currentPath ? `${currentPath}.${key}` : key;
                    
                    if (key === 'itemName' && value && value.valueText && typeof value.valueText === 'string' && value.valueText.trim()) {
                        const trimmedValue = value.valueText.trim();
                        if (trimmedValue && !parentKeyOfItemName.includes(trimmedValue)) {
                            parentKeyOfItemName.push(trimmedValue);
                            console.log(`itemName.valueTextを発見 (${newPath}):`, trimmedValue);
                        }
                    } else if (typeof value === 'object' && value !== null) {
                        searchParentKeyOfItemName(value, newPath);
                    } else if (Array.isArray(value)) {
                        value.forEach((item, index) => {
                            if (typeof item === 'object' && item !== null) {
                                searchParentKeyOfItemName(item, `${newPath}[${index}]`);
                            }
                        });
                    }
                }
            }
        };
        
        searchParentKeyOfItemName(ocrResult);
        console.log('抽出されたparentKeyOfItemName:', parentKeyOfItemName);
        return parentKeyOfItemName;
        
    } catch (error) {
        console.error('parentKeyOfItemName抽出中にエラーが発生しました:', error);
        return [];
    }
}

// 請求書データをフォームに適用
function applyInvoiceDataToForm(data) {
    // 相手先情報を設定（OCR結果のjson3の値を直接設定）
    const payeeNameSpan = document.getElementById('payee-name');
    
    if (payeeNameSpan && data.payeeName) {
        payeeNameSpan.textContent = data.payeeName;
        console.log('OCR結果の相手先名を設定しました:', data.payeeName);
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

// ローディングポップアップを表示
function showLoadingPopup() {
    const popup = document.getElementById('loading-popup');
    if (popup) {
        popup.style.display = 'block';
        console.log('ローディングポップアップを表示');
    }
}

// ローディングポップアップを非表示
function hideLoadingPopup() {
    const popup = document.getElementById('loading-popup');
    if (popup) {
        popup.style.display = 'none';
        console.log('ローディングポップアップを非表示');
    }
}

// 明細行のHTMLを生成する関数
function generateLineItemsHtml(lineItems) {
    if (!lineItems || lineItems.length === 0) {
        return `
            <div class="result-section">
                <h3>明細行</h3>
                <p style="color: #666; font-style: italic;">明細行が見つかりませんでした。</p>
            </div>
        `;
    }
    
    const lineItemsHtml = lineItems.map((item, index) => `
        <div class="line-item" style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px; background-color: #f9f9f9;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h4 style="margin: 0; color: #333;">明細行 ${index + 1}</h4>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
                <div style="text-align: center;">
                    <strong style="display: block; color: #495057; margin-bottom: 5px; font-size: 12px;">説明</strong>
                    <span style="color: #333; font-weight: 500;">${item.description || '未設定'}</span>
                </div>
                <div style="text-align: center;">
                    <strong style="display: block; color: #495057; margin-bottom: 5px; font-size: 12px;">数量</strong>
                    <span style="color: #333; font-weight: 500;">${item.quantity || 0}</span>
                </div>
                <div style="text-align: center;">
                    <strong style="display: block; color: #495057; margin-bottom: 5px; font-size: 12px;">単価</strong>
                    <span style="color: #333; font-weight: 500;">￥${new Intl.NumberFormat('ja-JP').format(item.unitPrice || 0)}</span>
                </div>
                <div style="text-align: center;">
                    <strong style="display: block; color: #495057; margin-bottom: 5px; font-size: 12px;">金額</strong>
                    <span style="color: #333; font-weight: 500; ${(item.amount || 0) < 0 ? 'color: #28a745;' : ''}">￥${new Intl.NumberFormat('ja-JP').format(item.amount || 0)}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    return `
        <div class="result-section">
            <h3>明細行 (${lineItems.length}件)</h3>
            ${lineItemsHtml}
        </div>
    `;
}

// 結果ポップアップを表示
function showResultPopup(data, ocrResult) {
    const popup = document.getElementById('result-popup');
    const title = document.getElementById('result-title');
    const content = document.getElementById('result-content');
    
    if (popup && title && content) {
        title.textContent = '請求書読み取り完了';
        
        // 伝票タイトル候補を抽出（json1の値を使用）
        const slipTitleCandidates = ocrResult.json1 ? [ocrResult.json1] : [];
        
        // 伝票タイトル候補のHTMLを生成（テキスト表示）
        let slipTitleHtml = '';
        if (slipTitleCandidates.length > 0) {
            slipTitleHtml = `
                <div class="result-section">
                    <h3>伝票タイトル</h3>
                    <div class="slip-title-display">
                        <p style="color: #333; font-weight: 500; font-size: 16px; margin: 10px 0; padding: 10px; background-color: #f8f9fa; border-radius: 4px; border-left: 4px solid #007bff;">
                            ${slipTitleCandidates[0]}
                        </p>
                    </div>
                </div>
            `;
        } else {
            slipTitleHtml = `
                <div class="result-section">
                    <h3>伝票タイトル</h3>
                    <p style="color: #666; font-style: italic;">適切な伝票タイトルが見つかりませんでした。</p>
                </div>
            `;
        }
        
        content.innerHTML = `
            <div class="result-section">
                <h3>読み取り結果</h3>
                <table class="result-table">
                    <tr>
                        <td><strong>伝票タイトル:</strong></td>
                        <td>${slipTitleCandidates.length > 0 ? slipTitleCandidates[0] : '未設定'}</td>
                    </tr>
                    <tr>
                        <td><strong>相手先:</strong></td>
                        <td>${data.payeeName}</td>
                    </tr>
                    <tr>
                        <td><strong>請求書番号:</strong></td>
                        <td>${data.invoiceNumber}</td>
                    </tr>

                    <tr>
                        <td><strong>発行日:</strong></td>
                        <td>${data.issueDate || '未設定'}</td>
                    </tr>
                    <tr>
                        <td><strong>発生月（開始）:</strong></td>
                        <td>${data.occurrenceMonthStart || '未設定'}</td>
                    </tr>
                    <tr>
                        <td><strong>発生月（終了）:</strong></td>
                        <td>${data.occurrenceMonthEnd || '未設定'}</td>
                    </tr>
                    <tr>
                        <td><strong>支払日:</strong></td>
                        <td>${data.paymentDate || '未設定'}</td>
                    </tr>
                    <tr>
                        <td><strong>担当者:</strong></td>
                        <td>${data.staffName || '未設定'}</td>
                    </tr>
                    <tr>
                        <td><strong>支払方法:</strong></td>
                        <td>${data.paymentMethod || '未設定'}</td>
                    </tr>
                </table>
            </div>
            ${generateLineItemsHtml(data.lineItems)}
            <div class="result-section">
                <h3>処理状況</h3>
                <ul>
                    <li>✅ ファイル読み込み完了</li>
                    <li>✅ OCR処理完了</li>
                    <li>✅ データ抽出完了</li>
                    <li>✅ 明細行抽出完了</li>
                    <li>✅ 伝票タイトル候補抽出完了</li>
                </ul>
                <p><strong>信頼度:</strong> ${data.confidence}%</p>
            </div>
            <div class="result-section">
                <h3>OCR結果詳細</h3>
                <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px; max-height: 200px; overflow-y: auto;">${JSON.stringify(ocrResult, null, 2)}</pre>
            </div>
        `;
        
        popup.style.display = 'block';
        console.log('結果ポップアップを表示');
    }
}

// エラーポップアップを表示
function showErrorPopup(message) {
    const popup = document.getElementById('result-popup');
    const title = document.getElementById('result-title');
    const content = document.getElementById('result-content');
    
    if (popup && title && content) {
        title.textContent = 'エラー';
        
        content.innerHTML = `
            <div class="result-section">
                <h3>エラーが発生しました</h3>
                <p style="color: #d32f2f; background: #ffebee; padding: 12px; border-radius: 4px; border-left: 4px solid #d32f2f;">
                    ${message}
                </p>
            </div>
            <div class="result-section">
                <h3>対処方法</h3>
                <ul>
                    <li>ファイル形式を確認してください（PDF、JPEG、PNG）</li>
                    <li>ファイルサイズを確認してください（10MB以下）</li>
                    <li>画像の鮮明さを確認してください</li>
                    <li>再度お試しください</li>
                </ul>
            </div>
        `;
        
        popup.style.display = 'block';
        console.log('エラーポップアップを表示');
    }
}

// 結果ポップアップを非表示
function hideResultPopup() {
    const popup = document.getElementById('result-popup');
    if (popup) {
        popup.style.display = 'none';
        console.log('結果ポップアップを非表示');
    }
}



// 日付文字列をISO形式に変換
function convertToDateString(dateString) {
    try {
        // 既にISO形式の場合はそのまま返す
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }
        
        // 日本語の日付形式を処理
        const japaneseDatePattern = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/;
        const japaneseMatch = dateString.match(japaneseDatePattern);
        if (japaneseMatch) {
            const month = japaneseMatch[1].padStart(2, '0');
            const day = japaneseMatch[2].padStart(2, '0');
            let year = japaneseMatch[3];
            
            // 2桁の年の場合は20xx年として処理
            if (year.length === 2) {
                year = '20' + year;
            }
            
            return `${year}-${month}-${day}`;
        }
        
        // その他の日付形式を処理
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
        
        console.log('日付形式を認識できませんでした:', dateString);
        return null;
        
    } catch (error) {
        console.error('日付変換中にエラーが発生しました:', error);
        return null;
    }
}

// OCR結果からvendorAddressRecipientを抽出
function extractVendorAddressRecipientFromOCRResult(ocrResult) {
    try {
        const searchVendorAddressRecipient = (obj, currentPath = '') => {
            let vendorResult = null;
            let customerResult = null;
            
            const searchRecursive = (obj, currentPath = '') => {
                for (let key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        const value = obj[key];
                        const newPath = currentPath ? `${currentPath}.${key}` : key;
                        
                        if (key === 'vendorAddressRecipient' && value && value.valueText && typeof value.valueText === 'string' && value.valueText.trim()) {
                            const trimmedValue = value.valueText.trim();
                            console.log(`vendorAddressRecipient.valueTextを発見 (${newPath}):`, trimmedValue);
                            
                            // 「テレビ朝日」が含まれる場合は処理を継続（スキップ）
                            if (trimmedValue.includes('テレビ朝日')) {
                                console.log(`「テレビ朝日」が含まれるため、処理を継続: "${trimmedValue}"`);
                                continue;
                            }
                            
                            vendorResult = trimmedValue;
                        } else if (key === 'customerAddressRecipient' && value && value.valueText && typeof value.valueText === 'string' && value.valueText.trim()) {
                            const trimmedValue = value.valueText.trim();
                            console.log(`customerAddressRecipient.valueTextを発見 (${newPath}):`, trimmedValue);
                            
                            // 「テレビ朝日」が含まれる場合は処理を継続（スキップ）
                            if (trimmedValue.includes('テレビ朝日')) {
                                console.log(`「テレビ朝日」が含まれるため、処理を継続: "${trimmedValue}"`);
                                continue;
                            }
                            
                            customerResult = trimmedValue;
                        } else if (typeof value === 'object' && value !== null) {
                            searchRecursive(value, newPath);
                        } else if (Array.isArray(value)) {
                            for (let i = 0; i < value.length; i++) {
                                if (typeof value[i] === 'object' && value[i] !== null) {
                                    searchRecursive(value[i], `${newPath}[${i}]`);
                                }
                            }
                        }
                    }
                }
            };
            
            searchRecursive(obj, currentPath);
            
            // vendorAddressRecipientが存在する場合はそれを返す、存在しない場合はcustomerAddressRecipientを返す
            if (vendorResult) {
                console.log('vendorAddressRecipientを優先して返します:', vendorResult);
                return vendorResult;
            } else if (customerResult) {
                console.log('customerAddressRecipientを返します:', customerResult);
                return customerResult;
            }
            
            return null;
        };
        
        return searchVendorAddressRecipient(ocrResult);
        
    } catch (error) {
        console.error('vendorAddressRecipient抽出中にエラーが発生しました:', error);
        return null;
    }
}







// DOMContentLoadedイベントで初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeInvoiceScan();
});
