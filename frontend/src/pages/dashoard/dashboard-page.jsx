import Navbar from '@/components/navbar';
import React from 'react';
import PortfolioSummary from './portfolio-summary';
import PortfolioReturn from './portfolio-returns';
import TransactionOrderCard from './transaction-order';

const Dashboard = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 w-full lg:grid-cols-3 gap-2">
          <PortfolioSummary />
          <PortfolioReturn />
          {/* <TransactionOrderCard /> */}
        </div>
      </div>
    </>
  );
};

export default Dashboard;