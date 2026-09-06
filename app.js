/* ==========================================================================
   MONTHLY INCOME & EXPENSES INVENTORY - CORE JAVASCRIPT ENGINE v3
   ========================================================================== */

(function () {
  'use strict';

  // Default Initial Categories Definition
  const DEFAULT_CATEGORIES = {
    income: ['Salary', 'Freelance', 'Investments', 'Business', 'Gift', 'Other Income'],
    expense: [
      'Housing/Rent',
      'Utilities',
      'Groceries',
      'Transportation',
      'Entertainment',
      'Healthcare',
      'Subscriptions',
      'Dining Out',
      'Shopping',
      'Other Expense'
    ]
  };

  const DEFAULT_CATEGORY_ICONS = {
    'Salary': '💰',
    'Freelance': '💻',
    'Investments': '📈',
    'Business': '💼',
    'Gift': '🎁',
    'Other Income': '💵',
    'Housing/Rent': '🏠',
    'Utilities': '⚡',
    'Groceries': '🛒',
    'Transportation': '🚗',
    'Entertainment': '🎬',
    'Healthcare': '🏥',
    'Subscriptions': '📱',
    'Dining Out': '🍽️',
    'Shopping': '🛍️',
    'Other Expense': '📦'
  };

  const DEFAULT_BUDGET_LIMITS = {
    'Housing/Rent': 1500,
    'Groceries': 500,
    'Utilities': 250,
    'Dining Out': 200,
    'Transportation': 180,
    'Entertainment': 150,
    'Subscriptions': 50,
    'Shopping': 200,
    'Healthcare': 150,
    'Other Expense': 100
  };

  const DEFAULT_BANK_ACCOUNTS = [
    {
      id: 'acct_cash',
      type: 'cash',
      name: 'Physical Cash',
      institution: 'Cash On Hand',
      holder: 'John Smith',
      accountNumber: 'Cash',
      balance: 520.00,
      notes: 'Physical cash available'
    },
    {
      id: 'acct_primary_checking',
      type: 'bank',
      name: 'Primary Checking',
      institution: 'Chase',
      holder: 'John Smith',
      accountNumber: '9831',
      balance: 6420.75,
      notes: 'Main spending account'
    },
    {
      id: 'acct_high_yield',
      type: 'bank',
      name: 'High Yield Savings',
      institution: 'Ally',
      holder: 'John Smith',
      accountNumber: '5204',
      balance: 18250.00,
      notes: 'Emergency and savings reserve'
    },
    {
      id: 'acct_fixed_deposit',
      type: 'fixed_deposit',
      name: 'FD 12-Month',
      institution: 'HDFC',
      holder: 'John Smith',
      accountNumber: 'FD-2049',
      balance: 25000.00,
      notes: 'Locked deposit'
    },
    {
      id: 'acct_travel_card',
      type: 'web_card',
      name: 'Travel Card',
      institution: 'Visa',
      holder: 'John Smith',
      accountNumber: '4728',
      balance: 420.00,
      notes: 'Rewards and travel spending'
    }
  ];

  // State
  let state = {
    transactions: [],
    categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
    categoryIcons: { ...DEFAULT_CATEGORY_ICONS },
    budgetLimits: { ...DEFAULT_BUDGET_LIMITS },
    totalSpendingLimit: 0,
    bankAccounts: JSON.parse(JSON.stringify(DEFAULT_BANK_ACCOUNTS)),
    selectedMonth: getCurrentYearMonth(),
    dateRangeStart: '',
    dateRangeEnd: '',
    searchQuery: '',
    typeFilter: 'all',
    categoryFilter: 'all',
    sortField: 'date',
    sortDirection: 'desc',
    theme: 'light',
    activeCategoryTab: 'expense'
  };

  let categoryChartInstance = null;
  let assetChartInstance = null;

  // DOM Elements References
  const $ = (id) => document.getElementById(id);

  const monthPicker = $('monthPicker');
  const prevMonthBtn = $('prevMonthBtn');
  const nextMonthBtn = $('nextMonthBtn');
  const allTimeBtn = $('allTimeBtn');
  const dateRangeStart = $('dateRangeStart');
  const dateRangeEnd = $('dateRangeEnd');
  const clearDateRangeBtn = $('clearDateRangeBtn');

  const kpiIncome = $('kpiIncome');
  const kpiIncomeSub = $('kpiIncomeSub');
  const kpiExpense = $('kpiExpense');
  const kpiExpenseSub = $('kpiExpenseSub');
  const kpiBalance = $('kpiBalance');
  const kpiSavingsRate = $('kpiSavingsRate');
  const savingsRateFill = $('savingsRateFill');

  const transactionsTbody = $('transactionsTbody');
  const tableEmptyState = $('tableEmptyState');
  const recordCount = $('recordCount');
  const filteredTotals = $('filteredTotals');

  const searchInput = $('searchInput');
  const typeFilter = $('typeFilter');
  const categoryFilter = $('categoryFilter');

  const transactionModal = $('transactionModal');
  const transactionForm = $('transactionForm');
  const modalTitle = $('modalTitle');
  const txId = $('txId');
  const txAmount = $('txAmount');
  const txTitle = $('txTitle');
  const txCategory = $('txCategory');
  const txDate = $('txDate');
  const txMethod = $('txMethod');
  const txTransferFrom = $('txTransferFrom');
  const txTransferTo = $('txTransferTo');
  const txFrequency = $('txFrequency');
  const txNotes = $('txNotes');

  const budgetModal = $('budgetModal');
  const budgetForm = $('budgetForm');
  const budgetCategoryInputs = $('budgetCategoryInputs');
  const totalSpendingLimit = $('totalSpendingLimit');
  const budgetLimitStatus = $('budgetLimitStatus');
  const budgetProgressList = $('budgetProgressList');

  const categoryModal = $('categoryModal');
  const categorySettingsBtn = $('categorySettingsBtn');
  const closeCategoryModalBtn = $('closeCategoryModalBtn');
  const closeCategoryModalFooterBtn = $('closeCategoryModalFooterBtn');
  const catTabExpense = $('catTabExpense');
  const catTabIncome = $('catTabIncome');
  const addCategoryForm = $('addCategoryForm');
  const newCatIcon = $('newCatIcon');
  const newCatName = $('newCatName');
  const categoryItemsList = $('categoryItemsList');

  const bankAccountModal = $('bankAccountModal');
  const bankAccountsBtn = $('bankAccountsBtn');
  const closeBankAccountModalBtn = $('closeBankAccountModalBtn');
  const cancelBankAccountBtn = $('cancelBankAccountBtn');
  const bankAccountForm = $('bankAccountForm');
  const bankAccountId = $('bankAccountId');
  const bankAccountType = $('bankAccountType');
  const bankAccountName = $('bankAccountName');
  const bankAccountInstitution = $('bankAccountInstitution');
  const bankAccountHolder = $('bankAccountHolder');
  const bankAccountNumber = $('bankAccountNumber');
  const bankAccountBalance = $('bankAccountBalance');
  const bankAccountMaxSpend = $('bankAccountMaxSpend');
  const bankAccountDefault = $('bankAccountDefault');
  const bankAccountNotes = $('bankAccountNotes');
  const bankAccountList = $('bankAccountList');

  const themeToggleBtn = $('themeToggleBtn');
  const moreActionsBtn = $('moreActionsBtn');
  const dataDropdownMenu = $('dataDropdownMenu');

  // Helper Functions
  function getCurrentYearMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  function getCurrentDateTimeLocalValue() {
    const now = new Date();
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    return localDate.toISOString().slice(0, 16);
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  }

  function normalizeDateValue(dateStr) {
    if (!dateStr) return '';
    const raw = String(dateStr).trim();
    const datePart = raw.includes('T') ? raw.split('T')[0] : raw;
    return datePart.slice(0, 10);
  }

  function formatDateDisplay(dateStr) {
    const normalized = normalizeDateValue(dateStr);
    if (!normalized) return '';
    const [year, month, day] = normalized.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    if (Number.isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function generateUniqueId() {
    return 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  function getCategoryIcon(catName) {
    return state.categoryIcons[catName] || '🏷️';
  }

  function getBankAccountTypeMeta(type) {
    const map = {
      cash: { label: 'Cash', icon: '💵' },
      bank: { label: 'Bank Account', icon: '🏦' },
      fixed_deposit: { label: 'Fixed Deposit', icon: '💰' },
      web_card: { label: 'Web Card', icon: '💳' }
    };
    return map[type] || { label: 'Account', icon: '🏦' };
  }

  function getDefaultPaymentAccount() {
    if (!state.bankAccounts || state.bankAccounts.length === 0) {
      return null;
    }

    const explicitDefault = state.bankAccounts.find(account => account && (account.isDefaultAccount === true || account.defaultAccount === true));
    if (explicitDefault) {
      return explicitDefault;
    }

    const salaryAccount = state.bankAccounts.find(account => {
      const name = (account && account.name ? account.name : '').toLowerCase();
      return name.includes('salary') || name.includes('sal account') || name.includes('sal');
    });

    return salaryAccount || state.bankAccounts[0];
  }

  function getPaymentMethodLabel(methodValue) {
    if (!methodValue) return 'Cash';
    if (String(methodValue).startsWith('account:')) {
      const accountId = String(methodValue).replace('account:', '');
      const account = state.bankAccounts.find(item => item.id === accountId);
      if (account) {
        const meta = getBankAccountTypeMeta(account.type);
        return `${meta.icon} ${account.name} (${meta.label})`;
      }
      return 'Bank Account';
    }
    if (String(methodValue).startsWith('transfer:')) {
      const parts = String(methodValue).split(':');
      if (parts.length >= 3) {
        const fromAccount = state.bankAccounts.find(item => item.id === parts[1]);
        const toAccount = state.bankAccounts.find(item => item.id === parts[2]);
        const fromLabel = fromAccount ? `${getBankAccountTypeMeta(fromAccount.type).icon} ${fromAccount.name}` : 'From account';
        const toLabel = toAccount ? `${getBankAccountTypeMeta(toAccount.type).icon} ${toAccount.name}` : 'To account';
        return `🔁 ${fromLabel} → ${toLabel}`;
      }
      return 'Inter-bank transfer';
    }
    return methodValue;
  }

  function updateBankAccountBalanceForTransaction(tx, direction = 1) {
    if (!tx || !tx.method) {
      return;
    }

    if (String(tx.method).startsWith('transfer:')) {
      const parts = String(tx.method).split(':');
      const fromAccountId = parts[1];
      const toAccountId = parts[2];
      const amount = Number(tx.amount) || 0;

      if (fromAccountId) {
        const fromAccount = state.bankAccounts.find(item => item.id === fromAccountId);
        if (fromAccount) {
          fromAccount.balance = Number((Number(fromAccount.balance) || 0) - (amount * direction));
        }
      }

      if (toAccountId) {
        const toAccount = state.bankAccounts.find(item => item.id === toAccountId);
        if (toAccount) {
          toAccount.balance = Number((Number(toAccount.balance) || 0) + (amount * direction));
        }
      }
      return;
    }

    if (!String(tx.method).startsWith('account:')) {
      return;
    }

    const accountId = String(tx.method).replace('account:', '');
    const account = state.bankAccounts.find(item => item.id === accountId);
    if (!account) {
      return;
    }

    const amount = Number(tx.amount) || 0;
    const delta = tx.type === 'income' ? amount : -amount;
    account.balance = Number((Number(account.balance) || 0) + (delta * direction));
  }

  function renderTransferOptions() {
    if (!txTransferFrom || !txTransferTo) return;

    txTransferFrom.innerHTML = '';
    txTransferTo.innerHTML = '';

    if (state.bankAccounts.length === 0) {
      const emptyOption = document.createElement('option');
      emptyOption.value = '';
      emptyOption.textContent = 'No accounts saved';
      emptyOption.disabled = true;
      txTransferFrom.appendChild(emptyOption.cloneNode(true));
      txTransferTo.appendChild(emptyOption.cloneNode(true));
      return;
    }

    state.bankAccounts.forEach(account => {
      const meta = getBankAccountTypeMeta(account.type);
      const optionFrom = document.createElement('option');
      const optionTo = document.createElement('option');
      optionFrom.value = account.id;
      optionTo.value = account.id;
      optionFrom.textContent = `${meta.icon} ${account.name} (${meta.label})`;
      optionTo.textContent = `${meta.icon} ${account.name} (${meta.label})`;
      txTransferFrom.appendChild(optionFrom);
      txTransferTo.appendChild(optionTo);
    });

    if (state.bankAccounts.length > 1) {
      txTransferFrom.value = state.bankAccounts[0].id;
      txTransferTo.value = state.bankAccounts[1].id;
    } else {
      txTransferFrom.value = state.bankAccounts[0].id;
      txTransferTo.value = state.bankAccounts[0].id;
    }
  }

  function renderPaymentMethodOptions() {
    const previousValue = txMethod.value || '';
    txMethod.innerHTML = '';

    const transferOption = document.createElement('option');
    transferOption.value = 'inter_account_transfer';
    transferOption.textContent = 'Inter-bank transfer';
    txMethod.appendChild(transferOption);

    if (state.bankAccounts.length > 0) {
      const accountGroup = document.createElement('optgroup');
      accountGroup.label = 'Bank Accounts & Cards';

      state.bankAccounts.forEach(account => {
        const meta = getBankAccountTypeMeta(account.type);
        const option = document.createElement('option');
        option.value = `account:${account.id}`;
        option.textContent = `${meta.icon} ${account.name} (${meta.label})`;
        accountGroup.appendChild(option);
      });

      txMethod.appendChild(accountGroup);
    } else {
      const emptyOption = document.createElement('option');
      emptyOption.value = '';
      emptyOption.textContent = 'No bank account or card saved';
      emptyOption.disabled = true;
      txMethod.appendChild(emptyOption);
    }

    const defaultAccount = getDefaultPaymentAccount();
    const fallbackValue = defaultAccount ? `account:${defaultAccount.id}` : '';
    const preferredValue = previousValue === 'inter_account_transfer' || !previousValue ? fallbackValue : previousValue;

    if (Array.from(txMethod.options).some(option => option.value === preferredValue)) {
      txMethod.value = preferredValue;
    } else if (state.bankAccounts.length > 0) {
      txMethod.value = fallbackValue;
    } else {
      txMethod.value = '';
    }

    renderTransferOptions();

    const transferRow = document.getElementById('transferRow');
    if (transferRow) {
      transferRow.style.display = txMethod.value === 'inter_account_transfer' ? 'flex' : 'none';
    }
  }

  // Storage Operations
  function showSaveAnimation(message = 'Saved', tone = 'success') {
    const toast = document.getElementById('saveToast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.remove('success', 'warning', 'danger', 'show');
    toast.classList.add(tone);
    void toast.offsetWidth;
    toast.classList.add('show');

    clearTimeout(toast.hideTimer);
    toast.hideTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 1600);
  }

  function saveState() {
    try {
      localStorage.setItem('budget_inventory_data', JSON.stringify({
        transactions: state.transactions,
        categories: state.categories,
        categoryIcons: state.categoryIcons,
        budgetLimits: state.budgetLimits,
        totalSpendingLimit: state.totalSpendingLimit,
        bankAccounts: state.bankAccounts,
        theme: state.theme
      }));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  function loadState() {
    try {
      const saved = localStorage.getItem('budget_inventory_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        const defaultAccountNames = new Set(DEFAULT_BANK_ACCOUNTS.map(account => account.name));
        const defaultAccountIds = new Set(DEFAULT_BANK_ACCOUNTS.map(account => account.id));

        state.transactions = parsed.transactions || [];
        state.categories = parsed.categories || JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
        state.categoryIcons = parsed.categoryIcons || { ...DEFAULT_CATEGORY_ICONS };
        state.budgetLimits = parsed.budgetLimits || { ...DEFAULT_BUDGET_LIMITS };
        state.totalSpendingLimit = Number(parsed.totalSpendingLimit) || 0;
        state.bankAccounts = Array.isArray(parsed.bankAccounts)
          ? parsed.bankAccounts.filter(account => {
              if (!account || typeof account !== 'object') return false;
              return !defaultAccountIds.has(account.id) && !defaultAccountNames.has(account.name);
            })
          : [];
        state.theme = parsed.theme || 'light';
      } else {
        loadSampleData(false);
      }
    } catch (e) {
      console.error('Failed to load state', e);
      loadSampleData(false);
    }
    applyTheme(state.theme);
  }

  function loadSampleData(shouldSave = true) {
    const currentYM = getCurrentYearMonth();
    const [year, month] = currentYM.split('-');
    
    state.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
    state.categoryIcons = { ...DEFAULT_CATEGORY_ICONS };
    state.budgetLimits = { ...DEFAULT_BUDGET_LIMITS };
    state.bankAccounts = JSON.parse(JSON.stringify(DEFAULT_BANK_ACCOUNTS));

    state.transactions = [
      {
        id: generateUniqueId(),
        type: 'income',
        title: 'Monthly Salary',
        amount: 4500.00,
        category: 'Salary',
        date: `${year}-${month}-01`,
        method: 'Bank Transfer',
        frequency: 'Monthly',
        notes: 'Main employment direct deposit'
      },
      {
        id: generateUniqueId(),
        type: 'income',
        title: 'Freelance Web Design Project',
        amount: 850.00,
        category: 'Freelance',
        date: `${year}-${month}-12`,
        method: 'PayPal',
        frequency: 'One-time',
        notes: 'Website UI redesign invoice #104'
      },
      {
        id: generateUniqueId(),
        type: 'income',
        title: 'Stock Dividend Payment',
        amount: 140.00,
        category: 'Investments',
        date: `${year}-${month}-15`,
        method: 'Bank Transfer',
        frequency: 'One-time',
        notes: 'Quarterly payout'
      },
      {
        id: generateUniqueId(),
        type: 'expense',
        title: 'Apartment Monthly Rent',
        amount: 1450.00,
        category: 'Housing/Rent',
        date: `${year}-${month}-02`,
        method: 'Bank Transfer',
        frequency: 'Monthly',
        notes: 'Lease unit #402'
      },
      {
        id: generateUniqueId(),
        type: 'expense',
        title: 'Supermarket Grocery Shopping',
        amount: 185.40,
        category: 'Groceries',
        date: `${year}-${month}-05`,
        method: 'Credit Card',
        frequency: 'One-time',
        notes: 'Weekly pantry stock'
      },
      {
        id: generateUniqueId(),
        type: 'expense',
        title: 'Electricity & Gas Bill',
        amount: 135.20,
        category: 'Utilities',
        date: `${year}-${month}-08`,
        method: 'Debit Card',
        frequency: 'Monthly',
        notes: 'City Utility Power Co.'
      },
      {
        id: generateUniqueId(),
        type: 'expense',
        title: 'Weekend Dining with Friends',
        amount: 92.50,
        category: 'Dining Out',
        date: `${year}-${month}-14`,
        method: 'Credit Card',
        frequency: 'One-time',
        notes: 'Italian Bistro'
      },
      {
        id: generateUniqueId(),
        type: 'expense',
        title: 'Gasoline & Parking',
        amount: 65.00,
        category: 'Transportation',
        date: `${year}-${month}-18`,
        method: 'Credit Card',
        frequency: 'One-time',
        notes: 'Fuel refill'
      },
      {
        id: generateUniqueId(),
        type: 'expense',
        title: 'Netflix & Spotify Subscriptions',
        amount: 28.98,
        category: 'Subscriptions',
        date: `${year}-${month}-20`,
        method: 'Credit Card',
        frequency: 'Monthly',
        notes: 'Monthly digital services'
      },
      {
        id: generateUniqueId(),
        type: 'expense',
        title: 'Mid-Month Grocery Shopping',
        amount: 162.10,
        category: 'Groceries',
        date: `${year}-${month}-22`,
        method: 'Credit Card',
        frequency: 'One-time',
        notes: 'Fresh produce & organic supplies'
      }
    ];

    if (shouldSave) {
      saveState();
    }
  }

  // Theme Management
  function applyTheme(newTheme) {
    state.theme = newTheme;
    document.documentElement.setAttribute('data-theme', newTheme);
    saveState();
    renderChart();
  }

  function toggleTheme() {
    applyTheme(state.theme === 'light' ? 'dark' : 'light');
  }

  // Dynamic Categories Dropdown Populator
  function populateCategoryDropdowns() {
    const selectedCategory = state.categoryFilter;
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    const allCategories = [
      ...(state.categories.income || []),
      ...(state.categories.expense || [])
    ];

    allCategories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = `${getCategoryIcon(cat)} ${cat}`;
      categoryFilter.appendChild(opt);
    });

    categoryFilter.value = Array.from(categoryFilter.options).some(option => option.value === selectedCategory)
      ? selectedCategory
      : 'all';

    updateModalCategoryOptions();
  }

  function updateModalCategoryOptions() {
    const selectedType = document.querySelector('input[name="txType"]:checked')?.value || 'expense';
    txCategory.innerHTML = '';
    
    const options = state.categories[selectedType] || [];
    options.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = `${getCategoryIcon(cat)} ${cat}`;
      txCategory.appendChild(opt);
    });
  }

  // Filter & Data Computations
  function getFilteredTransactions() {
    return state.transactions.filter(tx => {
      // Date Range Filter takes priority when selected
      if (state.dateRangeStart || state.dateRangeEnd) {
        const txDate = normalizeDateValue(tx.date);
        if (state.dateRangeStart && txDate < state.dateRangeStart) {
          return false;
        }
        if (state.dateRangeEnd && txDate > state.dateRangeEnd) {
          return false;
        }
      } else if (state.selectedMonth !== 'all') {
        if (!normalizeDateValue(tx.date).startsWith(state.selectedMonth)) {
          return false;
        }
      }

      // Type Filter
      if (state.typeFilter !== 'all' && tx.type !== state.typeFilter) {
        return false;
      }

      // Category Filter
      if (state.categoryFilter !== 'all' && tx.category !== state.categoryFilter) {
        return false;
      }

      // Search Query
      if (state.searchQuery.trim() !== '') {
        const query = state.searchQuery.toLowerCase();
        const titleMatch = tx.title.toLowerCase().includes(query);
        const categoryMatch = tx.category.toLowerCase().includes(query);
        const notesMatch = (tx.notes || '').toLowerCase().includes(query);
        const amountMatch = tx.amount.toString().includes(query);
        if (!titleMatch && !categoryMatch && !notesMatch && !amountMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      let valA = a[state.sortField];
      let valB = b[state.sortField];

      if (state.sortField === 'amount') {
        valA = Number(valA);
        valB = Number(valB);
      }

      if (valA < valB) return state.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return state.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // UI Render Engine
  function renderApp() {
    if (state.dateRangeStart || state.dateRangeEnd) {
      monthPicker.value = '';
      allTimeBtn.classList.add('btn-primary');
      allTimeBtn.classList.remove('btn-secondary');
    } else if (state.selectedMonth === 'all') {
      monthPicker.value = '';
      allTimeBtn.classList.add('btn-primary');
      allTimeBtn.classList.remove('btn-secondary');
    } else {
      monthPicker.value = state.selectedMonth;
      allTimeBtn.classList.remove('btn-primary');
      allTimeBtn.classList.add('btn-secondary');
    }

    dateRangeStart.value = state.dateRangeStart || '';
    dateRangeEnd.value = state.dateRangeEnd || '';

    populateCategoryDropdowns();

    const filtered = getFilteredTransactions();
    
    renderKPIs(filtered);
    renderTable(filtered);
    renderBudgets();
    renderChart();
  }

  function renderKPIs(filteredList) {
    let incomeTotal = 0;
    let incomeCount = 0;
    let expenseTotal = 0;
    let expenseCount = 0;

    filteredList.forEach(tx => {
      if (tx.type === 'income') {
        incomeTotal += Number(tx.amount);
        incomeCount++;
      } else if (tx.type === 'expense') {
        expenseTotal += Number(tx.amount);
        expenseCount++;
      }
      // Transfers are tracked through account balances and should not affect income/expense totals.
    });

    const bankAccounts = state.bankAccounts || [];
    const bankAccountTotal = bankAccounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);
    const totalAvailableSpending = bankAccounts.reduce((sum, account) => {
      const maxSpend = Number(account.maxSpendingLimit || 0);
      if (maxSpend <= 0) return sum;
      const accountExpenses = (state.transactions || [])
        .filter(tx => tx.method === `account:${account.id}` && tx.type === 'expense')
        .reduce((expenseSum, tx) => expenseSum + Number(tx.amount || 0), 0);
      return sum + Math.max(0, maxSpend - accountExpenses);
    }, 0);

    const netBalance = incomeTotal - expenseTotal;
    const savingsRate = incomeTotal > 0 ? ((incomeTotal - expenseTotal) / incomeTotal) * 100 : 0;
    const boundedSavingsRate = Math.max(-100, Math.min(100, savingsRate));
    const bankSavingsTotal = bankAccounts.filter(account => account.type === 'bank').reduce((sum, account) => sum + Number(account.balance || 0), 0);
    const cashTotal = bankAccounts.filter(account => account.type === 'cash').reduce((sum, account) => sum + Number(account.balance || 0), 0);
    const webCardTotal = bankAccounts.filter(account => account.type === 'web_card').reduce((sum, account) => sum + Number(account.balance || 0), 0);
    const fixedDepositTotal = bankAccounts.filter(account => account.type === 'fixed_deposit').reduce((sum, account) => sum + Number(account.balance || 0), 0);
    const summaryTotal = bankSavingsTotal + cashTotal + fixedDepositTotal + webCardTotal;
    const assetChartData = [
      { label: 'Savings', value: bankSavingsTotal, color: '#10b981' },
      { label: 'Physical Cash', value: cashTotal, color: '#22c55e' },
      { label: 'Web Cards', value: webCardTotal, color: '#6366f1' },
      { label: 'Fixed Deposits', value: fixedDepositTotal, color: '#f59e0b' }
    ].filter(item => item.value > 0);

    kpiIncome.textContent = formatCurrency(bankAccountTotal);
    kpiIncomeSub.innerHTML = bankAccounts.length
      ? `
        <div class="bank-kpi-summary">
          <span>Total available</span>
          <strong>${formatCurrency(totalAvailableSpending)}</strong>
        </div>
        ${[
          { key: 'bank', label: 'Bank Accounts', icon: '🏦', className: 'bank-group' },
          { key: 'fixed_deposit', label: 'Fixed Deposits', icon: '📈', className: 'fixed-group' },
          { key: 'web_card', label: 'Web Cards', icon: '💳', className: 'card-group' },
          { key: 'cash', label: 'Physical Cash', icon: '💵', className: 'cash-group' }
        ].map(group => {
          const groupAccounts = bankAccounts.filter(account => account.type === group.key);
          if (!groupAccounts.length) return '';

          return `
            <div class="bank-kpi-group">
              <div class="bank-kpi-group-title ${group.className}">${group.icon} ${group.label}</div>
              ${groupAccounts.map(account => {
                const typeMeta = getBankAccountTypeMeta(account.type);
                const maxSpend = Number(account.maxSpendingLimit || 0);
                const accountExpenses = (state.transactions || [])
                  .filter(tx => tx.method === `account:${account.id}` && tx.type === 'expense')
                  .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
                const availableSpend = maxSpend > 0 ? Math.max(0, maxSpend - accountExpenses) : 0;
                const availablePercent = maxSpend > 0 ? Math.min(100, (availableSpend / maxSpend) * 100) : 0;
                const barColor = availableSpend <= 0 ? '#ef4444' : availablePercent < 25 ? '#f59e0b' : '#10b981';
                return `
                  <div class="bank-kpi-row">
                    <div class="bank-kpi-main">
                      <span>${typeMeta.icon} ${escapeHtml(account.name)}</span>
                      <strong>${formatCurrency(Number(account.balance || 0))}</strong>
                    </div>
                    <div class="bank-kpi-limit">
                      <div class="bank-kpi-limit-meta">
                        <span>Available</span>
                        <strong>${formatCurrency(availableSpend)}</strong>
                      </div>
                      <div class="bank-kpi-limit-bar">
                        <div class="bank-kpi-limit-fill" style="width:${maxSpend > 0 ? availablePercent : 0}%; background:${barColor};"></div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }).join('')}
      `
      : 'No bank accounts added';

    kpiExpense.textContent = formatCurrency(expenseTotal);
    kpiExpenseSub.textContent = `${expenseCount} transaction${expenseCount === 1 ? '' : 's'}`;

    kpiBalance.textContent = Number(summaryTotal).toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    kpiBalance.style.display = 'none';

    renderAssetSummaryChart(assetChartData);

    kpiSavingsRate.textContent = `${boundedSavingsRate.toFixed(1)}%`;
    savingsRateFill.style.width = `${Math.max(0, Math.abs(boundedSavingsRate))}%`;

    recordCount.textContent = `Showing ${filteredList.length} entri${filteredList.length === 1 ? 'y' : 'es'}`;
    filteredTotals.textContent = `Net: ${formatCurrency(netBalance)}`;
  }

  function renderAssetSummaryChart(assetChartData) {
    const chartContainer = document.getElementById('assetBreakdownChart');
    if (!chartContainer) return;

    if (!assetChartData.length) {
      chartContainer.innerHTML = '<div class="bullet-row"><span class="bullet-label">No data</span></div>';
      return;
    }

    const totalValue = assetChartData.reduce((sum, item) => sum + item.value, 0) || 1;
    const exactPercentages = assetChartData.map(item => (item.value / totalValue) * 100);
    const displayPercentages = exactPercentages.map(value => Number(value.toFixed(1)));

    if (displayPercentages.length > 1) {
      const lastIndex = displayPercentages.length - 1;
      const sumOfPrevious = displayPercentages.slice(0, -1).reduce((sum, value) => sum + value, 0);
      displayPercentages[lastIndex] = Number((100 - sumOfPrevious).toFixed(1));
    }

    chartContainer.innerHTML = assetChartData.map((item, index) => {
      const width = (item.value / totalValue) * 100;
      const percent = displayPercentages[index];
      return `
        <div class="bullet-row">
          <span class="bullet-label"><span>${item.label.charAt(0)}</span> ${escapeHtml(item.label)}</span>
          <div class="bullet-bar-track">
            <div class="bullet-bar-fill" style="width: ${width}%; background: ${item.color};"></div>
          </div>
          <span class="bullet-value">${percent.toFixed(1)}%</span>
        </div>
      `;
    }).join('');
  }

  function renderTable(filteredList) {
    transactionsTbody.innerHTML = '';

    if (filteredList.length === 0) {
      tableEmptyState.style.display = 'block';
      return;
    }

    tableEmptyState.style.display = 'none';

    filteredList.forEach(tx => {
      const tr = document.createElement('tr');

      const isIncome = tx.type === 'income';
      const isTransfer = tx.type === 'transfer';
      const amountClass = isTransfer ? 'amount-transfer' : isIncome ? 'amount-income' : 'amount-expense';
      const amountPrefix = isIncome ? '+' : isTransfer ? '↔ ' : '-';
      const typeLabel = tx.type === 'transfer' ? 'Inter-bank transfer' : tx.type;

      tr.innerHTML = `
        <td>${formatDateDisplay(tx.date)}</td>
        <td>
          <strong>${escapeHtml(tx.title)}</strong>
          ${tx.notes ? `<div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(tx.notes)}</div>` : ''}
        </td>
        <td>
          <span class="category-tag">
            <span class="cat-emoji-badge">${getCategoryIcon(tx.category)}</span>
            ${escapeHtml(tx.category)}
          </span>
        </td>
        <td>${escapeHtml(getPaymentMethodLabel(tx.method || 'Cash'))}</td>
        <td>
          <span class="type-badge ${tx.type}">${typeLabel}</span>
        </td>
        <td class="text-right ${amountClass}">${amountPrefix}${formatCurrency(Number(tx.amount))}</td>
        <td class="text-center">
          <button class="btn-action-icon edit-tx" data-id="${tx.id}" title="Edit Transaction">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn-action-icon copy-tx" data-id="${tx.id}" title="Duplicate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
          <button class="btn-action-icon delete-tx delete" data-id="${tx.id}" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      `;

      transactionsTbody.appendChild(tr);
    });

    document.querySelectorAll('.edit-tx').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });
    document.querySelectorAll('.copy-tx').forEach(btn => {
      btn.addEventListener('click', () => duplicateTransaction(btn.dataset.id));
    });
    document.querySelectorAll('.delete-tx').forEach(btn => {
      btn.addEventListener('click', () => deleteTransaction(btn.dataset.id));
    });
  }

  function renderBudgets() {
    budgetProgressList.innerHTML = '';

    const categoryTotals = {};
    state.transactions.forEach(tx => {
      if (tx.type === 'expense') {
        const txDate = normalizeDateValue(tx.date);
        if (state.selectedMonth === 'all' || txDate.startsWith(state.selectedMonth)) {
          categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + Number(tx.amount);
        }
      }
    });

    const expenseCategories = state.categories.expense || [];

    if (expenseCategories.length === 0) {
      budgetProgressList.innerHTML = '<div style="font-size:0.85rem; color:var(--text-muted); text-align:center;">No expense categories defined.</div>';
      return;
    }

    expenseCategories.forEach(cat => {
      const limit = Number(state.budgetLimits[cat] || 0);
      if (limit <= 0) return;

      const spent = categoryTotals[cat] || 0;
      const percent = Math.min(100, Math.round((spent / limit) * 100));

      let statusClass = '';
      if (percent >= 100) statusClass = 'danger';
      else if (percent >= 75) statusClass = 'warning';

      const item = document.createElement('div');
      item.className = 'budget-item';
      item.innerHTML = `
        <div class="budget-item-header">
          <span><span class="cat-emoji-badge">${getCategoryIcon(cat)}</span> ${escapeHtml(cat)}</span>
          <span>${formatCurrency(spent)} / ${formatCurrency(limit)} (${percent}%)</span>
        </div>
        <div class="budget-bar">
          <div class="budget-bar-fill ${statusClass}" style="width: ${percent}%"></div>
        </div>
      `;
      budgetProgressList.appendChild(item);
    });
  }

  function renderChart() {
    const canvas = $('categoryChart');
    const emptyState = $('chartEmptyState');
    const badge = $('expenseCatCount');

    if (!canvas) return;

    const categoryTotals = {};
    state.transactions.forEach(tx => {
      if (tx.type === 'expense') {
        const txDate = normalizeDateValue(tx.date);
        if (state.selectedMonth === 'all' || txDate.startsWith(state.selectedMonth)) {
          categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + Number(tx.amount);
        }
      }
    });

    const rawLabels = Object.keys(categoryTotals);
    const chartLabels = rawLabels.map(l => `${getCategoryIcon(l)} ${l}`);
    const dataValues = Object.values(categoryTotals);

    badge.textContent = `${rawLabels.length} Categor${rawLabels.length === 1 ? 'y' : 'ies'}`;

    if (rawLabels.length === 0) {
      canvas.style.display = 'none';
      emptyState.style.display = 'flex';
      if (categoryChartInstance) {
        categoryChartInstance.destroy();
        categoryChartInstance = null;
      }
      return;
    }

    canvas.style.display = 'block';
    emptyState.style.display = 'none';

    const bgColors = rawLabels.map(l => getCategoryColor(l));

    if (typeof Chart !== 'undefined') {
      if (categoryChartInstance) {
        categoryChartInstance.destroy();
      }

      const isDark = state.theme === 'dark';
      const textColor = isDark ? '#f8fafc' : '#0f172a';

      categoryChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: chartLabels,
          datasets: [{
            data: dataValues,
            backgroundColor: bgColors,
            borderWidth: 2,
            borderColor: isDark ? '#1e293b' : '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: textColor,
                font: { size: 11 },
                boxWidth: 12
              }
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const val = context.parsed || 0;
                  return ` ${context.label}: ${formatCurrency(val)}`;
                }
              }
            }
          },
          cutout: '65%'
        }
      });
    }
  }

  function getCategoryColor(cat) {
    const palette = [
      '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6',
      '#8b5cf6', '#14b8a6', '#f43f5e', '#84cc16', '#a855f7',
      '#06b6d4', '#eab308'
    ];
    let hash = 0;
    for (let i = 0; i < cat.length; i++) {
      hash = cat.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % palette.length;
    return palette[index];
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Category Settings Modal Operations (Create, Modify, Delete)
  function openCategoryModal() {
    renderCategoryModal();
    categoryModal.showModal();
  }

  function renderCategoryModal() {
    if (state.activeCategoryTab === 'expense') {
      catTabExpense.classList.add('active');
      catTabIncome.classList.remove('active');
    } else {
      catTabIncome.classList.add('active');
      catTabExpense.classList.remove('active');
    }

    const type = state.activeCategoryTab;
    const catList = state.categories[type] || [];

    categoryItemsList.innerHTML = '';

    if (catList.length === 0) {
      categoryItemsList.innerHTML = '<div style="font-size:0.85rem; color:var(--text-muted); text-align:center; padding:1rem;">No categories created yet.</div>';
      return;
    }

    catList.forEach((catName) => {
      const row = document.createElement('div');
      row.className = 'cat-item-row';
      row.dataset.catName = catName;

      row.innerHTML = `
        <div class="cat-name-badge">
          <span class="cat-emoji-badge">${getCategoryIcon(catName)}</span>
          <span class="cat-label">${escapeHtml(catName)}</span>
        </div>
        <div class="cat-actions">
          <button class="btn-action-icon edit-cat" title="Modify Category Name & Icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn-action-icon delete-cat delete" title="Delete Category">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `;

      row.querySelector('.edit-cat').addEventListener('click', () => {
        startInlineEditCategory(row, type, catName);
      });

      row.querySelector('.delete-cat').addEventListener('click', () => {
        deleteCategory(type, catName);
      });

      categoryItemsList.appendChild(row);
    });
  }

  function startInlineEditCategory(row, type, oldName) {
    const currentIcon = getCategoryIcon(oldName);
    
    row.innerHTML = `
      <form class="cat-edit-group flex-1">
        <input type="text" class="form-control btn-sm cat-icon-input" style="width:45px; text-align:center;" value="${escapeHtml(currentIcon)}" title="Category Icon Emoji">
        <input type="text" class="form-control btn-sm cat-edit-input" value="${escapeHtml(oldName)}" required>
        <button type="submit" class="btn btn-primary btn-sm">Save</button>
        <button type="button" class="btn btn-secondary btn-sm cancel-edit-cat">Cancel</button>
      </form>
    `;

    const editForm = row.querySelector('.cat-edit-group');
    const iconInput = row.querySelector('.cat-icon-input');
    const editInput = row.querySelector('.cat-edit-input');
    editInput.focus();

    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = editInput.value.trim();
      const newIcon = iconInput.value.trim() || '🏷️';
      if (newName) {
        modifyCategoryNameAndIcon(type, oldName, newName, newIcon);
      } else {
        renderCategoryModal();
      }
    });

    row.querySelector('.cancel-edit-cat').addEventListener('click', () => {
      renderCategoryModal();
    });
  }

  function modifyCategoryNameAndIcon(type, oldName, newName, newIcon) {
    const list = state.categories[type];
    
    if (newName !== oldName && list.includes(newName)) {
      alert(`Category "${newName}" already exists in ${type} categories.`);
      return;
    }

    const index = list.indexOf(oldName);
    if (index !== -1) {
      list[index] = newName;
    }

    if (oldName !== newName) {
      delete state.categoryIcons[oldName];
    }
    state.categoryIcons[newName] = newIcon;

    if (oldName !== newName) {
      state.transactions.forEach(tx => {
        if (tx.type === type && tx.category === oldName) {
          tx.category = newName;
        }
      });

      if (type === 'expense' && state.budgetLimits[oldName] !== undefined) {
        state.budgetLimits[newName] = state.budgetLimits[oldName];
        delete state.budgetLimits[oldName];
      }
    }

    saveState();
    renderCategoryModal();
    renderApp();
    showSaveAnimation('Category updated', 'warning');
  }

  function deleteCategory(type, catName) {
    const list = state.categories[type];
    if (list.length <= 1) {
      alert(`Cannot delete the last remaining ${type} category.`);
      return;
    }

    const matchingTxs = state.transactions.filter(tx => tx.type === type && tx.category === catName);
    const fallbackCategory = type === 'expense' ? 'Other Expense' : 'Other Income';

    if (matchingTxs.length > 0) {
      const confirmMsg = `Warning: ${matchingTxs.length} transaction(s) currently use category "${catName}".\n\nDeleting this category will reassign those transactions to "${fallbackCategory}". Continue?`;
      if (!confirm(confirmMsg)) {
        return;
      }

      state.transactions.forEach(tx => {
        if (tx.type === type && tx.category === catName) {
          tx.category = fallbackCategory;
        }
      });
    }

    state.categories[type] = list.filter(c => c !== catName);
    delete state.categoryIcons[catName];

    if (type === 'expense') {
      delete state.budgetLimits[catName];
    }

    saveState();
    renderCategoryModal();
    renderApp();
    showSaveAnimation('Category deleted', 'danger');
  }

  // Modal Controllers
  function openAddModal() {
    modalTitle.textContent = 'Add New Transaction';
    txId.value = '';
    transactionForm.reset();
    
    txDate.value = getCurrentDateTimeLocalValue();
    
    const expenseRadio = document.querySelector('input[name="txType"][value="expense"]');
    if (expenseRadio) expenseRadio.checked = true;
    
    updateModalCategoryOptions();
    renderPaymentMethodOptions();
    transactionModal.showModal();
  }

  function openEditModal(id) {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;

    modalTitle.textContent = 'Edit Transaction';
    txId.value = tx.id;
    txAmount.value = tx.amount;
    txTitle.value = tx.title;
    txDate.value = tx.date && tx.date.includes('T') ? tx.date.slice(0, 16) : (tx.date ? `${tx.date}T00:00` : getCurrentDateTimeLocalValue());
    txMethod.value = tx.method || 'Cash';
    txFrequency.value = tx.frequency || 'One-time';
    txNotes.value = tx.notes || '';
    renderPaymentMethodOptions();
    txMethod.value = tx.method || 'Cash';

    const typeRadio = document.querySelector(`input[name="txType"][value="${tx.type}"]`);
    if (typeRadio) typeRadio.checked = true;

    updateModalCategoryOptions();
    txCategory.value = tx.category;

    transactionModal.showModal();
  }

  function duplicateTransaction(id) {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;

    openAddModal();
    txTitle.value = `${tx.title} (Copy)`;
    txAmount.value = tx.amount;
    txMethod.value = tx.method || 'Cash';
    renderPaymentMethodOptions();
    txMethod.value = tx.method || 'Cash';
    txFrequency.value = tx.frequency || 'One-time';
    txNotes.value = tx.notes || '';

    const typeRadio = document.querySelector(`input[name="txType"][value="${tx.type}"]`);
    if (typeRadio) typeRadio.checked = true;

    updateModalCategoryOptions();
    txCategory.value = tx.category;
  }

  function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this inventory entry?')) {
      const tx = state.transactions.find(t => t.id === id);
      if (tx) {
        updateBankAccountBalanceForTransaction(tx, -1);
      }
      state.transactions = state.transactions.filter(t => t.id !== id);
      saveState();
      renderApp();
      showSaveAnimation('Entry deleted', 'danger');
    }
  }

  function updateBudgetLimitStatus() {
    const totalLimit = Number(totalSpendingLimit.value) || 0;
    const inputs = budgetCategoryInputs.querySelectorAll('input');
    let used = 0;

    inputs.forEach(input => {
      used += Number.parseFloat(input.value) || 0;
    });

    const remaining = totalLimit - used;

    if (totalLimit <= 0) {
      budgetLimitStatus.textContent = 'Enter a total spending limit to see the remaining available budget.';
      budgetLimitStatus.className = 'budget-limit-status neutral';
      return;
    }

    if (remaining > 0) {
      budgetLimitStatus.textContent = `Available total spending limit: ${formatCurrency(remaining)} remaining`;
      budgetLimitStatus.className = 'budget-limit-status positive';
      return;
    }

    if (remaining === 0) {
      budgetLimitStatus.textContent = `Available total spending limit: ${formatCurrency(remaining)} remaining`;
      budgetLimitStatus.className = 'budget-limit-status neutral';
      return;
    }

    budgetLimitStatus.textContent = `Over total spending limit by ${formatCurrency(Math.abs(remaining))}`;
    budgetLimitStatus.className = 'budget-limit-status danger';
  }

  function openBudgetModal() {
    budgetCategoryInputs.innerHTML = '';
    totalSpendingLimit.value = state.totalSpendingLimit || 0;
    
    const expenseCategories = state.categories.expense || [];
    expenseCategories.forEach(cat => {
      const currentLimit = state.budgetLimits[cat] || 0;
      const row = document.createElement('div');
      row.className = 'budget-input-row';
      row.innerHTML = `
        <label for="budget_${cat}">${getCategoryIcon(cat)} ${escapeHtml(cat)}</label>
        <input type="number" id="budget_${cat}" name="${cat}" class="form-control" min="0" step="10" value="${currentLimit}" placeholder="0">
      `;
      budgetCategoryInputs.appendChild(row);
    });

    updateBudgetLimitStatus();
    budgetCategoryInputs.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', updateBudgetLimitStatus);
    });

    budgetModal.showModal();
  }

  function resetBankAccountForm() {
    bankAccountId.value = '';
    bankAccountType.value = 'bank';
    bankAccountName.value = '';
    bankAccountInstitution.value = '';
    bankAccountHolder.value = '';
    bankAccountNumber.value = '';
    bankAccountBalance.value = '';
    bankAccountMaxSpend.value = '';
    bankAccountDefault.checked = false;
    bankAccountNotes.value = '';
  }

  function renderBankAccountModal() {
    bankAccountList.innerHTML = '';

    if (state.bankAccounts.length === 0) {
      bankAccountList.innerHTML = '<div style="font-size:0.85rem; color:var(--text-muted); text-align:center; padding:1rem;">No bank account or card details saved yet.</div>';
      return;
    }

    state.bankAccounts.forEach(account => {
      const meta = getBankAccountTypeMeta(account.type);
      const row = document.createElement('div');
      row.className = 'bank-account-item';
      const maxSpend = Number(account.maxSpendingLimit || 0);
      const isDefaultAccount = account.isDefaultAccount === true || account.defaultAccount === true;
      row.innerHTML = `
        <div class="bank-account-meta">
          <div class="bank-account-name">
            <span>${meta.icon}</span>
            <span>${escapeHtml(account.name)}</span>
            <span class="bank-account-type">${meta.label}</span>
            ${isDefaultAccount ? '<span class="default-account-pill">Default</span>' : ''}
          </div>
          <div class="bank-account-details">
            ${escapeHtml(account.institution || 'N/A')} • ${escapeHtml(account.accountNumber || 'No reference')} • ${escapeHtml(account.holder || 'No holder')}
            ${account.balance !== undefined && account.balance !== null ? ` • Balance: ${formatCurrency(Number(account.balance))}` : ''}
            ${maxSpend > 0 ? ` • Max Spend: ${formatCurrency(maxSpend)}` : ''}
          </div>
        </div>
        <div class="bank-account-actions">
          <button type="button" class="btn-action-icon edit-bank-account" data-id="${account.id}" title="Edit Account">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button type="button" class="btn-action-icon delete-bank-account delete" data-id="${account.id}" title="Delete Account">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `;

      row.querySelector('.edit-bank-account').addEventListener('click', () => {
        const selected = state.bankAccounts.find(item => item.id === account.id);
        if (!selected) return;
        bankAccountId.value = selected.id;
        bankAccountType.value = selected.type || 'bank';
        bankAccountName.value = selected.name || '';
        bankAccountInstitution.value = selected.institution || '';
        bankAccountHolder.value = selected.holder || '';
        bankAccountNumber.value = selected.accountNumber || '';
        bankAccountBalance.value = selected.balance ?? '';
        bankAccountMaxSpend.value = selected.maxSpendingLimit ?? '';
        bankAccountDefault.checked = selected.isDefaultAccount === true || selected.defaultAccount === true;
        bankAccountNotes.value = selected.notes || '';
        bankAccountName.focus();
      });

      row.querySelector('.delete-bank-account').addEventListener('click', () => {
        if (!confirm(`Delete account "${account.name}"?`)) return;
        state.bankAccounts = state.bankAccounts.filter(item => item.id !== account.id);
        state.transactions = state.transactions.filter(tx => getPaymentMethodLabel(tx.method) !== `${getBankAccountTypeMeta(account.type).icon} ${account.name} (${getBankAccountTypeMeta(account.type).label})` && tx.method !== `account:${account.id}`);
        saveState();
        renderBankAccountModal();
        renderPaymentMethodOptions();
        renderApp();
        showSaveAnimation('Account deleted', 'danger');
      });

      bankAccountList.appendChild(row);
    });
  }

  function openBankAccountModal() {
    resetBankAccountForm();
    renderBankAccountModal();
    bankAccountModal.showModal();
  }

  // Export / Import Logic
  function exportCSV() {
    const filtered = getFilteredTransactions();
    if (filtered.length === 0) {
      alert('No data available to export.');
      return;
    }

    const headers = ['ID', 'Date', 'Type', 'Title', 'Category', 'Amount', 'Payment Method', 'Frequency', 'Notes'];
    const rows = filtered.map(tx => [
      tx.id,
      tx.date,
      tx.type,
      `"${(tx.title || '').replace(/"/g, '""')}"`,
      `"${(tx.category || '').replace(/"/g, '""')}"`,
      tx.amount,
      `"${(tx.method || '').replace(/"/g, '""')}"`,
      `"${(tx.frequency || '').replace(/"/g, '""')}"`,
      `"${(tx.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `income_expenses_${state.selectedMonth}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(getBackupData(), null, 2));
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `budget_inventory_backup_${getCurrentYearMonth()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  }

  function getBackupData() {
    return {
      transactions: state.transactions,
      categories: state.categories,
      categoryIcons: state.categoryIcons,
      budgetLimits: state.budgetLimits,
      totalSpendingLimit: state.totalSpendingLimit,
      bankAccounts: state.bankAccounts,
      exportDate: new Date().toISOString()
    };
  }

  function saveToGoogleDrive() {
    let endpoint = localStorage.getItem('budget_inventory_drive_endpoint') || '';
    if (!endpoint) {
      endpoint = prompt('Paste your Google Apps Script web-app URL:');
      if (!endpoint) return;

      try {
        const endpointUrl = new URL(endpoint);
        if (!['http:', 'https:'].includes(endpointUrl.protocol)) {
          throw new Error('Invalid protocol');
        }
      } catch (error) {
        alert('Please enter a valid Google Apps Script web-app URL.');
        return;
      }

      localStorage.setItem('budget_inventory_drive_endpoint', endpoint);
    }

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(getBackupData())
    })
      .then(response => {
        if (!response.ok) throw new Error('Drive request failed');
        showSaveAnimation('Saved to Google Drive', 'success');
      })
      .catch(() => showSaveAnimation('Google Drive save failed', 'danger'));
  }

  function importJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported.transactions)) {
          state.transactions = imported.transactions;
          if (imported.categories) {
            state.categories = imported.categories;
          }
          if (imported.categoryIcons) {
            state.categoryIcons = imported.categoryIcons;
          }
          if (imported.budgetLimits) {
            state.budgetLimits = imported.budgetLimits;
          }
          if (imported.totalSpendingLimit !== undefined) {
            state.totalSpendingLimit = Number(imported.totalSpendingLimit) || 0;
          }
          if (imported.bankAccounts) {
            state.bankAccounts = imported.bankAccounts;
          }
          saveState();
          renderPaymentMethodOptions();
          renderApp();
          alert('Backup imported successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Error parsing JSON backup file.');
      }
    };
    reader.readAsText(file);
  }

  // Event Listeners Setup
  function bindEvents() {
    // Month navigation
    monthPicker.addEventListener('change', (e) => {
      if (e.target.value) {
        state.selectedMonth = e.target.value;
        renderApp();
      }
    });

    prevMonthBtn.addEventListener('click', () => {
      let ym = state.selectedMonth === 'all' ? getCurrentYearMonth() : state.selectedMonth;
      let [year, month] = ym.split('-').map(Number);
      month--;
      if (month < 1) {
        month = 12;
        year--;
      }
      state.selectedMonth = `${year}-${String(month).padStart(2, '0')}`;
      renderApp();
    });

    nextMonthBtn.addEventListener('click', () => {
      let ym = state.selectedMonth === 'all' ? getCurrentYearMonth() : state.selectedMonth;
      let [year, month] = ym.split('-').map(Number);
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
      state.selectedMonth = `${year}-${String(month).padStart(2, '0')}`;
      renderApp();
    });

    allTimeBtn.addEventListener('click', () => {
      state.selectedMonth = 'all';
      renderApp();
    });

    const applyDateRangeFilter = (field, value) => {
      if (field === 'start') {
        state.dateRangeStart = value;
      } else {
        state.dateRangeEnd = value;
      }

      if (state.dateRangeStart || state.dateRangeEnd) {
        state.selectedMonth = 'all';
      }

      renderApp();
    };

    dateRangeStart.addEventListener('input', (e) => applyDateRangeFilter('start', e.target.value));
    dateRangeStart.addEventListener('change', (e) => applyDateRangeFilter('start', e.target.value));

    dateRangeEnd.addEventListener('input', (e) => applyDateRangeFilter('end', e.target.value));
    dateRangeEnd.addEventListener('change', (e) => applyDateRangeFilter('end', e.target.value));

    clearDateRangeBtn.addEventListener('click', () => {
      state.dateRangeStart = '';
      state.dateRangeEnd = '';
      dateRangeStart.value = '';
      dateRangeEnd.value = '';
      renderApp();
    });

    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Modal triggers
    $('addTransactionBtn').addEventListener('click', openAddModal);
    $('emptyAddBtn').addEventListener('click', openAddModal);
    $('budgetLimitsBtn').addEventListener('click', openBudgetModal);
    $('manageBudgetsLink').addEventListener('click', openBudgetModal);
    totalSpendingLimit.addEventListener('input', updateBudgetLimitStatus);
    bankAccountsBtn.addEventListener('click', openBankAccountModal);
    closeBankAccountModalBtn.addEventListener('click', () => bankAccountModal.close());
    cancelBankAccountBtn.addEventListener('click', () => {
      resetBankAccountForm();
      bankAccountModal.close();
    });

    bankAccountForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const payload = {
        id: bankAccountId.value || `acct_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        type: bankAccountType.value,
        name: bankAccountName.value.trim(),
        institution: bankAccountInstitution.value.trim(),
        holder: bankAccountHolder.value.trim(),
        accountNumber: bankAccountNumber.value.trim(),
        balance: parseFloat(bankAccountBalance.value || 0),
        maxSpendingLimit: parseFloat(bankAccountMaxSpend.value || 0),
        isDefaultAccount: !!bankAccountDefault.checked,
        notes: bankAccountNotes.value.trim()
      };

      if (!payload.name) {
        alert('Account nickname is required.');
        return;
      }

      if (payload.isDefaultAccount) {
        state.bankAccounts = state.bankAccounts.map(account => ({
          ...account,
          isDefaultAccount: account.id === payload.id ? true : false,
          defaultAccount: account.id === payload.id ? true : false
        }));
      }

      if (bankAccountId.value) {
        const idx = state.bankAccounts.findIndex(item => item.id === bankAccountId.value);
        if (idx !== -1) {
          state.bankAccounts[idx] = payload;
          if (payload.isDefaultAccount) {
            state.bankAccounts = state.bankAccounts.map(account => account.id === payload.id ? payload : {
              ...account,
              isDefaultAccount: false,
              defaultAccount: false
            });
          }
        }
      } else {
        state.bankAccounts.unshift(payload);
        if (payload.isDefaultAccount) {
          state.bankAccounts = state.bankAccounts.map((account, index) => (
            index === 0 ? { ...account, isDefaultAccount: true, defaultAccount: true } : { ...account, isDefaultAccount: false, defaultAccount: false }
          ));
        }
      }

      saveState();
      resetBankAccountForm();
      renderBankAccountModal();
      renderPaymentMethodOptions();
      renderApp();
      showSaveAnimation('Account saved', 'success');
      bankAccountModal.close();
    });
    
    // Category Modal Triggers
    categorySettingsBtn.addEventListener('click', openCategoryModal);
    closeCategoryModalBtn.addEventListener('click', () => categoryModal.close());
    closeCategoryModalFooterBtn.addEventListener('click', () => categoryModal.close());

    // Category Tabs
    catTabExpense.addEventListener('click', () => {
      state.activeCategoryTab = 'expense';
      renderCategoryModal();
    });
    catTabIncome.addEventListener('click', () => {
      state.activeCategoryTab = 'income';
      renderCategoryModal();
    });

    // Add New Category Form Submit
    addCategoryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const catName = newCatName.value.trim();
      const iconVal = newCatIcon.value || '🏷️';
      const type = state.activeCategoryTab;
      
      if (!catName) return;

      if (state.categories[type].includes(catName)) {
        alert(`Category "${catName}" already exists in ${type} categories.`);
        return;
      }

      state.categories[type].push(catName);
      state.categoryIcons[catName] = iconVal;
      newCatName.value = '';

      saveState();
      renderCategoryModal();
      renderApp();
    });

    // Transaction Modal Close Buttons
    $('closeTransactionModalBtn').addEventListener('click', () => transactionModal.close());
    $('cancelTxBtn').addEventListener('click', () => transactionModal.close());

    $('closeBudgetModalBtn').addEventListener('click', () => budgetModal.close());
    $('cancelBudgetBtn').addEventListener('click', () => budgetModal.close());

    // Type Radio change updates categories
    document.querySelectorAll('input[name="txType"]').forEach(radio => {
      radio.addEventListener('change', updateModalCategoryOptions);
    });

    txMethod.addEventListener('change', () => {
      const transferRow = document.getElementById('transferRow');
      if (transferRow) {
        transferRow.style.display = txMethod.value === 'inter_account_transfer' ? 'flex' : 'none';
      }
    });

    // Transaction Form Submit
    transactionForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let methodValue = txMethod.value;
      if (txMethod.value === 'inter_account_transfer') {
        if (!txTransferFrom.value || !txTransferTo.value || txTransferFrom.value === txTransferTo.value) {
          alert('Please choose two different accounts for the transfer.');
          return;
        }
        methodValue = `transfer:${txTransferFrom.value}:${txTransferTo.value}`;
      }

      const selectedType = document.querySelector('input[name="txType"]:checked')?.value || 'expense';
      const transactionType = txMethod.value === 'inter_account_transfer' ? 'transfer' : selectedType;
      const transactionDate = txDate.value || getCurrentDateTimeLocalValue();

      const newTx = {
        id: txId.value || generateUniqueId(),
        type: transactionType,
        amount: parseFloat(txAmount.value),
        title: txTitle.value.trim(),
        category: txCategory.value,
        date: transactionDate,
        method: methodValue,
        frequency: txFrequency.value,
        notes: txNotes.value.trim()
      };

      if (txId.value) {
        const idx = state.transactions.findIndex(t => t.id === txId.value);
        if (idx !== -1) {
          const oldTx = state.transactions[idx];
          updateBankAccountBalanceForTransaction(oldTx, -1);
          state.transactions[idx] = newTx;
          updateBankAccountBalanceForTransaction(newTx, 1);
        }
      } else {
        state.transactions.unshift(newTx);
        updateBankAccountBalanceForTransaction(newTx, 1);
      }

      saveState();
      transactionModal.close();
      showSaveAnimation('Entry saved', 'success');
      renderApp();
    });

    // Budget Form Submit
    budgetForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const totalLimit = Number(totalSpendingLimit.value) || 0;
      const inputs = budgetCategoryInputs.querySelectorAll('input');
      let grandTotal = 0;

      const categoryLimits = {};
      inputs.forEach(input => {
        const category = input.name;
        const val = parseFloat(input.value) || 0;
        categoryLimits[category] = val;
        grandTotal += val;
      });

      if (totalLimit > 0 && grandTotal > totalLimit) {
        alert(`Category limits total ${formatCurrency(grandTotal)} which exceeds the total spending limit of ${formatCurrency(totalLimit)}. Reduce the category limits or raise the total limit.`);
        return;
      }

      state.totalSpendingLimit = totalLimit;
      Object.keys(state.budgetLimits).forEach(category => {
        delete state.budgetLimits[category];
      });
      Object.entries(categoryLimits).forEach(([category, value]) => {
        state.budgetLimits[category] = value;
      });
      saveState();
      budgetModal.close();
      showSaveAnimation('Budget saved', 'success');
      renderBudgets();
    });

    // Search and Filters
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderApp();
    });

    typeFilter.addEventListener('change', (e) => {
      state.typeFilter = e.target.value;
      renderApp();
    });

    categoryFilter.addEventListener('change', (e) => {
      state.categoryFilter = e.target.value;
      renderApp();
    });

    // Table Sorting
    document.querySelectorAll('.data-table th.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const field = th.dataset.sort;
        if (state.sortField === field) {
          state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortField = field;
          state.sortDirection = 'desc';
        }
        
        document.querySelectorAll('.sort-icon').forEach(icon => icon.textContent = '');
        const currentTh = document.querySelector(`.data-table th[data-sort="${field}"]`);
        if (currentTh) {
          const iconSpan = currentTh.querySelector('.sort-icon') || document.createElement('span');
          iconSpan.className = 'sort-icon';
          iconSpan.textContent = state.sortDirection === 'asc' ? ' ↑' : ' ↓';
          currentTh.appendChild(iconSpan);
        }
        
        renderApp();
      });
    });

    // Data Dropdown Toggle
    moreActionsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dataDropdownMenu.parentElement.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      dataDropdownMenu.parentElement.classList.remove('active');
    });

    // Data Action Items
    $('exportCsvBtn').addEventListener('click', exportCSV);
    $('exportJsonBtn').addEventListener('click', exportJSON);
    $('saveGoogleDriveBtn').addEventListener('click', saveToGoogleDrive);
    
    $('importJsonInput').addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        importJSON(e.target.files[0]);
      }
    });

    $('loadSampleBtn').addEventListener('click', () => {
      if (confirm('Load sample data? This will reset categories and transactions to sample data.')) {
        loadSampleData(true);
        renderApp();
      }
    });

    $('clearDataBtn').addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all transactions and reset data?')) {
        state.transactions = [];
        state.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
        state.categoryIcons = { ...DEFAULT_CATEGORY_ICONS };
        state.budgetLimits = { ...DEFAULT_BUDGET_LIMITS };
        state.totalSpendingLimit = 0;
        state.bankAccounts = [];
        saveState();
        renderPaymentMethodOptions();
        renderApp();
      }
    });
  }

  // Application Initialization
  function init() {
    loadState();
    renderPaymentMethodOptions();
    bindEvents();
    renderApp();

    const pageLoader = document.getElementById('pageLoader');
    if (pageLoader) {
      window.setTimeout(() => pageLoader.remove(), 1250);
    }
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
