import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

const MarketSummary = ({ data }) => {
  return (
    <Card className="bg-card/95 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Market Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{item.title}</h4>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{item.time}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.content}
              </p>
              {index < data.length - 1 && <div className="border-b border-border/40 pt-2" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketSummary;