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
const portfolioData = [
  {
    id: 1,
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 150,
    purchasePrice: 150.25,
    currentPrice: 175.80,
    gainLoss: 25.55,
    gainLossPercent: 17.0,
    value: 26370.00,
    sector: 'Technology'
  },
  {
    id: 2,
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    shares: 100,
    purchasePrice: 280.50,
    currentPrice: 320.75,
    gainLoss: 40.25,
    gainLossPercent: 14.3,
    value: 32075.00,
    sector: 'Technology'
  },
  {
    id: 3,
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    shares: 200,
    purchasePrice: 145.30,
    currentPrice: 158.90,
    gainLoss: 13.60,
    gainLossPercent: 9.4,
    value: 31780.00,
    sector: 'Financials'
  },
  {
    id: 4,
    symbol: 'JNJ',
    name: 'Johnson & Johnson',
    shares: 75,
    purchasePrice: 165.80,
    currentPrice: 172.40,
    gainLoss: 6.60,
    gainLossPercent: 4.0,
    value: 12930.00,
    sector: 'Healthcare'
  },
  {
    id: 5,
    symbol: 'XOM',
    name: 'Exxon Mobil Corporation',
    shares: 120,
    purchasePrice: 85.20,
    currentPrice: 92.15,
    gainLoss: 6.95,
    gainLossPercent: 8.2,
    value: 11058.00,
    sector: 'Energy'
  }
];

const PortfolioHoldingsTable = () => {
  const totalValue = portfolioData.reduce((sum, holding) => sum + holding.value, 0);
  const totalGainLoss = portfolioData.reduce((sum, holding) => sum + holding.gainLoss * holding.shares, 0);

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-card-foreground">Portfolio Holdings</CardTitle>
        <CardDescription>Your current stock positions and performance</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] text-muted-foreground">Symbol</TableHead>
                <TableHead className="min-w-[150px] text-muted-foreground">Company</TableHead>
                <TableHead className="text-right text-muted-foreground">Shares</TableHead>
                <TableHead className="text-right text-muted-foreground">Purchase</TableHead>
                <TableHead className="text-right text-muted-foreground">Current</TableHead>
                <TableHead className="text-right text-muted-foreground">Gain/Loss</TableHead>
                <TableHead className="text-right text-muted-foreground">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portfolioData.map((holding) => (
                <TableRow key={holding.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold text-card-foreground">{holding.symbol}</div>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {holding.sector}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    <div className="truncate text-card-foreground" title={holding.name}>
                      {holding.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-card-foreground">{holding.shares.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-card-foreground">${holding.purchasePrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-card-foreground">${holding.currentPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className={`font-medium ${holding.gainLossPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {holding.gainLoss >= 0 ? '+' : ''}${holding.gainLoss.toFixed(2)}
                    </div>
                    <div className={`text-xs ${holding.gainLossPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {holding.gainLossPercent >= 0 ? '+' : ''}{holding.gainLossPercent.toFixed(1)}%
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-card-foreground">
                    ${holding.value.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Summary Footer */}
        <div className="border-t border-border p-4 bg-muted/30">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {portfolioData.length} holdings
            </span>
            <div className="text-right">
              <div className="font-medium text-card-foreground">Total: ${totalValue.toLocaleString()}</div>
              <div className={`text-sm ${totalGainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toFixed(2)} total gain/loss
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioHoldingsTable;
