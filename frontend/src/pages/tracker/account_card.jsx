import React, { memo, useCallback, useState, useRef, useEffect } from 'react';
import { Pencil, Check, X, ArrowUpRight, ArrowDownRight, Building2, Plus, AlertCircle } from 'lucide-react';
import CreateAccountForm from './create_account_form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useTracker } from '@/contexts/tracker-context';

const AccountCard = memo(({ 
  account, isEditing, editingName, onStartEdit, onCancelEdit, onSaveEdit, 
  onNameChange, onDefaultChange, accountTransactions 
}) => {
  const inputRef = useRef(null);
  useEffect(() => { if (isEditing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); } }, [isEditing]);
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') onSaveEdit(account.id, editingName);
    else if (e.key === 'Escape') onCancelEdit();
  }, [account.id, editingName, onSaveEdit, onCancelEdit]);
  const handleSave = useCallback(() => onSaveEdit(account.id, editingName), [account.id, editingName, onSaveEdit]);
  const handleDefaultToggle = useCallback(() => onDefaultChange(account.id), [account.id, onDefaultChange]);
  const currentMonthIncome = accountTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const currentMonthExpense = accountTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-200 group relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {isEditing ? (
          <div className="flex items-center gap-2 w-full">
            <Input
              ref={inputRef}
              value={editingName}
              onChange={e => onNameChange(e.target.value)}
              className="text-sm font-medium h-7 flex-1"
              onKeyDown={handleKeyDown}
              placeholder="Account name"
              maxLength={50}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={handleSave}
              disabled={!editingName.trim()}
              aria-label="Save account name"
            >
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={onCancelEdit}
              aria-label="Cancel editing"
            >
              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <CardTitle className="text-sm font-medium capitalize truncate">
                {account.name || 'Unnamed Account'}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 sm:opacity-100"
                onClick={() => onStartEdit(account.id, account.name)}
                aria-label={`Edit ${account.name || 'account'}`}
              >
                <Pencil className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
              </Button>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {account.isDefault && (
                <Badge variant="secondary" className="text-xs hidden sm:inline-flex">Default</Badge>
              )}
              <Switch
                checked={account.isDefault || false}
                onCheckedChange={handleDefaultToggle}
                aria-label={`Set ${account.name || 'account'} as default`}
              />
            </div>
          </>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <div className="text-xl sm:text-2xl font-bold">
            ${(account.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          {account.balance < 0 && (
            <AlertCircle className="h-4 w-4 text-red-500" aria-label="Negative balance" />
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {account.type ? `${account.type.charAt(0).toUpperCase()}${account.type.slice(1).toLowerCase()} Account` : 'Account'}
          </p>
          <Badge variant="outline" className="text-xs">{accountTransactions.length} txns</Badge>
        </div>
        {account.isDefault && (
          <Badge variant="secondary" className="text-xs sm:hidden w-fit">Default Account</Badge>
        )}
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground pt-2">
        <div className="flex items-center gap-1">
          <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          <span className="text-xs">
            +${currentMonthIncome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
          <span className="text-xs">
            -${currentMonthExpense.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
});
AccountCard.displayName = 'AccountCard';

const AddAccountCard = memo(({ onAccountCreate, isCreating }) => (
  <CreateAccountForm onAccountCreate={onAccountCreate}>
    <Card className={`shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border-dashed ${isCreating ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex flex-col items-center justify-center h-[120px] sm:h-[140px] p-3">
        <div className="text-2xl sm:text-3xl text-muted-foreground mb-2">
          {isCreating ? (
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary" />
          ) : (
            <Plus className="h-6 w-6 sm:h-8 sm:w-8" />
          )}
        </div>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground text-center">
          {isCreating ? 'Creating...' : 'Add Account'}
        </p>
      </div>
    </Card>
  </CreateAccountForm>
));
AddAccountCard.displayName = 'AddAccountCard';

const EmptyStateCard = memo(() => (
  <Card className="col-span-1 sm:col-span-3 shadow-sm">
    <CardContent className="flex flex-col items-center justify-center h-[120px] sm:h-[140px] p-4 sm:p-6">
      <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mb-2" />
      <p className="text-xs sm:text-sm text-muted-foreground text-center">
        No accounts yet. Create your first account to get started.
      </p>
    </CardContent>
  </Card>
));
EmptyStateCard.displayName = 'EmptyStateCard';

const AccountCardSkeleton = memo(() => (
  <Card className="shadow-sm">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20 sm:w-24" />
        <Skeleton className="h-4 w-6 sm:w-8" />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 mb-2" />
      <Skeleton className="h-3 w-12 sm:w-16" />
    </CardContent>
    <CardFooter>
      <div className="flex justify-between w-full">
        <Skeleton className="h-3 w-8 sm:w-12" />
        <Skeleton className="h-3 w-8 sm:w-12" />
      </div>
    </CardFooter>
  </Card>
));
AccountCardSkeleton.displayName = 'AccountCardSkeleton';

const AccountCards = memo(() => {
  const {
    accountsState,
    addAccount,
    updateAccount,
    handleAccountSelection,
    startEditingAccount,
    cancelEditingAccount,
    updateAccountEditingName,
    transactionsState,
    fetchAccounts
  } = useTracker();

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const handleAccountCreate = useCallback(async (accountData) => {
    if (!accountData?.name?.trim()) {
      setError('Account name is required');
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      const result = await addAccount({ ...accountData, name: accountData.name.trim() });
      if (!result.success) throw new Error(result.error || 'Failed to create account');
      if (accountsState.list.length === 0 && result.account) handleAccountSelection(result.account.id);
    } catch (err) {
      setError(err.message || 'Failed to create account');
      console.error('Account creation error:', err);
    } finally {
      setIsCreating(false);
    }
  }, [addAccount, accountsState.list.length, handleAccountSelection]);

  const handleStartEdit = useCallback((accountId, accountName) => {
    startEditingAccount(accountId, accountName || '');
  }, [startEditingAccount]);

  const handleSaveEdit = useCallback(async (accountId, newName) => {
    if (!newName?.trim()) {
      setError('Account name cannot be empty');
      return;
    }
    try {
      const result = await updateAccount(accountId, { name: newName.trim() });
      if (!result.success) throw new Error(result.error || 'Failed to update account');
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to update account');
      console.error('Account update error:', err);
    }
  }, [updateAccount]);

  useEffect(()=>{
    
  }, [fetchAccounts])

  const handleDefaultChange = useCallback(async (accountId) => {
    try {
      handleAccountSelection(accountId);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to set default account');
      console.error('Default account error:', err);
    }
  }, [handleAccountSelection]);

  const getAccountTransactions = useCallback(
    (accountId) => transactionsState.list.filter(transaction => transaction.accountId === accountId),
    [transactionsState.list]
  );

  const handleRetry = useCallback(() => {
    setError(null);
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (accountsState.list === undefined) {
    return (
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <AccountCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <AddAccountCard onAccountCreate={handleAccountCreate} isCreating={isCreating} />
        {accountsState.list.length === 0 && !isCreating && <EmptyStateCard />}
        {accountsState.list.length > 0 && accountsState.list.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            isEditing={accountsState.editingId === account.id}
            editingName={accountsState.editingName}
            onStartEdit={handleStartEdit}
            onCancelEdit={cancelEditingAccount}
            onSaveEdit={handleSaveEdit}
            onNameChange={updateAccountEditingName}
            onDefaultChange={handleDefaultChange}
            accountTransactions={getAccountTransactions(account.id)}
          />
        ))}
      </div>
    </div>
  );
});
AccountCards.displayName = 'AccountCards';
export default AccountCards;
