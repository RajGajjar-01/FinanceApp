'use client';
import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, AlertCircle, WifiOff } from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const ALL_SECTORS = [
  { code: 'TECH', name: 'Technology' },
  { code: 'FIN', name: 'Financials' },
  { code: 'HC', name: 'Healthcare' },
  { code: 'IND', name: 'Industrials' },
  { code: 'CONS', name: 'Consumer' },
  { code: 'EN', name: 'Energy' }
];

const chartConfig = {
  value: {
    label: 'Allocation %',
    color: 'rgb(74 222 128)',
  },
};

const ErrorState = ({ error }) => {
  const isNetworkError = error.toLowerCase().includes('network');
  
  return (
    <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
      {isNetworkError ? (
        <WifiOff className="h-12 w-12 text-red-500" />
      ) : (
        <AlertCircle className="h-12 w-12 text-red-500" />
      )}
      <div className="space-y-2">
        <h3 className="font-medium text-red-600">Unable to Load Data</h3>
        <p className="text-sm text-red-600 max-w-sm">{error}</p>
      </div>
    </div>
  );
};

function SectorBarChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const { axiosPrivate } = useAuth();

  const fetchPortfolioData = useCallback(async () => {
    if (!axiosPrivate) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosPrivate.get('/portfolio/portfolio/summary/');
      
      if (response.data?.success && response.data?.data) {
        const portfolio = response.data.data;
        setPortfolioData(portfolio);
        
        if (portfolio.sector_allocation) {
          const transformedData = ALL_SECTORS.map(({ code, name }) => {
            const allocation = portfolio.sector_allocation[code];
            return {
              sector: name,
              value: allocation ? parseFloat(allocation) : null,
              hasData: !!allocation
            };
          });
          
          transformedData.sort((a, b) => {
            if (a.hasData && !b.hasData) return -1;
            if (!a.hasData && b.hasData) return 1;
            return (b.value || 0) - (a.value || 0);
          });
          
          setData(transformedData);
        }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch portfolio data');
      }
    } catch (err) {
      let errorMessage;
      
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error' || !err.response) {
        errorMessage = 'Network error - Please check your connection';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error - Please try again later';
      } else if (err.response?.status === 401) {
        errorMessage = 'Session expired - Please log in again';
      } else {
        errorMessage = err.response?.data?.message || err.message || 'Failed to fetch data';
      }
      
      setError(errorMessage);
      console.error('Portfolio API error:', err);
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate]);

  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  const totalGainLossPercentage = portfolioData?.total_gain_loss_percentage 
    ? parseFloat(portfolioData.total_gain_loss_percentage) 
    : 0;

  const isPositiveGain = totalGainLossPercentage >= 0;
  const activeSectors = data.filter(item => item.hasData).length;

  if (loading) {
    return (
      <Card className="bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-card-foreground">Portfolio by Sector</CardTitle>
          <CardDescription>Sector allocation breakdown - Current portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-card-foreground">Portfolio by Sector</CardTitle>
          <CardDescription>Sector allocation breakdown - Current portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorState error={error} onRetry={fetchPortfolioData} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-card-foreground">Portfolio by Sector</CardTitle>
        <CardDescription>Sector allocation breakdown - Current portfolio</CardDescription>
      </CardHeader>
      
      <CardContent>
        {data.length === 0 && (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <p>No sector data available</p>
          </div>
        )}
        
        {data.length > 0 && (
          <ChartContainer config={chartConfig} className="h-64">
            <BarChart
              accessibilityLayer
              data={data}
              layout="vertical"
              margin={{ left: 20, right: 20 }}
              barCategoryGap="5%"
            >
              <XAxis type="number" dataKey="value" hide />
              <YAxis
                dataKey="sector"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={100}
                tickFormatter={(value) => value.length > 15 ? value.slice(0, 15) + '...' : value}
                fontSize={14}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name, props) => {
                      if (!props.payload?.hasData || value === null) return null;
                      return [`${value.toFixed(1)}%`, 'Allocation'];
                    }}
                  />
                }
              />
              <Bar
                dataKey="value"
                fill="hsl(var(--primary))"
                radius={[0, 5, 5, 0]}
                opacity={0.8}
                barSize={20}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      
      <CardFooter className="flex-col items-start gap-2 text-sm border-t border-border pt-3">
        <div className="flex gap-2 font-medium leading-none">
          <span className={isPositiveGain ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
            {isPositiveGain ? 'Up' : 'Down'} {Math.abs(totalGainLossPercentage).toFixed(1)}% overall
          </span>
          <TrendingUp className={`h-4 w-4 ${isPositiveGain ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400 rotate-180'}`} />
        </div>
        <div className="leading-none text-muted-foreground">
          {portfolioData?.number_of_holdings || 0} holdings across {activeSectors} active sectors
        </div>
      </CardFooter>
    </Card>
  );
}

export default SectorBarChart;
