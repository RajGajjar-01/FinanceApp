import Navbar from '@/components/navbar';
import React from 'react';
import PortfolioSummary from './portfolio-summary';
import PortfolioReturn from './portfolio-returns';
import MyPortfolioCard from './portfolio-card';
import MyWatchlistCard from './watchlist-card';
import MarketCard from './market-card';

const Dashboard = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-4 space-y-4">

        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-12 gap-4 max-w-full mx-auto">
          <section className="lg:col-span-1 xl:col-span-4">
            <PortfolioSummary />
          </section>
          <section className="lg:col-span-1 xl:col-span-5">
            <PortfolioReturn />
          </section>
          <section className="lg:col-span-1 xl:col-span-3">
            <div className="h-[280px] bg-card border border-border rounded-lg p-4 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Content coming soon...</p>
            </div>
          </section>
        </div>


        <div className="grid grid-cols-1 xl:grid-cols-10 gap-4 max-w-full mx-auto">

          <section className="xl:col-span-6">
            <MyPortfolioCard />
          </section>
          

          <section className="xl:col-span-4">
            <MyWatchlistCard />
          </section>
        </div>


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