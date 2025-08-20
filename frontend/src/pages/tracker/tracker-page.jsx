import React from 'react';
import Navbar from '@/components/navbar';
import BudgetCard from './budget-card';
import TransactionCard from './transaction-card';
import ExpenseChart from './expense-chart';
import AccountCards from './account-card';
import { useTracker } from '@/contexts/tracker-context';
import { useEffect } from 'react';

const Tracker = () => {
  const {fetchBudgetData, fetchTransactions, fetchAccounts} = useTracker();
  useEffect(() => {
    const initialize = async () => {
      await Promise.allSettled([
        fetchAccounts(),
        fetchBudgetData(),
        fetchTransactions()
      ]);
    };
    
  initialize();
  }, []);
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
