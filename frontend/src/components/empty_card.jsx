import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const EmptyCard = ({ height = "h-32", className = "" }) => {
  return (
    <Card className={`bg-card/95 backdrop-blur ${className}`}>
      <CardContent className={`${height} flex items-center justify-center`}>
        <div className="text-muted-foreground text-sm">
          Content placeholder
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyCard;