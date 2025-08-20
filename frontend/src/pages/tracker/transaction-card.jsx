import React from 'react';
import { ArrowUpRight, ArrowDownRight, Calendar, Tag, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTracker } from '@/contexts/tracker-context';
import { useNavigate } from 'react-router';

const TransactionCard = React.memo(() => {
  const { 
    recentTransactions, 
    transactionsState,
    selectedAccount
  } = useTracker();
  const navigate = useNavigate();

  const handleShowAll = () => {
    console.log('Navigate to full transactions page');
    navigate('/transactions');
  };

  const limitedTransactions = recentTransactions.slice(0, 3);

  return (
    <Card className="shadow-sm p-3 transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2 pt-1 px-0">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
          {selectedAccount && (
            <Badge variant="secondary" className="text-xs">
              {selectedAccount.name}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-0 px-0">
        {transactionsState.ui.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : transactionsState.ui.error ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 text-xs">Network error</p>
          </div>
        ) : limitedTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-xs">No recent transactions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {limitedTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-start justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">
                      {transaction.description || 'Untitled Transaction'}
                    </p>
                    {transaction.status && transaction.status !== 'COMPLETED' && (
                      <Badge variant="secondary" className="text-xs">
                        {transaction.status}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {transaction.date}
                    </div>
                    
                    {transaction.category && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <Badge variant="outline" className="text-xs capitalize">
                          {transaction.category}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {transaction.isRecurring && (
                    <Badge variant="secondary" className="text-xs">
                      Recurring {transaction.recurringInterval && `(${transaction.recurringInterval})`}
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-1 ml-4">
                  <div className={`flex items-center text-sm font-semibold ${
                    transaction.type === 'EXPENSE' ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'
                  }`}>
                    {transaction.type === 'EXPENSE' ? (
                      <ArrowDownRight className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                    )}
                    <span>
                      {transaction.type === 'EXPENSE' ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </div>
                  
                  <span className="text-xs text-muted-foreground capitalize">
                    {transaction.type.toLowerCase()}
                  </span>
                </div>
              </div>
            ))}
            
            {recentTransactions.length > 3 && (
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleShowAll}
                  className="w-full text-xs h-8"
                >
                  Show All
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default TransactionCard;
