// dummyData.js - Dummy data for trading dashboard

export const portfolioSummary = {
  totalValue: 72231.32,
  change: -0.34,
  changePercent: -0.47
};

export const stockData = [
  { symbol: 'AAPL', price: 175.43, change: -2.10, changePercent: -1.18, volume: '64.2M' },
  { symbol: 'GOOGL', price: 138.21, change: 1.85, changePercent: 1.36, volume: '28.1M' },
  { symbol: 'MSFT', price: 378.85, change: -0.95, changePercent: -0.25, volume: '31.7M' },
  { symbol: 'TSLA', price: 248.50, change: 4.20, changePercent: 1.72, volume: '89.3M' },
  { symbol: 'AMZN', price: 145.12, change: -1.30, changePercent: -0.89, volume: '42.8M' },
  { symbol: 'NVDA', price: 465.20, change: 8.75, changePercent: 1.92, volume: '55.6M' },
  { symbol: 'META', price: 298.35, change: -3.45, changePercent: -1.14, volume: '19.2M' },
  { symbol: 'NFLX', price: 445.67, change: 2.80, changePercent: 0.63, volume: '12.4M' }
];

export const chartData = [
  { time: '09:30', price: 72500, volume: 1200000 },
  { time: '10:00', price: 72180, volume: 1350000 },
  { time: '10:30', price: 72350, volume: 980000 },
  { time: '11:00', price: 72120, volume: 1450000 },
  { time: '11:30', price: 72280, volume: 1100000 },
  { time: '12:00', price: 72150, volume: 890000 },
  { time: '12:30', price: 72320, volume: 1250000 },
  { time: '13:00', price: 72090, volume: 1380000 },
  { time: '13:30', price: 72240, volume: 920000 },
  { time: '14:00', price: 72180, volume: 1150000 },
  { time: '14:30', price: 72300, volume: 1050000 },
  { time: '15:00', price: 72231, volume: 1280000 }
];

export const portfolioData = [
  { name: 'AAPL', value: 15420.50, allocation: 21.3, change: -2.1 },
  { name: 'GOOGL', value: 12890.25, allocation: 17.8, change: 1.85 },
  { name: 'MSFT', value: 11670.80, allocation: 16.2, change: -0.95 },
  { name: 'TSLA', value: 9845.75, allocation: 13.6, change: 4.20 },
  { name: 'NVDA', value: 8234.90, allocation: 11.4, change: 8.75 },
  { name: 'Others', value: 14169.12, allocation: 19.7, change: 0.45 }
];

export const marketNews = [
  {
    title: "Market Summary",
    content: "Indices finished the day with marginal gains. The market showed resilience despite economic uncertainties, with tech stocks leading the rally.",
    time: "2 hours ago"
  },
  {
    title: "Banking and Financials: Sector Performance",
    content: "Banking sector showed mixed performance with some institutions reporting better than expected earnings.",
    time: "4 hours ago"
  }
];

export const watchlistData = [
  { symbol: 'BTC-USD', price: 45234.56, change: 1250.45, changePercent: 2.84 },
  { symbol: 'ETH-USD', price: 2847.32, change: -45.20, changePercent: -1.56 },
  { symbol: 'SPY', price: 445.67, change: 2.34, changePercent: 0.53 },
  { symbol: 'QQQ', price: 375.89, change: -1.25, changePercent: -0.33 }
];