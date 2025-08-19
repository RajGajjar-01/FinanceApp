import React, { memo } from 'react';
import { Card } from '@/components/ui/card';
import { transactionSummary } from './PortfoliodummyData';

const TransactionOrderCard = memo(() => {
  const { order, maxOrder, orderChangePercent } = transactionSummary;

  return (
    <Card className="bg-primary/7 h-28 p-4 max-w-full" role="region" aria-labelledby="transaction-order-title">
      <div className="space-y-2">
        <h3 id="transaction-order-title" className="text-sm text-gray-400 uppercase tracking-wide">
          Transaction Order
        </h3>
        
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-bold text-white" aria-label={`${order} out of ${maxOrder} transactions`}>
              {order}
            </span>
            <span className="text-lg font-normal text-gray-500">
              /{maxOrder}
            </span>
          </div>
          
          <p className="text-sm text-green-400 font-medium">
            {orderChangePercent.toFixed(2)}% vs Last Month
          </p>
        </div>
      </div>
    </Card>
  );
});

TransactionOrderCard.displayName = 'TransactionOrderCard';

export default TransactionOrderCard;
