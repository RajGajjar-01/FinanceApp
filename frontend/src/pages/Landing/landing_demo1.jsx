import Header from '@/components/header';
import Footer from '@/components/footer';
import React, { useState } from 'react';

import heroImage from '@/assets/dashboardImage.jpg';

import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import TiltedCard from '@/components/react-bits/TiltedCard';
import CountUp from '../../components/react-bits/CountUp';

import {
  Sparkles,
  Rocket,
  ArrowRight,
  Target,
  Users,
  BarChart3,
  Award,
  Zap,
  Scan,
  TrendingUp,
  Brain,
  CheckCircle,
  Upload,
  MessageSquare,
  Star,
} from 'lucide-react';

// Professional animation variants
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: 'easeOut' },
  },
};

const popupAnimation = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
};

// New button animations
const buttonHover = {
  scale: 1.05,
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
  },
};

const buttonTap = {
  scale: 0.95,
};

// New animation for TiltedCard
const cardSlideUp = {
  initial: {
    opacity: 0,
    y: 60,
    scale: 0.8,
    rotateX: 15,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
      delay: 0.4,
      type: 'spring',
      stiffness: 100,
    },
  },
};

const floatingAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// New hover effects for stats cards
const statsHover = {
  scale: 1.03,
  y: -5,
  transition: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  },
};

// Updated slower animations for problem & solution
const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] },
};

const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

// Card hover animation
const cardHover = {
  scale: 1.02,
  y: -5,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  transition: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  },
};

// Feature text hover animation
const featureHover = {
  color: 'rgba(255, 255, 255, 1)',
  textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
  transition: {
    duration: 0.3,
    ease: 'easeInOut',
  },
};

const LandingDemo = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const stats = [
    { number: 5000, label: 'Active Users', icon: Users },
    { number: 25000, label: 'Transactions Tracked', icon: BarChart3 },
    { number: 98, label: 'User Satisfaction', icon: Award, suffix: '%' },
    { number: 24, label: 'AI Response Time', icon: Zap, suffix: 'ms' },
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

  // Updated problems array with 5 points
  const problems = [
    'Manual expense tracking wastes hours',
    'Investment performance is confusing',
    'No personalized financial guidance',
    'Fragmented view of financial health',
    'Multiple apps create data silos',
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
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center py-20">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center max-w-6xl mx-auto"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                <Badge className="mb-6 text-base font-semibold px-4 py-2">
                  <Sparkles className="w-5 h-5 mr-2" />
                  The Future of Personal Finance
                </Badge>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-6xl font-bold mb-6 leading-tight max-w-3xl mx-auto text-center"
                variants={fadeInUp}
              >
                <span className="block text-blue-600 dark:text-blue-400">FinanceIQ</span>
                <span className="block text-gray-800 dark:text-gray-200">Your Complete</span>
                <span className="block text-gray-500 dark:text-gray-400">Money Manager</span>
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed"
                variants={popupAnimation}
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
                className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
                variants={fadeInUp}
              >
                {/* Get Started Button with Animations */}
                <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                  <Button size="lg" className="px-8 py-3 relative overflow-hidden group">
                    <Rocket className="mr-2 h-5 w-5" />
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                    {/* Shine effect on hover */}
                    <motion.div
                      className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"
                      style={{ transform: 'skewX(-15deg)' }}
                    />
                  </Button>
                </motion.div>

                {/* Watch Demo Button with Animations */}
                <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                  <Button size="lg" variant="outline" className="px-8 py-3 group">
                    <Target className="mr-2 h-5 w-5 group-hover:text-primary transition-colors" />
                    Watch Demo
                  </Button>
                </motion.div>
              </motion.div>

              {/* Improved TiltedCard with Motion Animation and Better Alignment */}
              <motion.div
                className="flex justify-center items-center mt-8"
                variants={cardSlideUp}
                animate={floatingAnimation}
              >
                <div className="relative max-w-2xl mx-auto">
                  {/* Glow effect behind the card */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl scale-110 opacity-60" />

                  {/* TiltedCard Container with proper sizing and centering */}
                  <div className="relative z-10 flex justify-center">
                    <TiltedCard
                      imageSrc={heroImage}
                      altText="FinanceIQ Dashboard Preview"
                      containerHeight="400px"
                      containerWidth="600px"
                      imageHeight="400px"
                      imageWidth="600px"
                      rotateAmplitude={8}
                      scaleOnHover={1.05}
                      showMobileWarning={false}
                      showTooltip={true}
                      displayOverlayContent={true}
                      className="shadow-2xl rounded-2xl overflow-hidden"
                    />
                  </div>
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
                <motion.div
                  key={index}
                  className="text-center cursor-pointer p-4 rounded-lg hover:bg-primary/5 hover:shadow-lg border border-transparent hover:border-primary/10"
                  variants={fadeInUp}
                  whileHover={statsHover}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors hover:bg-primary/15">
                    <stat.icon className="h-8 w-8 text-primary transition-transform" />
                  </motion.div>

                  <motion.div
                    className="text-3xl md:text-4xl font-bold mb-2"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <CountUp
                      from={0}
                      to={stat.number}
                      separator=","
                      direction="up"
                      duration={1}
                      className="count-up-text text-foreground"
                    />
                    {stat.suffix && <span className="text-primary">{stat.suffix}</span>}
                  </motion.div>

                  <p className="text-muted-foreground font-medium transition-colors hover:text-foreground">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section with Morphing Expansion Animation */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
            >
              <Badge className="mb-6 text-base font-semibold px-4 py-2">
                <Award className="w-4 h-4 mr-2" />
                Why Choose FinanceIQ?
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-primary">
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
                <motion.div
                  key={index}
                  className="relative h-80"
                  variants={fadeInUp}
                  onHoverStart={() => setHoveredCard(index)}
                  onHoverEnd={() => setHoveredCard(null)}
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <motion.div
                    className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="w-full h-full border-2 shadow-lg relative overflow-hidden bg-gradient-to-br from-background to-primary/5">
                      {/* Initial State - Icon and Category */}
                      <motion.div
                        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                        animate={{
                          opacity: hoveredCard === index ? 0 : 1,
                          scale: hoveredCard === index ? 0.8 : 1,
                        }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      >
                        <motion.div
                          className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <feature.icon className="h-10 w-10 text-primary-foreground" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-primary leading-tight">
                          {feature.category}
                        </h3>
                      </motion.div>

                      {/* Hover State - Feature Details */}
                      <motion.div
                        className="absolute inset-0 p-6 flex flex-col justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: hoveredCard === index ? 1 : 0,
                          y: hoveredCard === index ? 0 : 20,
                        }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <motion.div
                            className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center"
                            transition={{ duration: 0.6 }}
                          >
                            <feature.icon className="h-6 w-6 text-primary-foreground" />
                          </motion.div>
                          <h4 className="text-lg font-bold text-primary">{feature.category}</h4>
                        </div>
                        <div className="space-y-3">
                          {feature.items.map((item, itemIndex) => (
                            <motion.div
                              key={itemIndex}
                              className="flex items-center gap-3"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{
                                opacity: hoveredCard === index ? 1 : 0,
                                x: hoveredCard === index ? 0 : -20,
                              }}
                              transition={{
                                delay: hoveredCard === index ? 0.2 + itemIndex * 0.1 : 0,
                                duration: 0.3,
                              }}
                            >
                              <motion.div
                                whileHover={{ scale: 1.2, rotate: 90 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                              >
                                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                              </motion.div>
                              <span className="text-sm font-medium">{item}</span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Problem & Solution Section - Improved */}
        <section className="py-20 border-t">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-start relative">
              <motion.div
                className="flex flex-col justify-start h-full"
                initial="initial"
                whileInView="animate"
                variants={slideInLeft}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-start mb-6">
                  <Badge className="text-base font-semibold px-4 py-2 bg-destructive/10 text-destructive border-destructive/20">
                    🔍 The Problem
                  </Badge>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold mb-6 leading-tight">
                  Managing personal finances shouldn't require{' '}
                  <span className="text-destructive">five different apps</span>
                </h3>

                <div className="space-y-4 flex-grow">
                  {problems.map((problem, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 1 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-2 h-2 bg-destructive rounded-full flex-shrink-0 mt-2" />
                      <p className="text-muted-foreground leading-relaxed">{problem}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Solutions Section */}
              <motion.div
                className="flex flex-col justify-start h-full"
                initial="initial"
                whileInView="animate"
                variants={slideInRight}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-start mb-6">
                  <Badge className="text-base font-semibold px-4 py-2 bg-primary/10 text-primary border-primary/20">
                    ✅ The Solution
                  </Badge>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold mb-6 leading-tight">
                  One intelligent platform that{' '}
                  <span className="text-primary">connects everything</span>
                </h3>

                <div className="flex-grow">
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Experience the future of financial management with our AI-powered platform that
                    unifies your spending, savings, and investments with intelligent insights.
                  </p>

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <Button className="px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300">
                      See How It Works
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works Section - Alternative Design */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
            >
              <Badge className="mb-6 text-base font-semibold px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                How It Works
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-primary">
                Your Journey to Financial Freedom
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Follow these simple steps to transform your financial management experience
              </p>
            </motion.div>

            {/* Vertical Timeline Design */}
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-muted/30"></div>

                {/* Animated Progress Line */}
                <motion.div
                  className="absolute left-8 md:left-1/2 top-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600"
                  initial={{ height: 0 }}
                  whileInView={{ height: '100%' }}
                  transition={{ duration: 2.5, ease: 'easeInOut', delay: 0.5 }}
                  viewport={{ once: true }}
                />

                {/* Steps */}
                <div className="space-y-16">
                  {steps.map((step, index) => (
                    <motion.div
                      key={index}
                      className={`relative flex items-center ${
                        index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                      }`}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.2 }}
                      viewport={{ once: true }}
                    >
                      {/* Step Circle */}
                      <motion.div
                        className="absolute left-6 md:left-1/2 md:-translate-x-1/2 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg z-10"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: 0.8 + index * 0.2, type: 'spring', stiffness: 400 }}
                        viewport={{ once: true }}
                      >
                        {step.number}
                      </motion.div>

                      {/* Content Card */}
                      <div
                        className={`ml-20 md:ml-0 md:w-5/12 ${
                          index % 2 === 0 ? 'md:mr-auto md:pr-16' : 'md:ml-auto md:pl-16'
                        }`}
                      >
                        <motion.div
                          whileInView={{ scale: [0.9, 1.02, 1] }}
                          transition={{ delay: 1 + index * 0.2, duration: 0.4 }}
                          viewport={{ once: true }}
                        >
                          <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 border hover:border-primary/30 bg-gradient-to-br from-background to-primary/5 group cursor-pointer">
                            <CardHeader className="pb-3">
                              {/* Icon */}
                              <motion.div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-all duration-300">
                                <step.icon className="h-6 w-6 text-primary group-hover:text-primary/80 transition-colors duration-300" />
                              </motion.div>

                              <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                                {step.title}
                              </CardTitle>
                            </CardHeader>

                            <CardContent>
                              <CardDescription className="text-muted-foreground leading-relaxed text-base group-hover:text-foreground/80 transition-colors duration-300">
                                {step.description}
                              </CardDescription>
                            </CardContent>

                            {/* Hover Effects */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none"
                              whileHover={{ scale: 1.02 }}
                            />
                          </Card>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
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
              <Badge className="mb-6 text-base font-semibold px-4 py-2">
                🌟 What Our Users Say
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-primary">
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
              <Badge className="mb-6 text-base font-semibold px-4 py-2">💵 Simple Pricing</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Start Free, <span className="text-primary">Upgrade When Ready</span>
              </h2>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
              initial="initial"
              whileInView="animate"
              variants={staggerContainer}
              viewport={{ once: true }}
            >
              {pricingPlans.map((plan, index) => (
                <motion.div key={index} variants={scaleIn} whileHover={cardHover}>
                  <Card
                    className={`h-full border shadow-sm relative transition-all duration-300 hover:bg-gradient-to-br hover:from-background/50 hover:to-primary/10 ${
                      plan.popular ? 'border-primary shadow-primary/20' : ''
                    }`}
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
                          <motion.li
                            key={featureIndex}
                            className="flex items-center gap-2 text-sm transition-all duration-300 cursor-pointer"
                          >
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                      <Button
                        className="w-full transition-all duration-300 hover:shadow-lg"
                        variant={plan.popular ? 'default' : 'outline'}
                      >
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
              <Badge className="mb-6 text-base font-semibold px-4 py-2">
                ❓ Frequently Asked Questions
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-primary">Got Questions?</h2>
            </motion.div>

            <motion.div
              className="max-w-4xl mx-auto"
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
                    className="border rounded-lg px-6 py-1"
                  >
                    <AccordionTrigger className="text-left font-semibold hover:text-primary py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
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
    </>
  );
};

export default LandingDemo;
