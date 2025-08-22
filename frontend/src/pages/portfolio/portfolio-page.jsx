import Navbar from '@/components/navbar';
import React from 'react';
import SectorBarChart from './sector-chart';
import PortfolioHoldingsTable from './portfolio-holdings-table';
import WishlistTable from './wishlist-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Portfolio = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-4 space-y-4">
        {/* Portfolio Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card p-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Value</CardTitle>
              <CardDescription>Current portfolio value</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-card-foreground">$125,430.50</p>
              <p className="text-sm text-green-600 dark:text-green-400">+$2,450.30 (+2.0%)</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card p-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Invested</CardTitle>
              <CardDescription>Amount invested</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-card-foreground">$98,750.00</p>
              <p className="text-sm text-muted-foreground">$26,680.50 gain</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card p-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Holdings</CardTitle>
              <CardDescription>Number of positions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-card-foreground">24</p>
              <p className="text-sm text-muted-foreground">Across 6 sectors</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Portfolio Holdings Table - 2/3 width */}
          <div className="xl:col-span-2">
            <PortfolioHoldingsTable />
          </div>
          
          {/* Right Sidebar - 1/3 width */}
          <div className="space-y-4">
            {/* Sector Chart */}
            <SectorBarChart />
            
            {/* Wishlist Table */}
            <WishlistTable />
          </div>
        </div>
      </div>
    </>
  );
};

export default Portfolio;
