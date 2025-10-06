// @ts-check

/**
 * テスト用のデータフィクスチャ
 * 各テストで使用する共通のテストデータを定義
 */

// テスト用の担当者データ
const testStaffData = {
  valid: {
    id: 'TEST001',
    name: 'テスト太郎',
    department: 'テスト部'
  },
  invalid: {
    id: 'INVALID',
    name: '',
    department: ''
  }
};

// テスト用の相手先データ
const testPayeeData = {
  valid: {
    id: 'PAYEE001',
    name: 'テスト株式会社',
    registration: '1234567890123'
  },
  invalid: {
    id: 'INVALID',
    name: '',
    registration: ''
  }
};

// テスト用の伝票データ
const testSlipData = {
  valid: {
    registrationNumber: 'REG-2024-001',
    staffId: 'TEST001',
    payeeId: 'PAYEE001',
    invoiceNumber: 'INV-2024-001',
    slipTitle: 'テスト伝票',
    transactionDate: '2024-12-25',
    paymentAmount: 100000,
    taxAmount: 10000
  },
  invalid: {
    registrationNumber: '',
    staffId: '',
    payeeId: '',
    invoiceNumber: '',
    slipTitle: '',
    transactionDate: '',
    paymentAmount: 0,
    taxAmount: 0
  }
};

// テスト用の明細データ
const testDetailData = {
  program: {
    type: 'program',
    program: 'テスト番組',
    broadcastDate: '2024-12-25',
    account: '外注費',
    summary: 'テスト摘要',
    amount: 50000,
    taxCategory: '課仕10%',
    taxType: '外税',
    segment: 'テレビ放送事業'
  },
  project: {
    type: 'project',
    project: 'テストプロジェクト',
    projectDetail: 'テスト内訳',
    account: '外注費',
    summary: 'テスト摘要',
    amount: 75000,
    taxCategory: '課仕10%',
    taxType: '外税',
    segment: 'テレビ放送事業'
  },
  other: {
    type: 'other',
    department: 'テスト部',
    purpose: 'テスト目的',
    account: '接待費',
    summary: 'テスト摘要',
    amount: 25000,
    taxCategory: '課仕10%',
    taxType: '外税',
    segment: 'テレビ放送事業'
  }
};

// テスト用の検索条件データ
const testSearchData = {
  registrationNumber: 'REG-2024-001',
  staffId: 'TEST001',
  payeeName: 'テスト株式会社',
  dateFrom: '2024-12-01',
  dateTo: '2024-12-31',
  amountFrom: 1000,
  amountTo: 1000000
};

// テスト用のファイルデータ
const testFileData = {
  valid: {
    name: 'test-invoice.pdf',
    type: 'application/pdf',
    size: 1024 * 1024 // 1MB
  },
  invalid: {
    name: 'test-invoice.txt',
    type: 'text/plain',
    size: 1024 * 1024 // 1MB
  }
};

// テスト用の日付データ
const testDateData = {
  today: new Date().toISOString().split('T')[0],
  yesterday: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  tomorrow: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  lastMonth: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  nextMonth: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
};

// テスト用の金額データ
const testAmountData = {
  valid: [1000, 10000, 100000, 1000000],
  invalid: [-1000, 0, 'invalid', null, undefined],
  edge: [0.01, 999999999.99, 1000000000]
};

// テスト用の文字列データ
const testStringData = {
  valid: {
    short: 'テスト',
    medium: 'テストデータ',
    long: 'これは非常に長いテストデータです。文字数制限のテストに使用されます。',
    withSpecialChars: 'テスト@#$%^&*()_+{}|:"<>?[]\\;\',./',
    withNumbers: 'テスト123456789',
    withSpaces: 'テスト データ 文字列'
  },
  invalid: {
    empty: '',
    onlySpaces: '   ',
    onlyNumbers: '123456789',
    onlySpecialChars: '@#$%^&*()',
    tooLong: 'a'.repeat(1000)
  }
};

module.exports = {
  testStaffData,
  testPayeeData,
  testSlipData,
  testDetailData,
  testSearchData,
  testFileData,
  testDateData,
  testAmountData,
  testStringData
};

