import React, { memo } from 'react';
import { Card } from '@/components/ui/card';

const MarketCard = memo(() => {
  return (
    <Card 
      className="bg-card p-3 w-full min-h-[200px]" 
      role="region" 
      aria-labelledby="market-section-title"
    >

      <div className="flex items-center justify-between mb-6">
        <h3 id="market-section-title" className="text-lg font-semibold text-card-foreground">
          Market
        </h3>

        <div className="flex space-x-2">

        </div>
      </div>


      <div className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-lg">
        <p className="text-muted-foreground text-sm">Market content coming soon...</p>
      </div>


    </Card>
  );
});

export default MarketCard;