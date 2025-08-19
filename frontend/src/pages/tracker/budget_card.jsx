import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Check, X, Pencil, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const BudgetCard = () => {
  const [budgetData, setBudgetData] = useState({
    id: '',
    amount: 0,
    spent: 0,
    exists: false
  });
  const [editState, setEditState] = useState({
    isEditing: false,
    newAmount: '0',
    isUpdating: false
  });
  const [createState, setCreateState] = useState({
    isCreating: false,
    createAmount: '',
    isSubmitting: false  // Added separate submitting state
  });
  const [uiState, setUiState] = useState({
    isLoading: true,
    error: ''
  });
  const inputRef = useRef(null);
  const createInputRef = useRef(null);
  const { axiosPrivate } = useAuth();

  useEffect(() => {
    fetchBudgetData();
  }, []);

  useEffect(() => {
    if (editState.isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editState.isEditing]);

  useEffect(() => {
    if (createState.isCreating && createInputRef.current) {
      createInputRef.current.focus();
    }
  }, [createState.isCreating]);

  const fetchBudgetData = async () => {
    setUiState({ isLoading: true, error: '' });

    try {
      const response = await axiosPrivate.get('/expense/budget/');
      console.log(response.data);
      const results = response.data?.data?.results;

      if (Array.isArray(results) && results.length > 0) {
        const budget = results[0];
        const amount = parseFloat(budget.amount) || 0;

        setBudgetData({
          id: budget.id,
          amount,
          spent: budget.current_month_expenses || 0,
          exists: true
        });
        setEditState(prev => ({ ...prev, newAmount: amount.toString() }));
      } else {
        setBudgetData({ id: '', amount: 0, spent: 0, exists: false });
      }
    } catch (err) {
      setUiState({ isLoading: false, error: 'Failed to load budget data' });
      setBudgetData({ id: '', amount: 0, spent: 0, exists: false });
      return;
    }

    setUiState({ isLoading: false, error: '' });
  };

  const createBudget = async () => {
    const parsedAmount = parseFloat(createState.createAmount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setUiState(prev => ({ ...prev, error: 'Please enter a valid budget amount' }));
      setTimeout(() => setUiState(prev => ({ ...prev, error: '' })), 3000);
      return;
    }

    // Set submitting state to true while keeping isCreating true
    setCreateState(prev => ({ ...prev, isSubmitting: true }));
    setUiState(prev => ({ ...prev, error: '' }));

    try {
      const response = await axiosPrivate.post('/expense/budget/', {
        amount: parsedAmount
      });

      if (response.data?.success) {
        // Handle different possible response structures
        let newBudget;
        if (response.data?.data?.results && Array.isArray(response.data.data.results)) {
          newBudget = response.data.data.results[0];
        } else if (response.data?.data) {
          newBudget = response.data.data;
        } else {
          newBudget = response.data;
        }

        const amount = parseFloat(newBudget.amount) || 0;
        
        setBudgetData({
          id: newBudget.id,
          amount,
          spent: newBudget.current_month_expenses || 0,
          exists: true
        });
        setEditState(prev => ({ ...prev, newAmount: amount.toString() }));
        
        // Reset create state completely
        setCreateState({ isCreating: false, createAmount: '', isSubmitting: false });
        setUiState(prev => ({ ...prev, error: '' }));
      } else {
        throw new Error(response.data?.message || 'Failed to create budget');
      }
    } catch (err) {
      console.error('Create budget error:', err);
      setCreateState(prev => ({ ...prev, isSubmitting: false }));
      setUiState(prev => ({ 
        ...prev, 
        error: err.response?.data?.message || err.message || 'Failed to create budget' 
      }));
      setTimeout(() => setUiState(prev => ({ ...prev, error: '' })), 5000);
    }
  };

  const percentUsed = budgetData.amount > 0 ? (budgetData.spent / budgetData.amount) * 100 : 0;
  const remaining = budgetData.amount - budgetData.spent;

  const getProgressColorClass = () => {
    if (percentUsed >= 90) return 'text-red-600 dark:text-red-400';
    if (percentUsed >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const handleUpdateBudget = async () => {
    const parsedAmount = parseFloat(editState.newAmount);

    if (isNaN(parsedAmount) || parsedAmount < 0 || !budgetData.id) {
      setEditState(prev => ({ ...prev, newAmount: budgetData.amount.toString(), isEditing: false }));
      return;
    }

    setEditState(prev => ({ ...prev, isUpdating: true }));

    try {
      const response = await axiosPrivate.put(`/expense/budget/${budgetData.id}/`, {
        amount: parsedAmount
      });

      if (response.data?.success) {
        setBudgetData(prev => ({ ...prev, amount: parsedAmount }));
        setEditState({ isEditing: false, newAmount: parsedAmount.toString(), isUpdating: false });
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      setEditState(prev => ({ 
        ...prev, 
        newAmount: budgetData.amount.toString(), 
        isEditing: false, 
        isUpdating: false 
      }));
      setUiState(prev => ({ ...prev, error: 'Failed to update budget' }));
      setTimeout(() => setUiState(prev => ({ ...prev, error: '' })), 3000);
    }
  };

  const handleCancel = () => {
    setEditState(prev => ({ 
      ...prev, 
      newAmount: budgetData.amount.toString(), 
      isEditing: false 
    }));
  };

  const handleCreateCancel = () => {
    setCreateState({ isCreating: false, createAmount: '', isSubmitting: false });
    setUiState(prev => ({ ...prev, error: '' }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleUpdateBudget();
    if (e.key === 'Escape') handleCancel();
  };

  const handleCreateKeyPress = (e) => {
    if (e.key === 'Enter') createBudget();
    if (e.key === 'Escape') handleCreateCancel();
  };

  // Show "Create Budget" button to start the process
  const handleStartCreate = () => {
    setCreateState(prev => ({ ...prev, isCreating: true }));
    setUiState(prev => ({ ...prev, error: '' }));
  };

  if (uiState.isLoading) {
    return (
      <Card className="w-full shadow-sm p-3">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (uiState.error && !budgetData.exists && !createState.isCreating) {
    return (
      <Card className="w-full shadow-sm p-3">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-2">{uiState.error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchBudgetData}
              className="text-xs"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!budgetData.exists) {
    return (
      <Card className="w-full shadow-sm p-3">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center w-full">
            {uiState.error && (
              <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded">
                {uiState.error}
              </div>
            )}
            
            {createState.isCreating ? (
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">Create Your Budget</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm">$</span>
                    <Input
                      ref={createInputRef}
                      type="number"
                      value={createState.createAmount}
                      onChange={(e) => setCreateState(prev => ({ ...prev, createAmount: e.target.value }))}
                      onKeyDown={handleCreateKeyPress}
                      className="w-24 h-8 text-sm px-2"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      disabled={createState.isSubmitting}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={createBudget}
                    className="h-8 w-8"
                    disabled={createState.isSubmitting}
                  >
                    {createState.isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border border-green-600 border-t-transparent"></div>
                    ) : (
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCreateCancel}
                    className="h-8 w-8"
                    disabled={createState.isSubmitting}
                  >
                    <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-muted-foreground mb-3">No budget found</p>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="text-xs"
                  onClick={handleStartCreate}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Budget
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-sm p-3 transition-all duration-200 hover:shadow-md">
      {uiState.error && (
        <div className="mb-2 p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded">
          {uiState.error}
        </div>
      )}
      
      <CardHeader className="pb-0 pt-1 px-0">
        <CardTitle className="text-base font-semibold">
          Monthly Budget (Default Account)
        </CardTitle>

        <div className="flex items-center gap-2">
          {editState.isEditing ? (
            <div className="flex items-center gap-1">
              <Input
                ref={inputRef}
                type="number"
                value={editState.newAmount}
                onChange={(e) => setEditState(prev => ({ ...prev, newAmount: e.target.value }))}
                onKeyDown={handleKeyPress}
                className="w-20 h-6 text-sm px-1"
                placeholder="Enter amount"
                min="0"
                step="0.01"
                disabled={editState.isUpdating}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUpdateBudget}
                className="h-6 w-6"
                disabled={editState.isUpdating}
              >
                {editState.isUpdating ? (
                  <div className="animate-spin rounded-full h-3 w-3 border border-green-600 border-t-transparent"></div>
                ) : (
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="h-6 w-6"
                disabled={editState.isUpdating}
              >
                <X className="h-4 w-4 text-red-600 dark:text-red-400" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 mt-1">
              <CardDescription className="text-xs">
                ${budgetData.spent.toFixed(2)} of ${budgetData.amount.toFixed(2)} spent
              </CardDescription>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditState(prev => ({ ...prev, isEditing: true }))}
                className="h-4 w-5 ml-0.5"
              >
                <Pencil className="h-4 w-3 text-muted-foreground" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-0 px-0">
        <div className="relative">
          <Progress
            value={Math.min(percentUsed, 100)}
            className={`w-full h-1 rounded-full transition-all duration-500 ${getProgressColorClass()}`}
          />
          {percentUsed > 100 && (
            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse" />
          )}
        </div>

        <div className="flex justify-end mt-1">
          <p className="text-xs text-muted-foreground">
            <span className={`font-semibold ${getProgressColorClass()}`}>
              {percentUsed.toFixed(1)}%
            </span>{' '}
            used
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1 pt-2 mt-2 border-t border-border">
          <div className="text-center">
            <p className="text-sm font-bold">${budgetData.spent.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Spent</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold">${remaining.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetCard;
