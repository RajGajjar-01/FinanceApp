import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pie, PieChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useTracker } from '@/contexts/tracker-context';

const ExpenseChart = React.memo(() => {
  const { percentages, transactionsState } = useTracker();

  const chartConfig = {
    amount: {
      label: 'Amount',
    },
  };

  if (percentages && percentages.length > 0) {
    percentages.forEach((entry, index) => {
      const categoryKey = entry.category || entry.name || `category${index}`;
      chartConfig[categoryKey] = {
        label: categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1),
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
    });
  }

  let chartData = [];
  if (percentages && percentages.length > 0) {
    chartData = percentages.map((entry, index) => ({
      category: entry.category || entry.name || `Category ${index + 1}`,
      amount: Number(entry.amount || entry.value || entry.total || 0),
      fill: `var(--chart-${(index % 5) + 1})`,
    }));
  }

  if (transactionsState.ui.isLoading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Monthly Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Monthly Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {chartData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-xs">
              {transactionsState.ui.error
                ? 'Unable to load expense data'
                : 'No expenses this month'}
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="category"
                outerRadius={90}
                innerRadius={0}
                strokeWidth={1}
              />
            </PieChart>
          </ChartContainer>
        )}
        <div className="grid grid-cols-1 gap-2">
          {chartData.map((entry, index) => (
            <div key={entry.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.fill }}
                />
                <span className="capitalize font-medium">{entry.category}</span>
              </div>
              <span className="font-semibold">${entry.amount}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

export default ExpenseChart;
