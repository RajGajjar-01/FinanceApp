import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; 

import { portfolioSummary } from './PortfoliodummyData';

const PortfolioSummary = () => {
  return (
      <Card className="bg-card p-3 max-w-md">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Current Value</p>
        <Card className="bg-card p-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-3xl font-semibold text-card-foreground">
                ${portfolioSummary.currentValue.toFixed(2)}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                {portfolioSummary.dailyChange >= 0 ? '+' : ''}
                {portfolioSummary.dailyChange.toFixed(2)} (
                {portfolioSummary.dailyChangePercent >= 0 ? '+' : ''}
                {portfolioSummary.dailyChangePercent.toFixed(2)}%)
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="bg-transparent mt-3 rounded-2xl border-border hover:bg-muted hover:text-foreground transition-all duration-200"
            >
              See Details
            </Button>
          </div>
        </Card>

        {/* Invested Value Section - Outside the sub-card */}
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Invested Value</p>
            <p className="text-xl font-semibold text-card-foreground">
              ${portfolioSummary.investedValue.toFixed(2)}
            </p>
          </div>

          {/* Returns displayed on right side of invested value */}
          <div className="text-right">
            <p className="text-md text-green-600 dark:text-green-400 font-medium">
              {portfolioSummary.investedChange >= 0 ? '+' : ''}
              {portfolioSummary.investedChange.toFixed(2)} (
              {portfolioSummary.investedChangePercent >= 0 ? '+' : ''}
              {portfolioSummary.investedChangePercent.toFixed(2)}%)
            </p>
          </div>
        </div>
      </Card>
  );
};

export default PortfolioSummary;