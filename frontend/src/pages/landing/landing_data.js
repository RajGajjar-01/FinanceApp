import { Users, BarChart3, Award, Zap, Scan, TrendingUp, Brain, Upload, MessageSquare } from 'lucide-react';

export const stats = [
  { number: 5000, label: 'Active Users', icon: Users },
  { number: 25000, label: 'Transactions Tracked', icon: BarChart3 },
  { number: 98, label: 'User Satisfaction', icon: Award, suffix: '%' },
  { number: 24, label: 'AI Response Time', icon: Zap, suffix: 'ms' },
];

export const features = [
  {
    category: 'Smart Expense Tracking',
    icon: Scan,
    items: [
      'OCR receipt scanning',
      'Smart categorization',
      'Budget management',
      'Trend analysis',
    ],
  },
  {
    category: 'Portfolio Management',
    icon: TrendingUp,
    items: [
      'Real-time valuations',
      'Performance analytics',
      'Asset allocation',
      'Risk assessment',
    ],
  },
  {
    category: 'AI Financial Assistant',
    icon: Brain,
    items: [
      'Natural-language queries',
      'Personalized insights',
      'Spending optimization',
      'Investment advice',
    ],
  },
];

export const problems = [
  'Manual expense tracking wastes hours',
  'Investment performance is confusing',
  'No personalized financial guidance',
  'Fragmented view of financial health',
  'Multiple apps create data silos',
];

export const steps = [
  {
    number: 1,
    title: 'Connect Your Finances',
    description: 'Upload receipts, add expenses, import investment data',
    icon: Upload,
  },
  {
    number: 2,
    title: 'Let AI Learn Your Patterns',
    description: 'Our system analyzes your spending & investments',
    icon: Brain,
  },
  {
    number: 3,
    title: 'Get Personalized Insights',
    description: 'Ask questions, receive alerts, decide smarter',
    icon: MessageSquare,
  },
  {
    number: 4,
    title: 'Watch Your Wealth Grow',
    description: 'Track progress toward your goals with actionable recommendations',
    icon: TrendingUp,
  },
];

export const testimonials = [
  {
    quote:
      'Finally, an app that gets the complete financial picture. The AI assistant feels like having a personal financial advisor 24/7.',
    name: 'Rahul S.',
    title: 'Software Engineer',
    avatar: '👨‍💻',
    rating: 5,
  },
  {
    quote:
      'Scanning receipts and seeing my portfolio alongside expenses is a game-changer. Saved me hours every week!',
    name: 'Priya M.',
    title: 'Entrepreneur',
    avatar: '👩‍💼',
    rating: 5,
  },
  {
    quote:
      'AI insights helped me plug spending leaks. Saved me ₹15,000 last month! The ROI is incredible.',
    name: 'Amit K.',
    title: 'Marketing Manager',
    avatar: '👨‍💼',
    rating: 5,
  },
];

export const pricingPlans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      'Basic expense tracking',
      'Portfolio monitoring',
      '5 AI queries/month',
      'Core insights & alerts',
      'Bank-grade security',
    ],
    popular: false,
  },
  {
    name: 'Pro',
    price: 299,
    description: 'For serious money managers',
    features: [
      'Unlimited expense tracking',
      'Advanced portfolio analytics',
      '100 AI queries/month',
      'Custom categories & tags',
      'Priority support',
      'Export capabilities',
    ],
    popular: true,
  },
  {
    name: 'Premium',
    price: 599,
    description: 'Complete financial control',
    features: [
      'Everything in Pro',
      'Unlimited AI queries',
      'Advanced reporting',
      'Multi-account sync',
      'Custom alerts',
      'Dedicated support',
    ],
    popular: false,
  },
];