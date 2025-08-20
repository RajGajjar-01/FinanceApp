import React, { memo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { myWatchlistData, watchlistTabs } from './PortfoliodummyData';

// Enhanced SVG Area Chart Component with Smooth Curves
const MiniAreaChart = memo(({ data, isPositive }) => {
  const width = 80;
  const height = 30;
  const padding = 2;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  // Create smooth curve using quadratic bezier curves
  const createSmoothPath = (points) => {
    if (points.length < 2) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      
      if (i === 1) {
        path += ` L ${currentPoint.x} ${currentPoint.y}`;
      } else {
        const prevPrevPoint = points[i - 2];
        const controlX = (prevPoint.x + currentPoint.x) / 2;
        const controlY = prevPoint.y;
        path += ` Q ${controlX} ${controlY} ${currentPoint.x} ${currentPoint.y}`;
      }
    }
    
    return path;
  };
  
  // Convert data to points
  const points = data.map((value, index) => ({
    x: padding + (index / (data.length - 1)) * (width - 2 * padding),
    y: padding + (height - 2 * padding) - ((value - min) / range) * (height - 2 * padding)
  }));
  
  const linePath = createSmoothPath(points);
  
  // Create area path (same as line but closed to bottom)
  const areaPath = linePath + ` L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  
  const strokeColor = isPositive ? '#10b981' : '#ef4444';
  const fillColor = isPositive 
    ? 'url(#greenGradient)' 
    : 'url(#redGradient)';

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Define gradients */}
      <defs>
        <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0.05 }} />
        </linearGradient>
        <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 0.05 }} />
        </linearGradient>
      </defs>
      
      {/* Area fill */}
      <path
        d={areaPath}
        fill={fillColor}
      />
      
      {/* Line stroke */}
      <path
        d={linePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
});

// Tab Button Component
const TabButton = memo(({ tab, isActive, onClick }) => (
  <button
    onClick={() => onClick(tab.key)}
    className={`px-3 py-1.5 text-xs rounded transition-all ${
      isActive 
        ? 'bg-gray-600 text-white' 
        : 'text-gray-400 hover:text-white hover:bg-gray-700'
    }`}
    aria-pressed={isActive}
  >
    {tab.label}
  </button>
));

// Watchlist Row Component
const WatchlistRow = memo(({ stock, index, isLast }) => {
  const isPositive = stock.change >= 0;
  
  return (
    <div className={`flex items-center justify-between py-2 ${!isLast ? 'border-b border-gray-800' : ''}`}> {/* Changed py-3 to py-2 */}
      {/* Company Info */}
      <div className="flex items-center space-x-2 flex-1"> {/* Changed space-x-3 to space-x-2 */}
        <div className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center"> {/* Changed from w-8/h-8 to w-7/h-7 */}
          <span className="text-xs font-medium text-white">
            {stock.id.charAt(0)}
          </span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{stock.id}</p>
          <p className="text-xs text-gray-400">{stock.name}</p>
        </div>
      </div>

      {/* Chart and Change */}
      <div className="flex items-center space-x-3"> {/* Changed space-x-4 to space-x-3 */}
        <div className="flex items-center justify-center">
          <MiniAreaChart data={stock.chartData} isPositive={isPositive} />
        </div>

        <div className="text-right min-w-[80px]">
          <p className="text-gray-400 text-xs mb-0.5">Change</p> {/* Changed mb-1 to mb-0.5 */}
          <p className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{stock.change.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
});

// Main Component
const MyWatchlist = memo(() => {
  const [activeTab, setActiveTab] = useState('all');
  
  // Get the maximum number of rows for consistent height
  const maxRows = myWatchlistData.length;
  
  // Filter data based on active tab
  const filteredData = myWatchlistData.filter(stock => {
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

  // Calculate empty rows needed to maintain height
  const emptyRowsCount = maxRows - filteredData.length;

  return (
    <Card className="bg-primary/7 h-90 p-5 w-full" role="region" aria-labelledby="my-watchlist-title">
      {/* Header */}
      <div className="flex items-center justify-between ">
        <h3 id="my-watchlist-title" className="text-base font-semibold text-white">
          My Watchlist
        </h3>
        
        {/* Tab Navigation */}
        <div className="flex gap-1 border-2 rounded-sm">
          {watchlistTabs.map((tab) => (
            <TabButton
              key={tab.key}
              tab={tab}
              isActive={activeTab === tab.key}
              onClick={setActiveTab}
            />
          ))}
        </div>
      </div>

      {/* Stock List with Empty Rows */}
      <div className="space-y-0">
        {filteredData.map((stock, index) => (
          <WatchlistRow
            key={stock.id}
            stock={stock}
            index={index}
            isLast={index === filteredData.length - 1 && emptyRowsCount === 0}
          />
        ))}
        
        {/* Add empty rows to maintain height */}
        {emptyRowsCount > 0 && filteredData.length > 0 && (
          Array(emptyRowsCount).fill(null).map((_, index) => (
            <div 
              key={`empty-${index}`} 
              className={`h-[52px] ${index !== emptyRowsCount - 1 ? 'border-b border-gray-800' : ''}`}
            />
          ))
        )}
        
        {/* Empty State - Maintains full height */}
        {filteredData.length === 0 && (
          <div 
            className="flex items-center justify-center border-t border-gray-800" 
            style={{ height: `${maxRows * 52}px` }}
          >
            <p className="text-gray-400">No stocks found for this filter</p>
          </div>
        )}
      </div>
    </Card>
  );
});

MyWatchlist.displayName = 'MyWatchlist';
export default MyWatchlist;