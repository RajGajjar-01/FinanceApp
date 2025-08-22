import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Sample data - replace with actual API data
const allocationData = [
  { name: 'Technology', value: 45.2, color: 'rgb(74 222 128)' },
  { name: 'Healthcare', value: 18.7, color: '#10b981' },
  { name: 'Financials', value: 15.3, color: '#f59e0b' },
  { name: 'Consumer', value: 12.1, color: '#ef4444' },
  { name: 'Energy', value: 8.7, color: '#8b5cf6' }
];

const COLORS = ['rgb(74 222 128)', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

const AllocationPieChart = () => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{payload[0].name}</p>
          <p className="text-primary font-semibold">
            {payload[0].value.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => (
    <div className="flex flex-wrap gap-3 mt-4">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground">
            {entry.value} ({allocationData[index]?.value.toFixed(1)}%)
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-card-foreground">Asset Allocation</CardTitle>
        <CardDescription>Portfolio breakdown by sector</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-card-foreground">
              {allocationData.length}
            </p>
            <p className="text-sm text-muted-foreground">Sectors</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-card-foreground">
              {allocationData[0]?.value.toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">Largest Allocation</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AllocationPieChart;
