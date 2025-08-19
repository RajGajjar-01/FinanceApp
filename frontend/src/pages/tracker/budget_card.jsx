import { useRef, useEffect } from 'react';
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
import { useTracker } from '@/contexts/tracker-context';

const BudgetCard = () => {
  const {
    budget,
    percentUsed,
    fetchBudgetData,
    createBudget,
    updateBudget,
    startEditingBudget,
    cancelEditingBudget,
    startCreatingBudget,
    cancelCreatingBudget,
    updateBudgetCreateAmount,
    updateBudgetEditAmount,
  } = useTracker();

  const inputRef = useRef(null);
  const createInputRef = useRef(null);

  useEffect(() => {
    if (budget.edit.isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [budget.edit.isEditing]);

  useEffect(() => {
    if (budget.create.isCreating && createInputRef.current) {
      createInputRef.current.focus();
    }
  }, [budget.create.isCreating]);

  const handleCreateBudget = async () => {
    await createBudget(budget.create.createAmount);
  };

  const handleUpdateBudget = async () => {
    await updateBudget(budget.edit.newAmount);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleUpdateBudget();
    if (e.key === 'Escape') cancelEditingBudget();
  };

  const handleCreateKeyPress = (e) => {
    if (e.key === 'Enter') handleCreateBudget();
    if (e.key === 'Escape') cancelCreatingBudget();
  };

  const getProgressColorClass = () => {
    if (percentUsed >= 90) return 'text-red-600 dark:text-red-400';
    if (percentUsed >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const remaining = budget.data.amount - budget.data.spent;

  if (budget.ui.isLoading) {
    return (
      <Card className="w-full shadow-sm p-3">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (budget.ui.error && !budget.data.exists && !budget.create.isCreating) {
    return (
      <Card className="w-full shadow-sm p-3">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-2">{budget.ui.error}</p>
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

  if (!budget.data.exists) {
    return (
      <Card className="w-full shadow-sm p-3">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center w-full">
            {budget.ui.error && (
              <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded">
                {budget.ui.error}
              </div>
            )}
            
            {budget.create.isCreating ? (
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">Create Your Budget</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm">$</span>
                    <Input
                      ref={createInputRef}
                      type="number"
                      value={budget.create.createAmount}
                      onChange={(e) => updateBudgetCreateAmount(e.target.value)}
                      onKeyDown={handleCreateKeyPress}
                      className="w-24 h-8 text-sm px-2"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      disabled={budget.create.isSubmitting}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCreateBudget}
                    className="h-8 w-8"
                    disabled={budget.create.isSubmitting}
                  >
                    {budget.create.isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border border-green-600 border-t-transparent"></div>
                    ) : (
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={cancelCreatingBudget}
                    className="h-8 w-8"
                    disabled={budget.create.isSubmitting}
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
                  onClick={startCreatingBudget}
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
      {budget.ui.error && (
        <div className="mb-2 p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded">
          {budget.ui.error}
        </div>
      )}
      
      <CardHeader className="pb-0 pt-1 px-0">
        <CardTitle className="text-base font-semibold">
          Monthly Budget (Default Account)
        </CardTitle>

        <div className="flex items-center gap-2">
          {budget.edit.isEditing ? (
            <div className="flex items-center gap-1">
              <Input
                ref={inputRef}
                type="number"
                value={budget.edit.newAmount}
                onChange={(e) => updateBudgetEditAmount(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-20 h-6 text-sm px-1"
                placeholder="Enter amount"
                min="0"
                step="0.01"
                disabled={budget.edit.isUpdating}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUpdateBudget}
                className="h-6 w-6"
                disabled={budget.edit.isUpdating}
              >
                {budget.edit.isUpdating ? (
                  <div className="animate-spin rounded-full h-3 w-3 border border-green-600 border-t-transparent"></div>
                ) : (
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={cancelEditingBudget}
                className="h-6 w-6"
                disabled={budget.edit.isUpdating}
              >
                <X className="h-4 w-4 text-red-600 dark:text-red-400" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 mt-1">
              <CardDescription className="text-xs">
                ${budget.data.spent.toFixed(2)} of ${budget.data.amount.toFixed(2)} spent
              </CardDescription>
              <Button
                variant="ghost"
                size="icon"
                onClick={startEditingBudget}
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
            <p className="text-sm font-bold">${budget.data.spent.toFixed(2)}</p>
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
