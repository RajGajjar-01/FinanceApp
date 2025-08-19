import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';

const TrackerContext = createContext();

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return context;
};

export const TrackerProvider = ({ children }) => {
  const { axiosPrivate } = useAuth();

  const [budget, setBudget] = useState({
    data: { id: '', amount: 0, spent: 0, exists: false },
    edit: { isEditing: false, newAmount: '0', isUpdating: false },
    create: { isCreating: false, createAmount: '', isSubmitting: false },
    ui: { isLoading: true, error: '' },
  });

  const [accountsState, setAccountsState] = useState({
    list: JSON.parse(localStorage.getItem('userAccounts') || '[]'),
    selectedId: localStorage.getItem('selectedAccountId') || null,
    editingId: null,
    editingName: '',
  });

  const [transactionsState, setTransactionsState] = useState({
    list: JSON.parse(localStorage.getItem('userTransactions') || '[]'),
    isLoading: false,
  });

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9FA8DA'];

  useEffect(() => {
    if (budget.data.amount > 0) localStorage.setItem('userBudget', JSON.stringify(budget.data));
  }, [budget.data]);

  useEffect(() => {
    if (accountsState.list.length > 0) localStorage.setItem('userAccounts', JSON.stringify(accountsState.list));
  }, [accountsState.list]);

  useEffect(() => {
    if (accountsState.selectedId) localStorage.setItem('selectedAccountId', accountsState.selectedId);
  }, [accountsState.selectedId]);

  useEffect(() => {
    if (transactionsState.list.length > 0) localStorage.setItem('userTransactions', JSON.stringify(transactionsState.list));
  }, [transactionsState.list]);

  const selectedAccount = useMemo(() => {
    return accountsState.list.find(account => account.id === accountsState.selectedId);
  }, [accountsState.list, accountsState.selectedId]);

  const accountTransactions = useMemo(() => {
    if (!accountsState.selectedId) return [];
    return transactionsState.list.filter(t => t.accountId === accountsState.selectedId);
  }, [transactionsState.list, accountsState.selectedId]);

  const recentTransactions = useMemo(() => {
    return accountTransactions.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }, [accountTransactions]);

  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    return accountTransactions.filter(t => {
      const d = new Date(t.date);
      return t.type === 'EXPENSE' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [accountTransactions]);

  const expensesByCategory = useMemo(() => {
    return currentMonthExpenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
  }, [currentMonthExpenses]);

  const pieChartData = useMemo(() => {
    return Object.entries(expensesByCategory).map(([cat, val]) => ({ name: cat, value: val }));
  }, [expensesByCategory]);

  const percentUsed = useMemo(() => {
    if (budget.data.amount === 0) return 0;
    return (budget.data.spent / budget.data.amount) * 100;
  }, [budget.data.spent, budget.data.amount]);

  const getProgressColorClass = useCallback(() => {
    if (percentUsed >= 90) return '[&>div]:bg-red-500';
    if (percentUsed >= 75) return '[&>div]:bg-yellow-500';
    return '[&>div]:bg-green-500';
  }, [percentUsed]);

  const fetchBudgetData = useCallback(async () => {
    setBudget(prev => ({ ...prev, ui: { isLoading: true, error: '' } }));
    try {
      const response = await axiosPrivate.get('/expense/budget/');
      const results = response.data?.data?.results;
      if (Array.isArray(results) && results.length > 0) {   
        const budgetRes = results[0];
        const amount = parseFloat(budgetRes.amount) || 0;
        const spent = budgetRes.current_month_expenses || 0;
        setBudget({
          data: { id: budgetRes.id, amount, spent, exists: true },
          edit: { isEditing: false, newAmount: amount.toString(), isUpdating: false },
          create: { isCreating: false, createAmount: '', isSubmitting: false },
          ui: { isLoading: false, error: '' },
        });
      } else {
        setBudget(prev => ({ ...prev, data: { id: '', amount: 0, spent: 0, exists: false }, ui: { isLoading: false, error: '' } }));
      }
    } catch (err) {
      setBudget(prev => ({ ...prev, ui: { isLoading: false, error: 'Failed to load budget data' }, data: { id: '', amount: 0, spent: 0, exists: false } }));
    }
  }, [axiosPrivate]);

  const createBudget = useCallback(async (amount) => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setBudget(prev => ({ ...prev, ui: { ...prev.ui, error: 'Please enter a valid budget amount' } }));
      setTimeout(() => setBudget(prev => ({ ...prev, ui: { ...prev.ui, error: '' } })), 3000);
      return { success: false };
    }
    setBudget(prev => ({ ...prev, create: { ...prev.create, isSubmitting: true }, ui: { ...prev.ui, error: '' } }));
    try {
      const response = await axiosPrivate.post('/expense/budget/', { amount: parsed });
      if (response.data?.success) {
        let newBudget;
        if (response.data?.data?.results && Array.isArray(response.data.data.results)) {
          newBudget = response.data.data.results[0];
        } else if (response.data?.data) {
          newBudget = response.data.data;
        } else {
          newBudget = response.data;
        }
        const budgetAmount = parseFloat(newBudget.amount) || 0;
        const spent = newBudget.current_month_expenses || 0;
        setBudget({
          data: { id: newBudget.id, amount: budgetAmount, spent, exists: true },
          edit: { isEditing: false, newAmount: budgetAmount.toString(), isUpdating: false },
          create: { isCreating: false, createAmount: '', isSubmitting: false },
          ui: { isLoading: false, error: '' },
        });
        return { success: true };
      } else {
        throw new Error(response.data?.message || 'Failed to create budget');
      }
    } catch (err) {
      setBudget(prev => ({ ...prev, create: { ...prev.create, isSubmitting: false }, ui: { ...prev.ui, error: err.message || 'Failed to create budget' } }));
      setTimeout(() => setBudget(prev => ({ ...prev, ui: { ...prev.ui, error: '' } })), 5000);
      return { success: false };
    }
  }, [axiosPrivate]);

  const updateBudget = useCallback(async (newAmount) => {
    const parsed = parseFloat(newAmount);
    if (isNaN(parsed) || parsed < 0 || !budget.data.id) {
      setBudget(prev => ({ ...prev, edit: { isEditing: false, newAmount: prev.data.amount.toString(), isUpdating: false } }));
      return { success: false };
    }
    setBudget(prev => ({ ...prev, edit: { ...prev.edit, isUpdating: true } }));
    try {
      const response = await axiosPrivate.put(`/expense/budget/${budget.data.id}/`, { amount: parsed });
      if (response.data?.success) {
        setBudget(prev => ({ ...prev, data: { ...prev.data, amount: parsed }, edit: { isEditing: false, newAmount: parsed.toString(), isUpdating: false } }));
        return { success: true };
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      setBudget(prev => ({ ...prev, edit: { isEditing: false, newAmount: prev.data.amount.toString(), isUpdating: false }, ui: { ...prev.ui, error: 'Failed to update budget' } }));
      setTimeout(() => setBudget(prev => ({ ...prev, ui: { ...prev.ui, error: '' } })), 3000);
      return { success: false };
    }
  }, [axiosPrivate, budget.data.id]);

  const startEditingBudget = useCallback(() => {
    setBudget(prev => ({ ...prev, edit: { isEditing: true, newAmount: prev.data.amount.toString(), isUpdating: false } }));
  }, []);

  const cancelEditingBudget = useCallback(() => {
    setBudget(prev => ({ ...prev, edit: { isEditing: false, newAmount: prev.data.amount.toString(), isUpdating: false } }));
  }, []);

  const startCreatingBudget = useCallback(() => {
    setBudget(prev => ({ ...prev, create: { isCreating: true, createAmount: '', isSubmitting: false }, ui: { ...prev.ui, error: '' } }));
  }, []);

  const cancelCreatingBudget = useCallback(() => {
    setBudget(prev => ({ ...prev, create: { isCreating: false, createAmount: '', isSubmitting: false }, ui: { ...prev.ui, error: '' } }));
  }, []);

  const updateBudgetCreateAmount = useCallback((amount) => {
    setBudget(prev => ({ ...prev, create: { ...prev.create, createAmount: amount } }));
  }, []);

  const updateBudgetEditAmount = useCallback((amount) => {
    setBudget(prev => ({ ...prev, edit: { ...prev.edit, newAmount: amount } }));
  }, []);

  const handleAccountSelection = useCallback((id) => {
    setAccountsState(prev => ({
      ...prev,
      selectedId: id,
      list: prev.list.map(acc => ({ ...acc, isDefault: acc.id === id }))
    }));
  }, []);

  const addAccount = useCallback(async (accountData) => {
    try {
      const response = await axiosPrivate.post('/expense/accounts/', accountData);

      const newAccount = { ...response.data.account, isDefault: accountsState.list.length === 0 };
      setAccountsState(prev => {
        const newList = [...prev.list, newAccount];
        return { ...prev, list: newList, selectedId: prev.selectedId || newAccount.id };
      });
      return { success: true, account: newAccount };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [axiosPrivate, accountsState.list.length]);

  const updateAccount = useCallback(async (accountId, updateData) => {
    try {
      const response = await axiosPrivate.put(`/expense/accounts/${accountId}/`, updateData);
      setAccountsState(prev => ({
        ...prev,
        list: prev.list.map(acc => acc.id === accountId ? { ...acc, ...updateData } : acc),
        editingId: null,
        editingName: ''
      }));
      return { success: true, data: response.data };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [axiosPrivate]);

  const deleteAccount = useCallback(async (accountId) => {
    try {
      await axiosPrivate.delete(`/expense/accounts/${accountId}/`);
      setAccountsState(prev => {
        const filtered = prev.list.filter(acc => acc.id !== accountId);
        let newSelected = prev.selectedId;
        if (accountId === prev.selectedId) {
          newSelected = filtered.length > 0 ? filtered[0].id : null;
        }
        return { ...prev, list: filtered, selectedId: newSelected };
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [axiosPrivate]);

  const startEditingAccount = useCallback((accountId, name) => {
    setAccountsState(prev => ({ ...prev, editingId: accountId, editingName: name }));
  }, []);

  const cancelEditingAccount = useCallback(() => {
    setAccountsState(prev => ({ ...prev, editingId: null, editingName: '' }));
  }, []);

  const updateAccountEditingName = useCallback((name) => {
    setAccountsState(prev => ({ ...prev, editingName: name }));
  }, []);

  const fetchTransactions = useCallback(async () => {
    setTransactionsState(prev => ({ ...prev, isLoading: true }));
    try {
      const resp = await axiosPrivate.get('/expense/transactions/');
      const transactionsFromApi = (resp.data.data?.results || []).map(t => ({
        id: t.id,
        type: t.type,
        amount: parseFloat(t.amount),
        description: t.description || '',
        date: t.date,
        category: t.category || '',
        receiptUrl: t.receipt_url || null,
        isRecurring: t.is_recurring || false,
        recurringInterval: t.recurring_interval || null,
        nextRecurringDate: t.next_recurring_date || null,
        status: t.status || 'COMPLETED',
        accountId: t.account || '',
        accountName: t.account_name || '',
        accountType: t.account_type || '',
        createdAt: t.created_at || '',
        updatedAt: t.updated_at || '',
      }));
      setTransactionsState(prev => ({ ...prev, list: transactionsFromApi, isLoading: false }));
      return { success: true, data: resp.data };
    } catch (e) {
      setTransactionsState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: e.message };
    }
  }, [axiosPrivate]);

  const addTransaction = useCallback(async (transaction) => {
    try {
      const payload = {
        type: transaction.type,
        amount: transaction.amount.toString(),
        description: transaction.description,
        date: transaction.date,
        account: accountsState.selectedId,
        category: transaction.category,
      };
      const resp = await axiosPrivate.post('/expense/transactions/', payload);
      const apiTransaction = resp.data.data || resp.data.transaction || resp.data;
      const newTransaction = {
        id: apiTransaction.id,
        type: apiTransaction.type,
        amount: parseFloat(apiTransaction.amount),
        description: apiTransaction.description || '',
        date: apiTransaction.date,
        category: apiTransaction.category || '',
        receiptUrl: apiTransaction.receipt_url || null,
        isRecurring: apiTransaction.is_recurring || false,
        recurringInterval: apiTransaction.recurring_interval || null,
        nextRecurringDate: apiTransaction.next_recurring_date || null,
        status: apiTransaction.status || 'COMPLETED',
        accountId: apiTransaction.account,
        accountName: apiTransaction.account_name || '',
        accountType: apiTransaction.account_type || '',
        createdAt: apiTransaction.created_at || '',
        updatedAt: apiTransaction.updated_at || '',
      };
      setTransactionsState(prev => ({ ...prev, list: [...prev.list, newTransaction] }));
      setAccountsState(prev => ({
        ...prev,
        list: prev.list.map(acc => acc.id === newTransaction.accountId
          ? { ...acc, balance: acc.balance + (newTransaction.type === 'INCOME' ? newTransaction.amount : -newTransaction.amount) }
          : acc
        )
      }));
      if (newTransaction.type === 'EXPENSE') {
        setBudget(prev => ({ ...prev, data: { ...prev.data, spent: prev.data.spent + newTransaction.amount } }));
      }
      return { success: true, transaction: newTransaction };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [axiosPrivate, accountsState.selectedId]);

  const updateTransaction = useCallback(async (id, updateData) => {
    try {
      const payload = {
        type: updateData.type,
        amount: updateData.amount?.toString(),
        description: updateData.description,
        date: updateData.date,
        account: updateData.accountId,
        category: updateData.category,
      };
      const resp = await axiosPrivate.put(`/expense/transactions/${id}/`, payload);
      const apiTransaction = resp.data.data || resp.data.transaction || resp.data;
      const updatedTransaction = {
        id: apiTransaction.id,
        type: apiTransaction.type,
        amount: parseFloat(apiTransaction.amount),
        description: apiTransaction.description || '',
        date: apiTransaction.date,
        category: apiTransaction.category || '',
        receiptUrl: apiTransaction.receipt_url || null,
        isRecurring: apiTransaction.is_recurring || false,
        recurringInterval: apiTransaction.recurring_interval || null,
        nextRecurringDate: apiTransaction.next_recurring_date || null,
        status: apiTransaction.status || 'COMPLETED',
        accountId: apiTransaction.account,
        accountName: apiTransaction.account_name || '',
        accountType: apiTransaction.account_type || '',
        createdAt: apiTransaction.created_at || '',
        updatedAt: apiTransaction.updated_at || '',
      };
      setTransactionsState(prev => ({ ...prev, list: prev.list.map(t => t.id === id ? updatedTransaction : t) }));
      return { success: true, data: updatedTransaction };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [axiosPrivate]);

  const deleteTransaction = useCallback(async (id) => {
    try {
      await axiosPrivate.delete(`/api/transactions/${id}/`);
      const deleted = transactionsState.list.find(t => t.id === id);
      if (!deleted) return { success: false, error: 'Transaction not found' };
      setAccountsState(prev => ({
        ...prev,
        list: prev.list.map(acc => acc.id === deleted.accountId
          ? { ...acc, balance: acc.balance + (deleted.type === 'INCOME' ? -deleted.amount : deleted.amount) }
          : acc
        )
      }));
      if (deleted.type === 'EXPENSE') {
        setBudget(prev => ({ ...prev, data: { ...prev.data, spent: prev.data.spent - deleted.amount } }));
      }
      setTransactionsState(prev => ({ ...prev, list: prev.list.filter(t => t.id !== id) }));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [axiosPrivate, transactionsState.list]);

  const fetchAccounts = useCallback(async () => {
    try {
      const resp = await axiosPrivate.get('/expense/accounts/');
      const fetchedAccounts = resp.data.data?.results || [];
      setAccountsState(prev => {
        const newSelected = prev.selectedId || (fetchedAccounts.find(acc => acc.isDefault)?.id ?? (fetchedAccounts[0]?.id ?? null));
        return { ...prev, list: fetchedAccounts, selectedId: newSelected };
      });
      return { success: true, data: resp.data.results };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [axiosPrivate]);

  useEffect(() => {
    const initialize = async () => {
      await Promise.all([fetchAccounts(), fetchBudgetData(), fetchTransactions()]);
    };
    initialize();
  }, [fetchAccounts, fetchBudgetData, fetchTransactions]);

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, []);

  const clearAllData = useCallback(() => {
    setBudget({
      data: { id: '', amount: 0, spent: 0, exists: false },
      edit: { isEditing: false, newAmount: '0', isUpdating: false },
      create: { isCreating: false, createAmount: '', isSubmitting: false },
      ui: { isLoading: true, error: '' },
    });
    setAccountsState({ list: [], selectedId: null, editingId: null, editingName: '' });
    setTransactionsState({ list: [], isLoading: false });
    ['userBudget', 'userAccounts', 'userTransactions', 'selectedAccountId'].forEach(key => localStorage.removeItem(key));
  }, []);

  const value = useMemo(() => ({
    budget, percentUsed, getProgressColorClass, fetchBudgetData, createBudget, updateBudget,
    startEditingBudget, cancelEditingBudget, startCreatingBudget, cancelCreatingBudget,
    updateBudgetCreateAmount, updateBudgetEditAmount, accountsState, selectedAccount,
    handleAccountSelection, addAccount, updateAccount, deleteAccount, startEditingAccount,
    cancelEditingAccount, updateAccountEditingName, transactionsState, addTransaction,
    updateTransaction, deleteTransaction, fetchTransactions, accountTransactions,
    recentTransactions, currentMonthExpenses, expensesByCategory, pieChartData, COLORS,
    formatDate, clearAllData,
  }), [
    budget, percentUsed, getProgressColorClass, accountsState, selectedAccount, transactionsState,
    accountTransactions, recentTransactions, currentMonthExpenses, expensesByCategory, pieChartData,
    fetchBudgetData, createBudget, updateBudget, startEditingBudget, cancelEditingBudget,
    startCreatingBudget, cancelCreatingBudget, updateBudgetCreateAmount, updateBudgetEditAmount,
    handleAccountSelection, addAccount, updateAccount, deleteAccount, startEditingAccount,
    cancelEditingAccount, updateAccountEditingName, addTransaction, updateTransaction,
    deleteTransaction, fetchTransactions, formatDate, clearAllData,
  ]);

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>;
};
