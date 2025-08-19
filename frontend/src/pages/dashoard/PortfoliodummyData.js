// portfolioDummyData.js
export const portfolioSummary = {
  currentValue: 7291.32,
  dailyChange: 0.64,
  dailyChangePercent: 1.23,
  investedValue: 7291.32,
  investedChange: 0.64,
  investedChangePercent: 1.23,
};

// Portfolio return chart data matching the image
export const portfolioReturnData = [
  { date: 'Aug 26', value: 8000, timestamp: '2025-08-26' },
  { date: 'Aug 27', value: 6500, timestamp: '2025-08-27' },
  { date: 'Aug 28', value: 11000, timestamp: '2025-08-28' },
  { date: 'Aug 29', value: 9500, timestamp: '2025-08-29' },
  { date: 'Aug 30', value: 13000, timestamp: '2025-08-30' },
  { date: 'Aug 31', value: 15500, timestamp: '2025-08-31' },
  { date: 'Sep 1', value: 17000, timestamp: '2025-09-01' },
];

// Time period configuration
export const timePeriods = [
  { key: '1D', label: '1D', active: false },
  { key: '7D', label: '7D', active: false },
  { key: '1M', label: '1M', active: true },
  { key: '1Y', label: '1Y', active: false },
  { key: 'All', label: 'All', active: false },
];

// Chart configuration
export const chartConfig = {
  yAxisDomain: [0, 20000],
  yAxisTicks: [0, 5000, 10000, 15000, 20000],
  yAxisLabels: ['0', '$5K', '$10K', '$15K', '$20K'],
  chartHeight: 140,
  strokeWidth: 2.5,
  strokeColor: '#10b981',
  gridColor: '#374151',
  gridOpacity: 0.3,
};

// Transaction summary data
export const transactionSummary = {
  order: 29,
  maxOrder: 35,
  orderChangePercent: 5.24,
  orderChangeType: 'increase', // 'increase' or 'decrease'
  purchaseQuantity: 2189.48,
  currency: 'USDT'
};