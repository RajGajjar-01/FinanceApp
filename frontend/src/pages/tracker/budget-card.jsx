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
import { Check, X, Pencil, Plus, Loader2 } from 'lucide-react';
import { useTracker } from '@/contexts/tracker-context';

const BudgetCard = () => {
  const {
    budget,
    percentUsed,
    createBudget,
    updateBudget,
    startEditingBudget,
    cancelEditingBudget,
    startCreatingBudget,
    cancelCreatingBudget,
    updateBudgetCreateAmount,
    updateBudgetEditAmount,
  } = useTracker();

  const editInputRef = useRef(null);
  const createInputRef = useRef(null);

  useEffect(() => {
    if (budget.edit.isEditing) editInputRef.current?.focus();
    if (budget.create.isCreating) createInputRef.current?.focus();
  }, [budget.edit.isEditing, budget.create.isCreating]);

  const handleKeyPress = (e, confirm, cancel) => {
    if (e.key === 'Enter') confirm();
    if (e.key === 'Escape') cancel();
  };

  const getProgressColor = () => {
    if (percentUsed >= 90) return 'text-red-600';
    if (percentUsed >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const ActionButtons = ({ onConfirm, onCancel, isLoading }) => (
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" onClick={onConfirm} className="h-8 w-8" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-600" />}
      </Button>
      <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8" disabled={isLoading}>
        <X className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );

  // Loading state
  if (budget.ui.isLoading) {
    return (
      <Card className="w-full shadow-sm p-3">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Card>
    );
  }

  // Error state (no budget exists)
  if (budget.ui.error && !budget.data.exists && !budget.create.isCreating) {
    return (
      <Card className="w-full shadow-sm p-3">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <p className="text-red-600 mb-2">{budget.ui.error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No budget exists - create new budget
  if (!budget.data.exists) {
    return (
      <Card className="w-full shadow-sm p-3">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center w-full">
            {budget.ui.error && (
              <div className="mb-2 p-2 bg-red-100 text-red-600 text-xs rounded">
                {budget.ui.error}
              </div>
            )}
            
            {budget.create.isCreating ? (
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">Create Your Budget</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm">$</span>
                  <Input
                    ref={createInputRef}
                    type="number"
                    value={budget.create.createAmount}
                    onChange={(e) => updateBudgetCreateAmount(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, 
                      () => createBudget(budget.create.createAmount), 
                      cancelCreatingBudget
                    )}
                    className="w-24 h-8 text-sm"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    disabled={budget.create.isSubmitting}
                  />
                  <ActionButtons 
                    onConfirm={() => createBudget(budget.create.createAmount)}
                    onCancel={cancelCreatingBudget}
                    isLoading={budget.create.isSubmitting}
                  />
                </div>
              </div>
            ) : (
              <div>
                <p className="text-muted-foreground mb-3">No budget found</p>
                <Button variant="default" size="sm" onClick={startCreatingBudget}>
                  <Plus className="h-4 w-4 mr-1" />Create Budget
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const remaining = budget.data.amount - budget.data.spent;
  const progressColor = getProgressColor();

  return (
    <Card className="w-full shadow-sm p-3 hover:shadow-md transition-shadow">
      {budget.ui.error && (
        <div className="mb-2 p-2 bg-red-100 text-red-600 text-xs rounded">
          {budget.ui.error}
        </div>
      )}
      
      <CardHeader className="pb-0 pt-1 px-0">
        <CardTitle className="text-base font-semibold">Monthly Budget</CardTitle>
        
        <div className="flex items-center gap-2">
          {budget.edit.isEditing ? (
            <div className="flex items-center gap-1">
              <Input
                ref={editInputRef}
                type="number"
                value={budget.edit.newAmount}
                onChange={(e) => updateBudgetEditAmount(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, 
                  () => updateBudget(budget.edit.newAmount), 
                  cancelEditingBudget
                )}
                className="w-20 h-6 text-sm"
                min="0"
                step="0.01"
                disabled={budget.edit.isUpdating}
              />
              <ActionButtons 
                onConfirm={() => updateBudget(budget.edit.newAmount)}
                onCancel={cancelEditingBudget}
                isLoading={budget.edit.isUpdating}
              />
            </div>
          ) : (
            <div className="flex items-center gap-1 mt-1">
              <CardDescription className="text-xs">
                ${budget.data.spent.toFixed(2)} of ${budget.data.amount.toFixed(2)} spent
              </CardDescription>
              <Button variant="ghost" size="icon" onClick={startEditingBudget} className="h-4 w-5">
                <Pencil className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-0 px-0">
        <div className="relative">
          <Progress value={Math.min(percentUsed, 100)} className="w-full h-1" />
          {percentUsed > 100 && (
            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse" />
          )}
        </div>

        <div className="flex justify-end mt-1">
          <p className="text-xs text-muted-foreground">
            <span className={`font-semibold ${progressColor}`}>
              {percentUsed.toFixed(1)}%
            </span> used
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1 pt-2 mt-2 border-t">
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