import Navbar from '@/components/navbar';
import React from 'react';
import PortfolioSummary from './portfolio-summary';
import PortfolioReturn from './portfolio-returns';
import TransactionOrderCard from './transaction-order';
import PurchaseQuantityCard from './purchase-quantity';
import MyPortfolioCard from './portfolio-card';
import MyWatchlistCard from './watchlist-card';
import MarketCard from './market-card';

const Dashboard = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-4 space-y-4">
        {/* First Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-12 gap-4 max-w-full mx-auto">
          <section className="lg:col-span-1 xl:col-span-4">
            <PortfolioSummary />
          </section>
          <section className="lg:col-span-1 xl:col-span-5">
            <PortfolioReturn />
          </section>
          <section className="lg:col-span-1 xl:col-span-3">
            <div className="space-y-4">
              <TransactionOrderCard />
              <PurchaseQuantityCard />
            </div>
          </section>
        </div>

        {/* Second Row - Portfolio and Watchlist Cards (70% / 30% width) */}
        <div className="grid grid-cols-1 xl:grid-cols-10 gap-4 max-w-full mx-auto">
          {/* My Portfolio Card (70% width) */}
          <section className="xl:col-span-6">
            <MyPortfolioCard />
          </section>
          
          {/* My Watchlist Card (30% width) */}
          <section className="xl:col-span-4">
            <MyWatchlistCard />
          </section>
        </div>

        {/* Third Row - Market Section (Full Width) */}
        <div className="w-full max-w-full mx-auto">
          <section className="w-full">
            <MarketCard />
          </section>
        </div>
      </div>
    </>
  );
};

export default Dashboard;