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


// My Portfolio dummy data
export const myPortfolioData = [
  {
    id: 'AAPL',
    name: 'Apple Inc.',
    shares: 20,
    price: 148.79,
    change: -0.20,
    currentValue: 2972.4
  },
  {
    id: 'AMC',
    name: 'AMC Entertainment Holdings',
    shares: 10,
    price: 40.64,
    change: 3.42,
    currentValue: 408.8
  },
  {
    id: 'MRIN',
    name: 'Main Software Inc.',
    shares: 8,
    price: 12.88,
    change: 64.91,
    currentValue: 54.5
  },
  {
    id: 'MRNA',
    name: 'Moderna Inc.',
    shares: 5,
    price: 448.72,
    change: 1.56,
    currentValue: 872.48
  },
  {
    id: 'AZN',
    name: 'AstraZeneca plc',
    shares: 12,
    price: 232.32,
    change: 0.96,
    currentValue: 292.4
  }
];

// Filter tabs
export const portfolioTabs = [
  { key: 'all', label: 'All' },
  { key: 'gainers', label: 'Gainers' },
  { key: 'decliners', label: 'Decliners' },
  { key: 'see-all', label: 'See All' }
];

// My Watchlist dummy data
export const myWatchlistData = [
  {
    id: 'AAPL',
    name: 'Apple Inc.',
    change: -0.20,
    chartData: [100, 102, 98, 95, 97, 93, 90, 88, 85, 87, 82, 79, 75, 73, 70] // Declining trend
  },
  {
    id: 'AMC',
    name: 'AMC Entertainment Holdings',
    change: 3.42,
    chartData: [50, 52, 55, 53, 58, 60, 62, 65, 68, 66, 72, 75, 78, 80, 85] // Ascending trend with volatility
  },
  {
    id: 'MRIN',
    name: 'Main Software Inc.',
    change: 64.91,
    chartData: [20, 22, 25, 28, 30, 33, 35, 38, 42, 45, 48, 52, 55, 58, 62] // Strong ascending trend
  },
  {
    id: 'MRNA',
    name: 'Moderna Inc.',
    change: 1.56,
    chartData: [150, 152, 155, 153, 158, 160, 162, 164, 165, 167, 168, 170, 172, 174, 175] // Gradual ascending
  },
  {
    id: 'AZN',
    name: 'AstraZeneca plc',
    change: 0.96,
    chartData: [45, 46, 48, 47, 50, 49, 52, 54, 53, 55, 56, 57, 58, 59, 60] // Moderate ascending with fluctuation
  }
];

// Watchlist filter tabs
export const watchlistTabs = [
  { key: 'all', label: 'All' },
  { key: 'gainers', label: 'Gainers' },
  { key: 'decliners', label: 'Decliners' },
  { key: 'see-all', label: 'See All' }
];