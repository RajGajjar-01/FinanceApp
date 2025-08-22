import React, { useState, useMemo, useCallback } from 'react';
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
const TimePeriodButton = ({ period, isSelected, onClick }) => (
  <button
    onClick={() => onClick(period.key)}
    className={`px-2 py-1 text-xs rounded transition-all ${
      isSelected ? 'bg-primary text-primary-foreground border border-border' 
      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    }`}
    aria-pressed={isSelected}
    aria-label={`Select ${period.label} time period`}
  >
    {period.label}
  </button>
);

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
    <Card className="bg-card p-3 w-150 max-w-4xl h-[280px] flex flex-col" role="region" aria-labelledby="portfolio-return-title">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 id="portfolio-return-title" className="text-sm text-muted-foreground uppercase tracking-wide">
          Portfolio Return
        </h2>
        
        <div className="flex gap-1 border-2 border-border rounded-sm" role="tablist" aria-label="Time period selection">
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
        <div className="absolute left-0 top-0 h-40 flex flex-col justify-between text-xs text-muted-foreground py-2 z-10 w-12">
          {reversedYAxisLabels.map((label, i) => (
            <span key={i} aria-label={`Chart scale: ${label}`} className="leading-none">
              {label}
            </span>
          ))}
        </div>
        
        {/* Chart Container - Adjusted positioning */}
        <div className="h-full ml-12">
          {isLoading ? (
            <div className="h-full animate-pulse bg-muted rounded-lg flex items-center justify-center">
              <div className="text-muted-foreground text-sm">Loading chart...</div>
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
                  {/* Area fill - Solid color instead of gradient */}
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                  
                  {/* Line stroke - Solid color instead of gradient */}
                  <linearGradient id="lineStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                  </linearGradient>
                </defs>
                
                {/* Horizontal Grid Lines */}
                {chartConfig.yAxisTicks.slice(1).map(tick => (
                  <ReferenceLine 
                    key={tick}
                    y={tick} 
                    stroke="hsl(var(--border))" 
                    strokeDasharray="1 1" 
                    strokeOpacity={0.3} 
                  />
                ))}
                
                {/* X-Axis - Positioned to align with 0 of Y-axis */}
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
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
                  stroke="url(#lineStroke)"
                  strokeWidth={chartConfig.strokeWidth}
                  fill="url(#areaFill)"
                  fillOpacity={1}
                  activeDot={{ 
                    r: 5, 
                    stroke: "hsl(var(--primary))", 
                    strokeWidth: 3, 
                    fill: "hsl(var(--primary))",
                    filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.3))'
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