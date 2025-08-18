import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

const PortfolioSummary = ({ data }) => {
  const isPositive = data.change >= 0;
  
  return (
    <Card className="bg-card/95 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Portfolio Value
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold">
            ${data.totalValue.toLocaleString()}
          </div>
          <div className={`flex items-center space-x-2 text-sm ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>
              {isPositive ? '+' : ''}{data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            vs previous close
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioSummary;