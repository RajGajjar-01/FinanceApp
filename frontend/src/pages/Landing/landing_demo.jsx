import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import CountUp from '../../components/react-bits/CountUp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  TrendingUp,
  Scan,
  BarChart3,
  Zap,
  CheckCircle,
  Star,
  ArrowRight,
  Upload,
  MessageSquare,
  Users,
  Award,
  Sparkles,
  Target,
  Rocket,
  Shield,
  CreditCard,
  PieChart,
  Bell,
  DollarSign,
  TrendingDown,
  Building,
} from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import heroImage from '@/assets/dashboardImage.jpg';

// Professional animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

const slideInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
};

const slideInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
};

const AnimatedCounter = ({ end, duration = 2, suffix = '+' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      onViewportEnter={() => setIsVisible(true)}
      className="text-3xl font-bold text-primary"
      viewport={{ once: true }}
    >
      {isVisible && (
        <CountUp
          from={0}
          to={end}
          separator=","
          direction="up"
          duration={duration}
          className="count-up-text"
        />
      )}
    </motion.div>
  );
};

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  const testimonials = [
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

  const features = [
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

  const steps = [
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

  const stats = [
    { number: 50000, label: 'Active Users', icon: Users },
    { number: 2500000, label: 'Transactions Tracked', icon: BarChart3 },
    { number: 98, label: 'User Satisfaction', icon: Award, suffix: '%' },
    { number: 24, label: 'AI Response Time', icon: Zap, suffix: 'ms' },
  ];

  const pricingPlans = [
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
    {
      name: 'Enterprise',
      price: 1299,
      description: 'For businesses & teams',
      features: [
        'Everything in Premium',
        'Team collaboration',
        'Admin dashboard',
        'API access',
        'Custom integrations',
        'White-label option',
      ],
      popular: false,
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center py-20">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center max-w-4xl mx-auto"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                <Badge className="mb-6 text-sm font-medium">
                  <Sparkles className="w-4 h-4 mr-2" />
                  The Future of Personal Finance
                </Badge>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
                variants={fadeInUp}
              >
                <span className="text-primary">FinanceIQ</span>
                <br />
                <span className="text-foreground">Your Complete</span>
                <br />
                <span className="text-muted-foreground">Money Manager</span>
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed"
                variants={fadeInUp}
              >
                <span className="text-primary font-semibold">Track Expenses</span>
                <span className="mx-2">•</span>
                <span className="text-primary font-semibold">Manage Portfolio</span>
                <span className="mx-2">•</span>
                <span className="text-primary font-semibold">Ask AI Anything</span>
              </motion.p>

              <motion.p
                className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto"
                variants={fadeInUp}
              >
                The only finance app that combines expense tracking, investment management, and
                intelligent insights in one secure platform.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
                variants={fadeInUp}
              >
                <Button size="lg" className="px-8 py-3">
                  <Rocket className="mr-2 h-5 w-5" />
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="px-8 py-3">
                  <Target className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </motion.div>

              {/* Hero Image */}
              <motion.div className="relative" variants={scaleIn}>
                <div className="relative mx-auto max-w-4xl">
                  <img
                    src={heroImage}
                    alt="FinanceIQ Dashboard Preview"
                    className="rounded-xl shadow-2xl border border-border mx-auto"
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 border-t">
          <div className="container mx-auto px-4">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
              initial="initial"
              whileInView="animate"
              variants={staggerContainer}
              viewport={{ once: true }}
            >
              {stats.map((stat, index) => (
                <motion.div key={index} className="text-center" variants={fadeInUp}>
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                  <AnimatedCounter end={stat.number} suffix={stat.suffix || '+'} />
                  <p className="text-muted-foreground font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 text-sm font-medium">
                <Award className="w-4 h-4 mr-2" />
                Why Choose FinanceIQ?
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
                Revolutionary Features
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience the next generation of financial management with AI-powered insights.
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-8"
              initial="initial"
              whileInView="animate"
              variants={staggerContainer}
              viewport={{ once: true }}
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="h-full border shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4">
                        <feature.icon className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-xl font-bold text-primary">
                        {feature.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {feature.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                            <span className="text-sm font-medium">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Problem & Solution */}
        <section className="py-20 border-t">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial="initial"
                whileInView="animate"
                variants={slideInLeft}
                viewport={{ once: true }}
              >
                <Badge className="mb-4 bg-destructive text-destructive-foreground text-sm">
                  🔍 The Problem
                </Badge>
                <h3 className="text-2xl md:text-3xl font-bold mb-6">
                  Managing personal finances shouldn't require{' '}
                  <span className="text-destructive">five different apps</span>
                </h3>
                <div className="space-y-4">
                  {[
                    'Manual expense tracking wastes hours',
                    'Investment performance is confusing',
                    'No personalized financial guidance',
                    'Fragmented view of financial health',
                  ].map((problem, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-destructive rounded-full flex-shrink-0" />
                      <p className="text-muted-foreground">{problem}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial="initial"
                whileInView="animate"
                variants={slideInRight}
                viewport={{ once: true }}
              >
                <Badge className="mb-4 text-sm">✅ The Solution</Badge>
                <h3 className="text-2xl md:text-3xl font-bold mb-6">
                  One intelligent platform that{' '}
                  <span className="text-primary">connects everything</span>
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Experience the future of financial management with our AI-powered platform that
                  unifies your spending, savings, and investments with intelligent insights.
                </p>
                <Button className="px-6 py-2">
                  See How It Works
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 text-sm font-medium">
                <Zap className="w-4 h-4 mr-2" />
                How It Works
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
                Get Started in 4 Simple Steps
              </h2>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              initial="initial"
              whileInView="animate"
              variants={staggerContainer}
              viewport={{ once: true }}
            >
              {steps.map((step, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="text-center h-full border shadow-sm hover:shadow-md transition-all duration-300">
                    <CardContent className="pt-8">
                      <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                        <step.icon className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                        {step.number}
                      </div>
                      <h3 className="text-lg font-bold mb-3">{step.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-20 border-t">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 text-sm">🌟 What Our Users Say</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
                Loved by Thousands
              </h2>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-8"
              initial="initial"
              whileInView="animate"
              variants={staggerContainer}
              viewport={{ once: true }}
            >
              {testimonials.map((testimonial, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="h-full border shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <blockquote className="text-muted-foreground mb-4 italic">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-lg">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{testimonial.name}</p>
                          <p className="text-muted-foreground text-xs">{testimonial.title}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 text-sm">💵 Simple Pricing</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Start Free, <span className="text-primary">Upgrade When Ready</span>
              </h2>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
              initial="initial"
              whileInView="animate"
              variants={staggerContainer}
              viewport={{ once: true }}
            >
              {pricingPlans.map((plan, index) => (
                <motion.div key={index} variants={scaleIn}>
                  <Card
                    className={`h-full border shadow-sm relative ${plan.popular ? 'border-primary shadow-primary/20' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="text-xs">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                      <CardDescription className="text-sm">{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-3xl font-bold mb-6">
                        <span className="text-primary">₹{plan.price}</span>
                        <span className="text-sm text-muted-foreground">/month</span>
                      </div>
                      <ul className="space-y-2 mb-8 text-left">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                        {plan.price === 0 ? 'Get Started Free' : 'Choose Plan'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 border-t">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 text-sm">❓ Frequently Asked Questions</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Got Questions?</h2>
            </motion.div>

            <motion.div
              className="max-w-3xl mx-auto"
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
            >
              <Accordion type="single" collapsible className="space-y-4">
                {[
                  {
                    question: 'Is my data safe and secure?',
                    answer:
                      'Absolutely. We use bank-grade encryption with zero-knowledge architecture. Your financial data is protected with the same security standards used by major financial institutions.',
                  },
                  {
                    question: 'Can I import data from other apps?',
                    answer:
                      'Yes! We support CSV imports from banks, brokers, and popular finance tools like Mint, YNAB, and Personal Capital. We also offer direct bank connections through secure APIs.',
                  },
                  {
                    question: 'How accurate is the AI assistant?',
                    answer:
                      'Our AI is trained on millions of financial data points and learns from your specific spending patterns. It provides personalized insights with 95%+ accuracy.',
                  },
                  {
                    question: 'Do I need to connect my bank account?',
                    answer:
                      'No, bank connections are completely optional. You can start by manually adding expenses and investments, or upload CSV files.',
                  },
                  {
                    question: 'What happens if I exceed the free plan limits?',
                    answer:
                      'The free plan includes 5 AI queries per month. If you need more, you can upgrade to our Pro plan for unlimited AI queries and advanced features.',
                  },
                ].map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border rounded-lg px-6"
                  >
                    <AccordionTrigger className="text-left font-semibold hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary relative overflow-hidden">
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              className="max-w-3xl mx-auto text-primary-foreground"
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to Take Control of Your <span className="text-secondary">Finances?</span>
              </h2>

              <p className="text-lg md:text-xl mb-8 opacity-90 leading-relaxed">
                Join over 50,000 users who are already managing their money smarter with FinanceIQ.
                Start your journey to financial freedom today.
              </p>

              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg font-semibold">
                <Rocket className="mr-2 h-5 w-5" />
                Start Your Free Journey Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <p className="mt-6 text-sm opacity-75">
                No credit card required • Setup in under 2 minutes • Cancel anytime
              </p>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
