import Navbar from '@/components/navbar';
import React from 'react';
import SectorBarChart from './sector-chart';
import PortfolioHoldingsTable from './portfolio-holdings-table';
import WishlistTable from './wishlist-table';
import PortfolioPerformanceChart from './portfolio-performance-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Activity } from 'lucide-react';

const Portfolio = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-4 space-y-6">
        {/* Enhanced Portfolio Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card p-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-card-foreground">Total Value</CardTitle>
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <CardDescription>Current portfolio value</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-card-foreground">$125,430.50</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <p className="text-sm text-green-600 dark:text-green-400">+$2,450.30 (+2.0%)</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card p-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-card-foreground">Total Invested</CardTitle>
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
              <CardDescription>Amount invested</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-card-foreground">$98,750.00</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <p className="text-sm text-green-600 dark:text-green-400">$26,680.50 gain</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card p-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-card-foreground">Holdings</CardTitle>
                <BarChart3 className="h-5 w-5 text-purple-500" />
              </div>
              <CardDescription>Number of positions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-card-foreground">24</p>
              <p className="text-sm text-muted-foreground mt-2">Across 6 sectors</p>
            </CardContent>
          </Card>

          <Card className="bg-card p-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-card-foreground">YTD Return</CardTitle>
                <Activity className="h-5 w-5 text-orange-500" />
              </div>
              <CardDescription>Year to date performance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-card-foreground">+18.5%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <p className="text-sm text-green-600 dark:text-green-400">+$19,245.30</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Performance Chart - Full Width */}
        <div className="w-full">
          <PortfolioPerformanceChart />
        </div>

        {/* Main Content Grid - Enhanced Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Portfolio Holdings Table - 2/4 width */}
          <div className="xl:col-span-2">
            <PortfolioHoldingsTable />
          </div>
          
          {/* Right Sidebar - 2/4 width with better organization */}
          <div className="xl:col-span-2 space-y-6">
            {/* Sector Allocation Chart */}
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
