import React, { useState, memo, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

import { 
  portfolioReturnData, 
  timePeriods, 
  chartConfig 
} from './PortfoliodummyData';

// Time period button component
const TimePeriodButton = memo(({ period, isSelected, onClick }) => (
  <button
    onClick={() => onClick(period.key)}
    className={`px-2 py-1 text-xs rounded transition-all ${
      isSelected ? 'bg-gray-700 text-white border border-gray-600' 
      : 'text-gray-400 hover:text-white hover:bg-gray-800'
    }`}
    aria-pressed={isSelected}
    aria-label={`Select ${period.label} time period`}
  >
    {period.label}
  </button>
));

// Main Portfolio Return component
const PortfolioReturn = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [isLoading, setIsLoading] = useState(false);

  const handlePeriodChange = useCallback((periodKey) => {
    if (periodKey === selectedPeriod) return;
    setIsLoading(true);
    setSelectedPeriod(periodKey);
    setTimeout(() => setIsLoading(false), 300);
  }, [selectedPeriod]);

  // Reversed Y-axis labels to start from 0 at bottom
  const reversedYAxisLabels = useMemo(() => {
    return [...chartConfig.yAxisLabels].reverse();
  }, []);

  return (
    <Card className="bg-primary/7 p-5 h-[245px] " role="region" aria-labelledby="portfolio-return-title">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 id="portfolio-return-title" className="text-sm text-gray-400 uppercase tracking-wide">
          Portfolio Return
        </h2>
        
        <div className="flex gap-1 border-2 rounded-sm" role="tablist" aria-label="Time period selection">
          {timePeriods.map((period) => (
            <TimePeriodButton
              key={period.key}
              period={{ ...period, isSelected: period.key === selectedPeriod }}
              isSelected={period.key === selectedPeriod}
              onClick={handlePeriodChange}
            />
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 relative">
        {/* Y-axis Labels - Positioned correctly with 0 at bottom */}
        <div className="absolute left-0 top-0 h-35 flex flex-col justify-between text-xs text-gray-500 py-2 z-10 w-12">
          {reversedYAxisLabels.map((label, i) => (
            <span key={i} aria-label={`Chart scale: ${label}`} className="leading-none">
              {label}
            </span>
          ))}
        </div>
        
        {/* Chart Container - Adjusted positioning */}
        <div className="h-full ml-12">
          {isLoading ? (
            <div className="h-full animate-pulse bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-gray-600 text-sm">Loading chart...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={portfolioReturnData} 
                margin={{ 
                  top: 10,    // Reduced top margin
                  right: 10, 
                  left: 0,    // No left margin since Y-axis labels are external
                  bottom: 20  // Increased bottom margin for X-axis labels
                }}
              >
                <defs>
                  {/* Area gradient - Vertical gradient for fill */}
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartConfig.strokeColor} stopOpacity={0.4} />
                    <stop offset="50%" stopColor={chartConfig.strokeColor} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={chartConfig.strokeColor} stopOpacity={0.05} />
                  </linearGradient>
                  
                  {/* Line gradient - Horizontal gradient for stroke */}
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={chartConfig.strokeColor} stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={1} />
                  </linearGradient>
                </defs>
                
                {/* Horizontal Grid Lines */}
                {chartConfig.yAxisTicks.slice(1).map(tick => (
                  <ReferenceLine 
                    key={tick}
                    y={tick} 
                    stroke={chartConfig.gridColor} 
                    strokeDasharray="1 1" 
                    strokeOpacity={chartConfig.gridOpacity} 
                  />
                ))}
                
                {/* X-Axis - Positioned to align with 0 of Y-axis */}
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  interval="preserveStartEnd"
                  height={5}
                  padding={{ left: 10, right: 10 }}
                />
                
                {/* YAxis configured to start from 0 and increase upwards */}
                <YAxis 
                  hide 
                  domain={[0, chartConfig.yAxisDomain[1]]}
                  type="number"
                />
                
                {/* Area Chart - Filled area under the line */}
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="url(#lineGradient)"
                  strokeWidth={chartConfig.strokeWidth}
                  fill="url(#areaGradient)"
                  fillOpacity={1}
                  activeDot={{ 
                    r: 5, 
                    stroke: chartConfig.strokeColor, 
                    strokeWidth: 3, 
                    fill: chartConfig.strokeColor,
                    filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.7))'
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PortfolioReturn;