import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StockList = ({ data }) => {
  return (
    <Card className="bg-card/95 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Stocks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-4 gap-4 text-xs text-muted-foreground border-b pb-2">
            <div>Symbol</div>
            <div className="text-right">Price</div>
            <div className="text-right">Change</div>
            <div className="text-right">Volume</div>
          </div>
          
          {/* Stock rows */}
          {data.map((stock, index) => {
            const isPositive = stock.change >= 0;
            return (
              <div key={index} className="grid grid-cols-4 gap-4 py-2 text-sm hover:bg-muted/20 rounded transition-colors">
                <div className="font-medium">{stock.symbol}</div>
                <div className="text-right">${stock.price.toFixed(2)}</div>
                <div className={`text-right ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                </div>
                <div className="text-right text-muted-foreground text-xs">{stock.volume}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default StockList;