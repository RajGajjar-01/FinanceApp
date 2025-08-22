import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  CartesianGrid,
} from 'recharts';

// Sample data - replace with actual API data
const performanceData = [
  { date: 'Jan', value: 100000, change: 0 },
  { date: 'Feb', value: 105000, change: 5.0 },
  { date: 'Mar', value: 112000, change: 6.7 },
  { date: 'Apr', value: 108000, change: -3.6 },
  { date: 'May', value: 115000, change: 6.5 },
  { date: 'Jun', value: 122000, change: 6.1 },
  { date: 'Jul', value: 118000, change: -3.3 },
  { date: 'Aug', value: 125000, change: 5.9 },
  { date: 'Sep', value: 132000, change: 5.6 },
  { date: 'Oct', value: 128000, change: -3.0 },
  { date: 'Nov', value: 135000, change: 5.5 },
  { date: 'Dec', value: 142000, change: 5.2 }
];

const timePeriods = [
  { key: '1M', label: '1M' },
  { key: '3M', label: '3M' },
  { key: '6M', label: '6M' },
  { key: '1Y', label: '1Y', active: true },
  { key: 'All', label: 'All' },
];

const PortfolioPerformanceChart = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');
  const [isLoading, setIsLoading] = useState(false);

  const handlePeriodChange = useCallback((periodKey) => {
    if (periodKey === selectedPeriod) return;
    setIsLoading(true);
    setSelectedPeriod(periodKey);
    setTimeout(() => setIsLoading(false), 300);
  }, [selectedPeriod]);

  // Filter data based on selected period
  const filteredData = useMemo(() => {
    switch (selectedPeriod) {
      case '1M':
        return performanceData.slice(-1);
      case '3M':
        return performanceData.slice(-3);
      case '6M':
        return performanceData.slice(-6);
      case '1Y':
        return performanceData;
      case 'All':
        return performanceData;
      default:
        return performanceData;
    }
  }, [selectedPeriod]);

  const currentValue = filteredData[filteredData.length - 1]?.value || 0;
  const startValue = filteredData[0]?.value || 0;
  const totalChange = currentValue - startValue;
  const totalChangePercent = startValue > 0 ? (totalChange / startValue) * 100 : 0;
  const isPositive = totalChange >= 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-primary font-semibold">
            ${payload[0].value.toLocaleString()}
          </p>
          {payload[0].payload.change !== undefined && (
            <p className={`text-sm ${payload[0].payload.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {payload[0].payload.change >= 0 ? '+' : ''}{payload[0].payload.change.toFixed(1)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl text-foreground font-semibold">Portfolio Performance</CardTitle>
            <CardDescription className="text-muted-foreground">Track your portfolio value over time</CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">
                ${currentValue.toLocaleString()}
              </p>
              <div className="flex items-center">
                {isPositive ? (
                  <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                    +${totalChange.toLocaleString()} (+{totalChangePercent.toFixed(1)}%)
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                    ${totalChange.toLocaleString()} ({totalChangePercent.toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Time Period Selector */}
        <div className="flex gap-1 border border-border rounded-lg p-1 w-fit">
          {timePeriods.map((period) => (
            <button
              key={period.key}
              onClick={() => handlePeriodChange(period.key)}
              className={`px-3 py-1.5 text-sm rounded-md transition-all font-medium ${
                selectedPeriod === period.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="h-80 animate-pulse bg-muted rounded-lg flex items-center justify-center">
            <div className="text-foreground">Loading chart...</div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(74 222 128)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="rgb(74 222 128)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                />
                
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                <ReferenceLine 
                  y={startValue} 
                  stroke="hsl(var(--border))" 
                  strokeDasharray="3 3" 
                  opacity={0.5}
                />
                
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="rgb(74 222 128)"
                  strokeWidth={3}
                  fill="url(#performanceGradient)"
                  fillOpacity={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioPerformanceChart;
