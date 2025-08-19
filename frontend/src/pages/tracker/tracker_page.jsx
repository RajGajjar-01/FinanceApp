import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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

import { useAuth } from '@/contexts/auth-context';
import BudgetCard from './budget_card';
import AccountCards from './account_card';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9FA8DA'];

const dummyPieChartData = [
  { name: 'rental', value: 1500 },
  { name: 'entertainment', value: 304.33 },
  { name: 'shopping', value: 1161.13 },
  { name: 'travel', value: 1251.66 },
];

const dummyTransactions = [
  {
    id: 1,
    description: 'Flat Rent (Recurring)',
    amount: 1500.0,
    type: 'EXPENSE',
    date: '2024-12-12',
    category: 'rental',
  },
  {
    id: 2,
    description: 'Netflix (Recurring)',
    amount: 10.0,
    type: 'EXPENSE',
    date: '2024-12-08',
    category: 'entertainment',
  },
  {
    id: 3,
    description: 'Received salary',
    amount: 5549.52,
    type: 'INCOME',
    date: '2024-12-05',
    category: 'salary',
  },
  {
    id: 4,
    description: 'Paid for shopping',
    amount: 157.21,
    type: 'EXPENSE',
    date: '2024-12-05',
    category: 'shopping',
  },
  {
    id: 5,
    description: 'Paid for shopping',
    amount: 418.58,
    type: 'EXPENSE',
    date: '2024-12-04',
    category: 'shopping',
  },
  {
    id: 6,
    description: 'Entertainment expense',
    amount: 304.33,
    type: 'EXPENSE',
    date: '2024-12-03',
    category: 'entertainment',
  },
  {
    id: 7,
    description: 'Travel expense',
    amount: 1251.86,
    type: 'EXPENSE',
    date: '2024-12-02',
    category: 'travel',
  },
];

const dummyAccountsData = [
  { id: 1, name: 'personal', balance: 152124.4, type: 'Savings', isDefault: true },
  { id: 2, name: 'business', balance: 0, type: 'Current', isDefault: false },
  { id: 3, name: 'work', balance: 5941.0, type: 'Current', isDefault: false },
];

const Tracker = () => {
  const [budget, setBudget] = useState(7000);
  const [spent] = useState(5679.12);
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budget.toString());
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  const { axiosPrivate } = useAuth();

  const [accounts, setAccounts] = useState(dummyAccountsData);
  const [selectedAccountId, setSelectedAccountId] = useState(
    dummyAccountsData.find((a) => a.isDefault)?.id || dummyAccountsData[0]?.id
  );

  const [editingAccountId, setEditingAccountId] = useState(null);
  const [editingAccountName, setEditingAccountName] = useState('');

  const percentUsed = (spent / budget) * 100;
  const getProgressColorClass = () => {
    if (percentUsed >= 90) return '[&>div]:bg-red-500';
    if (percentUsed >= 75) return '[&>div]:bg-yellow-500';
    return '[&>div]:bg-green-500';
  };

  const accountTransactions = dummyTransactions;

  const recentTransactions = accountTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const currentDate = new Date();
  const currentMonthExpenses = accountTransactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      t.type === 'EXPENSE' &&
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const expensesByCategory = currentMonthExpenses.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += transaction.amount;
    return acc;
  }, {});

  const pieChartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  const handleAccountSelection = (accountId) => {
    const id = parseInt(accountId);
    setSelectedAccountId(id);

    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id ? { ...acc, isDefault: true } : { ...acc, isDefault: false }
      )
    );
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

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
                <Select value={selectedAccountId.toString()} onValueChange={handleAccountSelection}>
                  <SelectTrigger className="w-56 h-7 text-xs">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              {dummyPieChartData.length === 0 ? (
                <p className="text-center text-muted-foreground py-4 text-xs">
                  No expenses this month
                </p>
              ) : (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dummyPieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                      >
                        {dummyPieChartData.map((entry, index) => (
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
