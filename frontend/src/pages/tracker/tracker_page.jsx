import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Navbar from '@/components/navbar';
import BudgetCard from './budget_card';
import AccountCards from './account_card';
import { useTracker } from '@/contexts/tracker-context';

const Tracker = () => {
  const {
    accountsState,
    recentTransactions,
    pieChartData,
    COLORS,
    handleAccountSelection,
    formatDate,
  } = useTracker();

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-4 space-y-4">
        <BudgetCard />

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="shadow-sm p-3 transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-2 pt-1 px-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
                {accountsState.selectedId && (
                  <Select value={accountsState.selectedId.toString()} onValueChange={handleAccountSelection}>
                    <SelectTrigger className="w-56 h-7 text-xs">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountsState.list.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-0 px-0">
              <div className="space-y-3">
                {recentTransactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4 text-xs">
                    No recent transactions
                  </p>
                ) : (
                  recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium leading-none">
                          {transaction.description || 'Untitled Transaction'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <div
                          className={`flex items-center text-xs font-medium ${
                            transaction.type === 'EXPENSE' ? 'text-red-500' : 'text-green-500'
                          }`}
                        >
                          {transaction.type === 'EXPENSE' ? (
                            <ArrowDownRight className="mr-1 h-3 w-3" />
                          ) : (
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                          )}
                          ${transaction.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm p-3 transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-2 pt-1 px-0">
              <CardTitle className="text-base font-semibold">Monthly Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-0 px-0">
              {pieChartData.length === 0 ? (
                <p className="text-center text-muted-foreground py-4 text-xs">
                  No expenses this month
                </p>
              ) : (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => `$${value.toFixed(2)}`}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                          fontSize: '12px',
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '11px' }}
                        formatter={(value) => <span style={{ fontSize: '11px' }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* <AccountCards /> */}
      </div>
    </>
  );
};

export default Tracker;
