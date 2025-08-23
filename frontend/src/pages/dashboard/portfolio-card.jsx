import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

// Utility function for getting cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

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

// Stock Row Component
const StockRow = ({ stock, index, isLast }) => {
  // Extract data with proper formatting
  const symbol = stock.stock_symbol || 'N/A';
  const name = stock.stock_name || 'Unknown Stock';
  const shares = parseFloat(stock.shares_owned) || 0;
  const price = parseFloat(stock.purchase_price) || 0;
  const currentValue = parseFloat(stock.current_value) || 0;
  const changePercent = parseFloat(stock.unrealized_gain_loss_percentage) || 0;
  
  const isPositive = changePercent >= 0;
  
  // Format numbers properly
  const formatNumber = (num, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  return (
    <div className={`py-2 ${!isLast ? 'border-b border-border' : ''}`}>
      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center justify-between">
        {/* Company Info */}
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-foreground">
              {symbol.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground" title={name}>
              {name}
            </p>
            <p className="text-xs text-muted-foreground">{symbol}</p>
          </div>
        </div>

        {/* Stock Data */}
        <div className="flex items-center space-x-5 text-sm flex-shrink-0">
          {/* Shares */}
          <div className="text-center min-w-[60px]">
            <p className="text-xs mb-0.5 text-muted-foreground">Shares</p>
            <p className="font-medium text-foreground">{formatNumber(shares, 0)}</p>
          </div>

          {/* Price */}
          <div className="text-center min-w-[80px]">
            <p className="text-xs mb-0.5 text-muted-foreground">Avg Price</p>
            <p className="font-medium text-foreground">${formatNumber(price)}</p>
          </div>

          {/* Change */}
          <div className="text-center min-w-[50px] mr-6">
            <p className="text-xs mb-0.5 text-muted-foreground">Change</p>
            <p className={`font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? '+' : ''}{formatNumber(changePercent)}%
            </p>
          </div>

          {/* Current Value */}
          <div className="text-center min-w-[100px]">
            <p className="text-xs mb-0.5 text-muted-foreground">Current Value</p>
            <p className="font-medium text-foreground">${formatNumber(currentValue)}</p>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex lg:hidden flex-col space-y-2">
        {/* Row 1: Company Info and Current Value */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-foreground">
                {symbol.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate" title={name}>
                {name}
              </p>
              <p className="text-xs text-muted-foreground">{symbol}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-foreground font-medium">${formatNumber(currentValue)}</p>
            <p className={`text-xs font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? '+' : ''}{formatNumber(changePercent)}%
            </p>
          </div>
        </div>

        {/* Row 2: Shares and Price */}
        <div className="flex justify-between text-xs pl-8">
          <div>
            <span className="text-muted-foreground">Shares: </span>
            <span className="text-foreground">{formatNumber(shares, 0)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Avg Price: </span>
            <span className="text-foreground">${formatNumber(price)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Portfolio Component
const MyPortfolioCard = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [portfolioData, setPortfolioData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const portfolioTabs = [
    { key: 'all', label: 'All' },
    { key: 'gainers', label: 'Gainers' },
    { key: 'decliners', label: 'Decliners' }
  ];

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const accessToken = getCookie("access_token");
      
      if (!accessToken) {
        setError('Please log in to view your portfolio');
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/portfolio/portfolio/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await refreshToken();
          await fetchPortfolioData();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Portfolio API Response:', data);
      
      // Handle different response formats
      let portfolioItems = [];
      
      if (data.data && data.data.results) {
        portfolioItems = data.data.results;
      } else if (Array.isArray(data.data)) {
        portfolioItems = data.data;
      } else if (Array.isArray(data)) {
        portfolioItems = data;
      } else if (data.results) {
        portfolioItems = data.results;
      }
      
      console.log('Processed portfolio items:', portfolioItems);
      
      // Debug: Check for specific stocks
      const hasInfraStock = portfolioItems.some(stock => 
        stock.stock_symbol === 'INFRA' || stock.stock_name?.includes('Infra')
      );
      console.log('Has INFRA stock:', hasInfraStock);
      console.log('All stock symbols:', portfolioItems.map(s => s.stock_symbol));
      
      setPortfolioData(portfolioItems);

    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError('Unable to load portfolio data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = getCookie("refresh_token");
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('http://localhost:8000/api/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      // Update the access token in cookies
      document.cookie = `access_token=${data.access}; path=/; max-age=3600`;
      
    } catch (err) {
      console.error('Token refresh failed:', err);
      setError('Session expired. Please log in again.');
    }
  };

  const refreshPortfolio = () => {
    fetchPortfolioData();
  };

  const refreshPortfolioSummary = async () => {
    try {
      const accessToken = getCookie("access_token");
      const response = await fetch('http://localhost:8000/portfolio/portfolio/summary/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (response.ok) {
        console.log('Portfolio summary refreshed');
        fetchPortfolioData();
      }
    } catch (err) {
      console.error('Error refreshing summary:', err);
    }
  };

  // Filter data based on active tab
  const filteredData = portfolioData.filter(stock => {
    const changePercent = parseFloat(stock.unrealized_gain_loss_percentage) || 0;
    
    switch (activeTab) {
      case 'gainers':
        return changePercent > 0;
      case 'decliners':
        return changePercent < 0;
      case 'all':
      default:
        return true;
    }
  });

  if (isLoading) {
    return (
      <Card className="bg-card p-3 h-90 w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm sm:text-base font-semibold text-card-foreground">
            My Portfolio
          </h3>
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
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card p-3 h-90 w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm sm:text-base font-semibold text-card-foreground">
            My Portfolio
          </h3>
        </div>
        <div className="flex items-center justify-center py-8 flex-col gap-2">
          <p className="text-red-500 text-sm text-center">{error}</p>
          <button
            onClick={fetchPortfolioData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card p-3 h-90 w-full overflow-hidden" role="region" aria-labelledby="my-portfolio-title">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 id="my-portfolio-title" className="text-sm sm:text-base font-semibold text-card-foreground">
          My Portfolio
        </h3>
        
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={refreshPortfolio}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh portfolio"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          
          {/* Tab Navigation */}
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
      </div>

      {/* Portfolio List */}
      <div className="space-y-0">
        {filteredData.length === 0 ? (
          <div className="flex items-center justify-center py-8 flex-col gap-2">
            <p className="text-muted-foreground text-sm">
              {portfolioData.length === 0 ? 'No holdings in your portfolio' : 'No stocks found for this filter'}
            </p>
            {portfolioData.length === 0 && (
              <button
                onClick={refreshPortfolioSummary}
                className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80"
              >
                Refresh Summary
              </button>
            )}
          </div>
        ) : (
          filteredData.map((stock, index) => (
            <StockRow
              key={stock.id}
              stock={stock}
              index={index}
              isLast={index === filteredData.length - 1}
            />
          ))
        )}
      </div>
    </Card>
  );
};

export default MyPortfolioCard;