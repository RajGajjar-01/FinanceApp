import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';

const TrackerContext = createContext(null);

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
    list: [],
    selectedId: null,
    editingId: null,
    editingName: '',
    ui: { isLoading: false, error: '' },
  });

  const [transactionsState, setTransactionsState] = useState({
    list: [],
    ui: { isLoading: false, error: '' },
  });

  const [percentages, setPercentages] = useState([]);

  // Computed values without useMemo
  const selectedAccount = accountsState.list.find(account => account.id === accountsState.selectedId) || null;
  
  const accountTransactions = accountsState.selectedId 
    ? transactionsState.list.filter(t => t.accountId === accountsState.selectedId)
    : [];
  
  const recentTransactions = accountTransactions
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  
  const currentMonthExpenses = (() => {
    const now = new Date();
    return accountTransactions.filter(t => {
      const d = new Date(t.date);
      return t.type === 'EXPENSE' && 
             d.getMonth() === now.getMonth() && 
             d.getFullYear() === now.getFullYear();
    });
  })();
  
  const percentUsed = budget.data.amount === 0 ? 0 : (budget.data.spent / budget.data.amount) * 100;
  
  const getProgressColorClass = () => {
    if (percentUsed >= 90) return '[&>div]:bg-red-500';
    if (percentUsed >= 75) return '[&>div]:bg-yellow-500';
    return '[&>div]:bg-green-500';
  };

  // API Functions - without useCallback
  const fetchAccounts = async () => {
    setAccountsState(prev => ({ 
      ...prev, 
      ui: { isLoading: true, error: '' } 
    }));
    
    try {
      const response = await axiosPrivate.get('/expense/accounts/');
      const accounts = response.data?.data?.results || [];
    
      const transformedAccounts = accounts.map(account => ({
        id: account.id,
        name: account.name,
        type: account.type,
        balance: parseFloat(account.balance) || 0,
        isDefault: account.is_default, 
      }));

      const defaultAccount = transformedAccounts.find(acc => acc.isDefault);
      const newSelectedId = defaultAccount?.id || transformedAccounts[0]?.id || null;
      
      setAccountsState(prev => ({ 
        ...prev, 
        list: transformedAccounts, 
        selectedId: prev.selectedId || newSelectedId,
        ui: { isLoading: false, error: '' }
      }));
      
      return { success: true, data: transformedAccounts };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load accounts';
      setAccountsState(prev => ({ 
        ...prev, 
        ui: { isLoading: false, error: errorMessage }
      }));
      return { success: false, error: errorMessage };
    }
  };

  const addAccount = async (accountData) => {
    try {
      const response = await axiosPrivate.post('/expense/accounts/', {
        name: accountData.name,
        type: accountData.type || 'CURRENT',
        balance: accountData.balance || 0
      });
      console.log(response.data);
      const newAccountData = response.data?.data || response.data;
      const newAccount = {
        id: newAccountData.id,
        name: newAccountData.name,
        type: newAccountData.type,
        balance: parseFloat(newAccountData.balance) || 0,
        isDefault: newAccountData.is_default,
        createdAt: newAccountData.created_at,
        updatedAt: newAccountData.updated_at,
      };
      
      setAccountsState(prev => ({ 
        ...prev, 
        list: [...prev.list, newAccount],
        ui: { ...prev.ui, error: '' }
      }));
      
      return { success: true, account: newAccount };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add account';
      setAccountsState(prev => ({ 
        ...prev, 
        ui: { ...prev.ui, error: errorMessage }
      }));
      return { success: false, error: errorMessage };
    }
  };

  const updateAccount = async (accountId, updateData) => {
    try {
      const response = await axiosPrivate.put(`/expense/accounts/${accountId}/`, updateData);
      
      setAccountsState(prev => ({
        ...prev,
        list: prev.list.map(acc => 
          acc.id === accountId 
            ? { 
                ...acc, 
                ...updateData,
                updatedAt: new Date().toISOString()
              } 
            : acc
        ),
        editingId: null,
        editingName: '',
        ui: { ...prev.ui, error: '' }
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update account';
      setAccountsState(prev => ({ 
        ...prev, 
        ui: { ...prev.ui, error: errorMessage }
      }));
      return { success: false, error: errorMessage };
    }
  };

  const deleteAccount = async (accountId) => {
    try {
      await axiosPrivate.delete(`/expense/accounts/${accountId}/`);
      
      setAccountsState(prev => {
        const filtered = prev.list.filter(acc => acc.id !== accountId);
        let newSelectedId = prev.selectedId;
        
        if (accountId === prev.selectedId) {
          const defaultAccount = filtered.find(acc => acc.isDefault);
          newSelectedId = defaultAccount?.id || filtered[0]?.id || null;
        }
        
        return { 
          ...prev, 
          list: filtered, 
          selectedId: newSelectedId,
          ui: { ...prev.ui, error: '' }
        };
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete account';
      setAccountsState(prev => ({ 
        ...prev, 
        ui: { ...prev.ui, error: errorMessage }
      }));
      return { success: false, error: errorMessage };
    }
  };

  const handleAccountSelection = async (accountId) => {
    try {
      await axiosPrivate.put(`/expense/accounts/${accountId}/set-default/`, {
        is_default: true
      });
      
      setAccountsState(prev => ({
        ...prev,
        selectedId: accountId,
        list: prev.list.map(acc => ({
          ...acc,
          isDefault: acc.id === accountId
        }))
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to set default account';
      setAccountsState(prev => ({ 
        ...prev, 
        ui: { ...prev.ui, error: errorMessage }
      }));
      return { success: false, error: errorMessage };
    }
  };

  // Account editing functions
  const startEditingAccount = (accountId, name) => {
    setAccountsState(prev => ({ 
      ...prev, 
      editingId: accountId, 
      editingName: name || '' 
    }));
  };

  const cancelEditingAccount = () => {
    setAccountsState(prev => ({ 
      ...prev, 
      editingId: null, 
      editingName: '' 
    }));
  };

  const updateAccountEditingName = (name) => {
    setAccountsState(prev => ({ 
      ...prev, 
      editingName: name 
    }));
  };

  // Budget functions
  const fetchBudgetData = async () => {
    setBudget(prev => ({ ...prev, ui: { isLoading: true, error: '' } }));
    
    try {
      const response = await axiosPrivate.get('/expense/budget/summary');
      const result = response.data;
      
      if (response.data.success) {   
        const budgetRes = result?.data?.result;
        const amount = parseFloat(budgetRes.amount) || 0;
        const spent = budgetRes.current_month_expenses || 0;
        setPercentages(result?.data?.utilization?.category_breakdown);
        
        setBudget({
          data: { id: budgetRes.id, amount, spent, exists: true },
          edit: { isEditing: false, newAmount: amount.toString(), isUpdating: false },
          create: { isCreating: false, createAmount: '', isSubmitting: false },
          ui: { isLoading: false, error: '' },
        });
      } else {
        setBudget(prev => ({ 
          ...prev, 
          data: { id: '', amount: 0, spent: 0, exists: false }, 
          ui: { isLoading: false, error: '' } 
        }));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load budget data';
      setBudget(prev => ({ 
        ...prev, 
        ui: { isLoading: false, error: errorMessage }, 
        data: { id: '', amount: 0, spent: 0, exists: false } 
      }));
    }
  };

  const createBudget = async (amount) => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setBudget(prev => ({ ...prev, ui: { ...prev.ui, error: 'Please enter a valid amount greater than 0' } }));
      return { success: false, error: 'Invalid amount' };
    }
    
    setBudget(prev => ({ 
      ...prev, 
      create: { ...prev.create, isSubmitting: true }, 
      ui: { ...prev.ui, error: '' } 
    }));
    
    try {
      const response = await axiosPrivate.post('/expense/budget/', { amount: parsed });
      const newBudget = response.data?.data?.results?.[0] || response.data?.data || response.data;
      
      setBudget({
        data: { 
          id: newBudget.id, 
          amount: parseFloat(newBudget.amount) || 0, 
          spent: newBudget.current_month_expenses || 0, 
          exists: true 
        },
        edit: { isEditing: false, newAmount: newBudget.amount.toString(), isUpdating: false },
        create: { isCreating: false, createAmount: '', isSubmitting: false },
        ui: { isLoading: false, error: '' },
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create budget';
      setBudget(prev => ({ 
        ...prev, 
        create: { ...prev.create, isSubmitting: false }, 
        ui: { ...prev.ui, error: errorMessage } 
      }));
      return { success: false, error: errorMessage };
    }
  };

  // Budget editing functions
  const startEditingBudget = () => {
    setBudget(prev => ({ 
      ...prev, 
      edit: { 
        ...prev.edit, 
        isEditing: true, 
        newAmount: prev.data.amount.toString() 
      },
      ui: { ...prev.ui, error: '' }
    }));
  };

  const cancelEditingBudget = () => {
    setBudget(prev => ({ 
      ...prev, 
      edit: { 
        ...prev.edit, 
        isEditing: false, 
        newAmount: prev.data.amount.toString(),
        isUpdating: false
      },
      ui: { ...prev.ui, error: '' }
    }));
  };

  const updateBudgetEditAmount = (amount) => {
    setBudget(prev => ({ 
      ...prev, 
      edit: { ...prev.edit, newAmount: amount }
    }));
  };

  const updateBudget = async (amount) => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setBudget(prev => ({ ...prev, ui: { ...prev.ui, error: 'Please enter a valid amount greater than 0' } }));
      return { success: false, error: 'Invalid amount' };
    }

    setBudget(prev => ({ 
      ...prev, 
      edit: { ...prev.edit, isUpdating: true },
      ui: { ...prev.ui, error: '' }
    }));

    try {
      const response = await axiosPrivate.put(`/expense/budget/${budget.data.id}/`, { amount: parsed });
      const updatedBudget = response.data?.data || response.data;
      
      setBudget(prev => ({
        ...prev,
        data: { 
          ...prev.data, 
          amount: parseFloat(updatedBudget.amount) || parsed 
        },
        edit: { 
          isEditing: false, 
          newAmount: (updatedBudget.amount || parsed).toString(), 
          isUpdating: false 
        },
        ui: { ...prev.ui, error: '' }
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update budget';
      setBudget(prev => ({ 
        ...prev, 
        edit: { ...prev.edit, isUpdating: false },
        ui: { ...prev.ui, error: errorMessage }
      }));
      return { success: false, error: errorMessage };
    }
  };

  // Budget creation functions
  const startCreatingBudget = () => {
    setBudget(prev => ({ 
      ...prev, 
      create: { ...prev.create, isCreating: true, createAmount: '' },
      ui: { ...prev.ui, error: '' }
    }));
  };

  const cancelCreatingBudget = () => {
    setBudget(prev => ({ 
      ...prev, 
      create: { 
        isCreating: false, 
        createAmount: '', 
        isSubmitting: false 
      },
      ui: { ...prev.ui, error: '' }
    }));
  };

  const updateBudgetCreateAmount = (amount) => {
    setBudget(prev => ({ 
      ...prev, 
      create: { ...prev.create, createAmount: amount }
    }));
  };

  // Transaction functions
  const fetchTransactions = async () => {
    setTransactionsState(prev => ({ 
      ...prev, 
      ui: { isLoading: true, error: '' } 
    }));
    
    try {
      const response = await axiosPrivate.get('/expense/transactions/');
      const transactionsFromApi = (response.data.data?.results || []).map(t => ({
        id: t.id,
        type: t.type,
        amount: parseFloat(t.amount) || 0,
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
      
      setTransactionsState(prev => ({ 
        ...prev, 
        list: transactionsFromApi, 
        ui: { isLoading: false, error: '' } 
      }));
      
      return { success: true, data: transactionsFromApi };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load transactions';
      setTransactionsState(prev => ({ 
        ...prev, 
        ui: { isLoading: false, error: errorMessage }
      }));
      return { success: false, error: errorMessage };
    }
  };

  const contextValue = {
    // Budget
    budget, 
    percentUsed, 
    getProgressColorClass, 
    fetchBudgetData, 
    createBudget,
    startEditingBudget,
    cancelEditingBudget,
    updateBudgetEditAmount,
    updateBudget,
    startCreatingBudget,
    cancelCreatingBudget,
    updateBudgetCreateAmount,
    
    // Accounts
    accountsState, 
    selectedAccount,
    handleAccountSelection, 
    addAccount, 
    fetchAccounts,
    updateAccount, 
    deleteAccount, 
    startEditingAccount,
    cancelEditingAccount, 
    updateAccountEditingName,
    
    // Transactions
    transactionsState, 
    fetchTransactions,
    accountTransactions,
    recentTransactions, 
    currentMonthExpenses, 
    percentages,
  };

  return (
    <TrackerContext.Provider value={contextValue}>
      {children}
    </TrackerContext.Provider>
  );
};