import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Sample data - replace with actual API data
const wishlistData = [
  {
    id: 1,
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    targetPrice: 180.00,
    currentPrice: 165.30,
    distanceToTarget: 14.70,
    distancePercent: 8.9,
    priority: 'High',
    sector: 'Technology'
  },
  {
    id: 2,
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    targetPrice: 450.00,
    currentPrice: 485.20,
    distanceToTarget: -35.20,
    distancePercent: -7.3,
    priority: 'Medium',
    sector: 'Technology'
  },
  {
    id: 3,
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    targetPrice: 140.00,
    currentPrice: 132.80,
    distanceToTarget: 7.20,
    distancePercent: 5.4,
    priority: 'High',
    sector: 'Consumer'
  },
  {
    id: 4,
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    targetPrice: 120.00,
    currentPrice: 118.50,
    distanceToTarget: 1.50,
    distancePercent: 1.3,
    priority: 'Low',
    sector: 'Technology'
  }
];

const WishlistTable = () => {
  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Watchlist</CardTitle>
        <CardDescription>Stocks you're monitoring</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Symbol</TableHead>
                <TableHead className="min-w-[120px]">Company</TableHead>
                <TableHead className="text-right">Target</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">Distance</TableHead>
                <TableHead className="text-center">Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wishlistData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{item.symbol}</div>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {item.sector}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[120px]">
                    <div className="truncate" title={item.name}>
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${item.targetPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${item.currentPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={`font-medium ${item.distanceToTarget >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {item.distanceToTarget >= 0 ? '+' : ''}${item.distanceToTarget.toFixed(2)}
                    </div>
                    <div className={`text-xs ${item.distanceToTarget >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {item.distanceToTarget >= 0 ? '+' : ''}{item.distancePercent.toFixed(1)}%
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(item.priority)}`}
                    >
                      {item.priority}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Summary Footer */}
        <div className="border-t border-border p-3 bg-muted/30">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {wishlistData.length} watchlist items
            </span>
            <div className="text-right">
              <div className="text-muted-foreground">
                {wishlistData.filter(item => item.distanceToTarget <= 0).length} ready to buy
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WishlistTable;
