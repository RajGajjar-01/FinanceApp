import React, { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, Calendar, Tag, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/navbar';
import BudgetCard from './budget_card';
import { useTracker } from '@/contexts/tracker-context';
import AccountCards from './account_card';

const TransactionCard = React.memo(() => {
  const { recentTransactions, formatDate, transactionsState } = useTracker();

  const limitedTransactions = useMemo(() => 
    recentTransactions.slice(0, 3), 
    [recentTransactions]
  );

  const handleShowAll = () => {
    console.log('Navigate to full transactions page');
  };

  return (
    <Card className="shadow-sm p-3 transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2 pt-1 px-0">
        <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-0 px-0">
        {transactionsState.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
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
                      {formatDate(transaction.date)}
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
                    transaction.type === 'EXPENSE' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
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

const ExpenseChart = React.memo(() => {
  const { pieChartData, COLORS } = useTracker();

  const tooltipFormatter = (value, name) => [
    `$${Number(value).toFixed(2)}`,
    name.charAt(0).toUpperCase() + name.slice(1)
  ];

  return (
    <Card className="shadow-sm p-3 transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2 pt-1 px-0">
        <CardTitle className="text-base font-semibold">Monthly Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-0 px-0">
        {pieChartData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-xs">No expenses this month</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={tooltipFormatter}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {pieChartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="capitalize font-medium">{entry.name}</span>
                  </div>
                  <span className="font-semibold">${entry.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

const Tracker = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-4 space-y-4">
        <BudgetCard />
        <div className="grid gap-4 md:grid-cols-2">
          <TransactionCard />
          <ExpenseChart />
        </div>
        <AccountCards />
      </div>
    </>
  );
};

export default Tracker;
