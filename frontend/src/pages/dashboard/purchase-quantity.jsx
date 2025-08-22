import React from 'react';
import { Card } from '@/components/ui/card';
import { transactionSummary } from './PortfoliodummyData';

const PurchaseQuantityCard = () => {
  const { purchaseQuantity, currency } = transactionSummary;

  return (
    <Card className="bg-primary/7 p-4 h-27" role="region" aria-labelledby="purchase-quantity-title">
      <div className="space-y-5">
        <h3 id="purchase-quantity-title" className="text-sm text-gray-400 uppercase tracking-wide">
          Purchase Quantity
        </h3>
        
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-white" aria-label={`${purchaseQuantity} ${currency}`}>
            {purchaseQuantity.toLocaleString('en-US', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            })}
          </span>
          <span className="text-lg font-normal text-gray-500 uppercase">
            {currency}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default PurchaseQuantityCard;