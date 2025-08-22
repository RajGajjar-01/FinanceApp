import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { myPortfolioData, portfolioTabs } from './PortfoliodummyData';

// Tab Button Component
const TabButton = ({ tab, isActive, onClick }) => (
  <button
    onClick={() => onClick(tab.key)}
    className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs rounded transition-all ${
      isActive 
        ? 'bg-primary text-primary-foreground' 
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    }`}
    aria-pressed={isActive}
  >
    {tab.label}
  </button>
);

// Stock Row Component - Responsive
const StockRow = ({ stock, index, isLast }) => {
  const isPositive = stock.change >= 0;
  
  return (
    <div className={`py-2 ${!isLast ? 'border-b border-border' : ''}`}>
      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center justify-between">
        {/* Company Info */}
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-foreground">
              {stock.id.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground" title={stock.name}>
              {stock.name}
            </p>
          </div>
        </div>

        {/* Stock Data */}
        <div className="flex items-center space-x-5 text-sm flex-shrink-0">
          {/* Shares */}
          <div className="text-center min-w-[60px]">
            <p className="text-xs mb-0.5 text-muted-foreground">Share amount</p>
            <p className="font-medium text-foreground">{stock.shares}</p>
          </div>

          {/* Price */}
          <div className="text-center min-w-[80px]">
            <p className="text-xs mb-0.5 text-muted-foreground">Price</p>
            <p className="font-medium text-foreground">${stock.price}</p>
          </div>

          {/* Change */}
          <div className="text-center min-w-[50px] mr-6">
            <p className="text-xs mb-0.5 text-muted-foreground">Change</p>
            <p className={`font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? '+' : ''}{stock.change.toFixed(2)}%
            </p>
          </div>

          {/* Current Value */}
          <div className="text-center  min-w-[100px]">
            <p className="text-xs mb-0.5 text-muted-foreground">Current Value</p>
            <p className="font-medium text-foreground">${stock.currentValue}</p>
          </div>
        </div>
      </div>

      {/* Tablet Layout */}
      <div className="hidden md:flex lg:hidden flex-col space-y-2">
        {/* Row 1: Company Info and Current Value */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-foreground">
                {stock.id.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate" title={stock.name}>
                {stock.name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-foreground font-medium">${stock.currentValue}</p>
            <p className={`text-xs font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? '+' : ''}{stock.change.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Row 2: Shares and Price */}
        <div className="flex justify-between text-xs">
          <div>
            <span className="text-muted-foreground">Shares: </span>
            <span className="text-foreground">{stock.shares}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Price: </span>
            <span className="text-foreground">${stock.price}</span>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex md:hidden flex-col space-y-2">
        {/* Row 1: Company Info */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-foreground">
              {stock.id.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate" title={stock.name}>
              {stock.name}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? '+' : ''}{stock.change.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Row 2: Details */}
        <div className="grid grid-cols-3 gap-2 text-xs pl-8">
          <div>
            <span className="text-muted-foreground block">Shares</span>
            <span className="text-foreground">{stock.shares}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Price</span>
            <span className="text-foreground">${stock.price}</span>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground block">Value</span>
            <span className="text-foreground">${stock.currentValue}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component - Responsive
const MyPortfolioCard = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  // Get the maximum number of rows for consistent height
  const maxRows = myPortfolioData.length;
  
  // Filter data based on active tab
  const filteredData = myPortfolioData.filter(stock => {
    switch (activeTab) {
      case 'gainers':
        return stock.change > 0;
      case 'decliners':
        return stock.change < 0;
      case 'see-all':
      default:
        return true;
    }
  });

  // Calculate empty rows needed to maintain height (only on desktop)
  const emptyRowsCount = maxRows - filteredData.length;

  return (
    <Card className="bg-card p-3 h-90 w-full overflow-hidden" role="region" aria-labelledby="my-portfolio-title">
      {/* Header - Responsive */}
      <div className="flex items-center justify-between">
        <h3 id="my-portfolio-title" className="text-sm sm:text-base font-semibold text-card-foreground">
          My Portfolio
        </h3>
        
        {/* Tab Navigation - Responsive */}
        <div className="flex gap-1 border border-border rounded-sm overflow-hidden">
          {portfolioTabs.map((tab) => (
            <TabButton
              key={tab.key}
              tab={tab}
              isActive={activeTab === tab.key}
              onClick={setActiveTab}
            />
          ))}
        </div>
      </div>

      {/* Stock List Container with Hidden Scrollbar */}
      <div 
        className="w-full overflow-x-auto"
        style={{
          msOverflowStyle: 'none',  /* IE and Edge */
          scrollbarWidth: 'none'     /* Firefox */
        }}
      >
        
        <div className="min-w-full">
          {/* Stock List */}
          <div className="space-y-0">
            {filteredData.map((stock, index) => (
              <StockRow
                key={stock.id}
                stock={stock}
                index={index}
                isLast={index === filteredData.length - 1 && emptyRowsCount === 0}
              />
            ))}
            
            {/* Add empty rows to maintain height on desktop only */}
            {emptyRowsCount > 0 && filteredData.length > 0 && (
              <div className="hidden lg:block">
                {Array(emptyRowsCount).fill(null).map((_, index) => (
                  <div 
                    key={`empty-${index}`} 
                    className={`h-[52px] ${index !== emptyRowsCount - 1 ? 'border-b border-border' : ''}`}
                  />
                ))}
              </div>
            )}
            
            {/* Show empty state message if no data */}
            {filteredData.length === 0 && (
              <div className="flex items-center justify-center py-8 lg:py-16">
                <p className="text-muted-foreground text-sm">No stocks found for this filter</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MyPortfolioCard;