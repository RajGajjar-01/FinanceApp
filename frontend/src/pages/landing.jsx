
import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
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
  Brain, TrendingUp, Scan, BarChart3, Zap, CheckCircle, Star,
  ArrowRight, Upload, MessageSquare, Users, Award, Sparkles, Target, Rocket
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
};
const staggerContainer = {
  animate: { transition: { staggerChildren: 0.15 } },
};
const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
};
const slideInLeft = {
  initial: { opacity: 0, x: -80 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
};
const slideInRight = {
  initial: { opacity: 0, x: 80 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
};

const AnimatedCounter = ({ end, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      onViewportEnter={() => setIsVisible(true)}
      className="text-4xl font-bold text-primary"
      whileHover={{ scale: 1.1 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {count.toLocaleString()}+
    </motion.div>
  );
};

const FloatingElement = ({ children, delay = 0, intensity = 1 }) => (
  <motion.div
    animate={{
      y: [0, -15 * intensity, 0],
      rotate: [0, 2, 0, -2, 0],
    }}
    transition={{
      duration: 4 + delay,
      repeat: Number.POSITIVE_INFINITY,
      delay,
      ease: 'easeInOut',
    }}
  >
    {children}
  </motion.div>
);

const ParticleField = () => {
  const particles = Array.from({ length: 30 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle}
          className="absolute w-1 h-1 bg-muted-foreground/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.5, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

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
      layout: 'default',
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
      layout: 'featured',
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
      layout: 'compact',
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
    { number: 50000, label: 'Active Users', icon: Users, color: 'bg-primary' },
    { number: 2500000, label: 'Transactions Tracked', icon: BarChart3, color: 'bg-accent' },
    { number: 98, label: 'User Satisfaction', icon: Award, suffix: '%', color: 'bg-success' },
    { number: 24, label: 'AI Response Time', icon: Zap, suffix: 'ms', color: 'bg-warning' },
  ];

  return (
    <>
      {/* <Header /> */}
      <div className="min-h-screen bg-background overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center">
          <ParticleField />
          <div className="container mx-auto px-4 py-20 relative z-10">
            <motion.div
              className="text-center max-w-6xl mx-auto"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                <Badge className="mb-8 bg-primary text-primary-foreground border-0 px-6 py-3 text-base font-semibold">
                  <Sparkles className="w-4 h-4 mr-2" />
                  The Future of Personal Finance
                </Badge>
              </motion.div>

              <motion.h1
                className="text-6xl md:text-8xl lg:text-9xl font-black mb-10 leading-tight tracking-tight"
                variants={fadeInUp}
              >
                <motion.span className="block text-primary">
                  FinanceIQ
                </motion.span>
                <motion.span
                  className="block text-foreground mt-4"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  Your Complete
                </motion.span>
                <motion.span
                  className="block text-muted-foreground"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
                  Money Manager
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-xl md:text-3xl text-muted-foreground mb-8 font-medium"
                variants={fadeInUp}
              >
                <motion.span className="text-primary font-bold" whileHover={{ scale: 1.05 }}>
                  Track Expenses
                </motion.span>
                <span className="mx-3 text-2xl">•</span>
                <motion.span className="text-primary font-bold" whileHover={{ scale: 1.05 }}>
                  Manage Portfolio
                </motion.span>
                <span className="mx-3 text-2xl">•</span>
                <motion.span className="text-primary font-bold" whileHover={{ scale: 1.05 }}>
                  Ask AI Anything
                </motion.span>
              </motion.p>

              <motion.p
                className="text-lg text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed"
                variants={fadeInUp}
              >
                The only finance app that combines expense tracking, investment management, and
                intelligent insights in one secure platform. Experience the future of personal
                finance management.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-6 justify-center mb-20"
                variants={fadeInUp}
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="px-12 py-6 text-xl font-bold rounded-2xl"
                  >
                    <Rocket className="mr-3 h-6 w-6" />
                    Get Started Free
                    <motion.div
                      animate={{ x: [0, 8, 0] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <ArrowRight className="ml-3 h-6 w-6" />
                    </motion.div>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-12 py-6 text-xl font-bold rounded-2xl"
                  >
                    <Target className="mr-3 h-6 w-6" />
                    Watch Demo
                  </Button>
                </motion.div>
              </motion.div>

              {/* Modern illustration/preview */}
              <motion.div className="relative" variants={scaleIn}>
                <FloatingElement intensity={1.3}>
                  <div className="relative mx-auto max-w-5xl">
                    <motion.div
                      className="absolute -inset-6 bg-muted/10 rounded-3xl blur-2xl"
                      animate={{ scale: [1, 1.08, 1], rotate: [0, 7, 0] }}
                      transition={{
                        duration: 8,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'easeInOut',
                      }}
                    />
                    <motion.img
                      src="/modern-finance-app-dashboard.png"
                      alt="FinanceIQ Dashboard Preview"
                      className="relative rounded-3xl shadow-2xl border border-border mx-auto max-w-full h-auto"
                      whileHover={{ scale: 1.025, y: -12 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    />
                  </div>
                </FloatingElement>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-muted/20 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
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
                  className="text-center group"
                  variants={fadeInUp}
                  whileHover={{ y: -10 }}
                >
                  <motion.div
                    className={`w-20 h-20 ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-300`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <stat.icon className="h-10 w-10 text-white" />
                  </motion.div>
                  <AnimatedCounter end={stat.number} />
                  <p className="text-muted-foreground font-semibold text-lg">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 relative">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-24"
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
            >
              <Badge className="mb-8 bg-primary text-primary-foreground border-0 px-6 py-3 text-lg font-semibold">
                <Award className="w-5 h-5 mr-2" />
                Why Choose FinanceIQ?
              </Badge>
              <h2 className="text-5xl md:text-7xl font-black mb-8 text-primary">
                Revolutionary Features
              </h2>
              <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Experience the next generation of financial management with AI-powered insights and
                seamless integration.
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-10"
              initial="initial"
              whileInView="animate"
              variants={staggerContainer}
              viewport={{ once: true }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className={feature.layout === 'featured' ? 'md:col-span-3 lg:col-span-1' : ''}
                >
                  <Card className="relative overflow-hidden border shadow-xl hover:shadow-2xl transition-all duration-700 group h-full">
                    {feature.layout === 'featured' && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-primary text-primary-foreground border-0">
                          <Star className="w-4 h-4 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="relative pb-4">
                      <motion.div
                        className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl ${
                          index === 0 ? 'bg-primary' : 
                          index === 1 ? 'bg-accent' : 
                          'bg-success'
                        }`}
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <feature.icon className="h-10 w-10 text-white" />
                      </motion.div>
                      <CardTitle className={`text-3xl font-bold ${
                        index === 0 ? 'text-primary' : 
                        index === 1 ? 'text-accent' : 
                        'text-success'
                      }`}>
                        {feature.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className={`grid ${feature.layout === 'compact' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                        {feature.items.map((item, itemIndex) => (
                          <motion.div
                            key={itemIndex}
                            className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: itemIndex * 0.1 }}
                            whileHover={{ scale: 1.05, x: 10 }}
                          >
                            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.3 }}>
                              <CheckCircle className={`h-6 w-6 ${
                                index === 0 ? 'text-primary' : 
                                index === 1 ? 'text-accent' : 
                                'text-success'
                              }`} />
                            </motion.div>
                            <span className="font-semibold text-lg">{item}</span>
                          </motion.div>
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
        <section className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial="initial"
                whileInView="animate"
                variants={slideInLeft}
                viewport={{ once: true }}
              >
                <Badge className="mb-6 bg-destructive text-destructive-foreground border-0 px-4 py-2">
                  🔍 The Problem
                </Badge>
                <h3 className="text-3xl md:text-4xl font-bold mb-8">
                  Managing personal finances shouldn't require{' '}
                  <span className="text-destructive">five different apps</span>
                </h3>
                <div className="space-y-6">
                  {[
                    'Manual expense tracking wastes hours',
                    'Investment performance is confusing',
                    'No personalized financial guidance',
                    'Fragmented view of financial health',
                  ].map((problem, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-4"
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="w-3 h-3 bg-destructive rounded-full" />
                      <p className="text-lg text-muted-foreground">{problem}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial="initial"
                whileInView="animate"
                variants={slideInRight}
                viewport={{ once: true }}
              >
                <Badge className="mb-6 bg-primary text-primary-foreground border-0 px-4 py-2">
                  ✅ The Solution
                </Badge>
                <h3 className="text-3xl md:text-4xl font-bold mb-8">
                  One intelligent platform that{' '}
                  <span className="text-primary">connects everything</span>
                </h3>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Experience the future of financial management with our AI-powered platform that
                  unifies your spending, savings, and investments with intelligent insights tailored
                  to your unique situation.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="px-8 py-4 text-lg font-semibold">
                    See How It Works
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-32">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-24"
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
            >
              <Badge className="mb-8 bg-primary text-primary-foreground border-0 px-6 py-3 text-lg font-semibold">
                <Zap className="w-5 h-5 mr-2" />
                How It Works
              </Badge>
              <h2 className="text-5xl md:text-7xl font-black mb-8 text-primary">
                Get Started in 4 Simple Steps
              </h2>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-10"
              initial="initial"
              whileInView="animate"
              variants={staggerContainer}
              viewport={{ once: true }}
            >
              {steps.map((step, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="text-center border shadow-xl hover:shadow-2xl transition-all duration-700 group relative overflow-hidden h-full">
                    <CardContent className="pt-10 relative z-10">
                      <motion.div
                        className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 shadow-2xl"
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <step.icon className="h-12 w-12 text-primary-foreground" />
                      </motion.div>

                      <motion.div
                        className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-8 text-xl font-black shadow-xl"
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        {step.number}
                      </motion.div>

                      <h3 className="text-2xl font-bold mb-6">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-lg">
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
        <section className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-20"
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
            >
              <Badge className="mb-6 bg-primary text-primary-foreground border-0 px-4 py-2">
                🌟 What Our Users Say
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
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
                  <Card className="border shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                    <CardContent className="pt-8 relative">
                      <div className="flex mb-6">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          </motion.div>
                        ))}
                      </div>
                      <blockquote className="text-lg text-muted-foreground mb-6 italic leading-relaxed">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-2xl">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-lg">{testimonial.name}</p>
                          <p className="text-muted-foreground">{testimonial.title}</p>
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
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-20"
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
            >
              <Badge className="mb-6 bg-primary text-primary-foreground border-0 px-4 py-2">
                💵 Simple Pricing
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Start Free, <span className="text-primary">Upgrade When Ready</span>
              </h2>
            </motion.div>

            <motion.div
              className="max-w-lg mx-auto"
              initial="initial"
              whileInView="animate"
              variants={scaleIn}
              viewport={{ once: true }}
            >
              <Card className="border shadow-2xl relative overflow-hidden">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground border-0 px-4 py-2">
                    Most Popular
                  </Badge>
                </div>
                <CardHeader className="text-center relative pt-8">
                  <CardTitle className="text-3xl font-bold">Free Forever</CardTitle>
                  <CardDescription className="text-lg">Perfect for getting started</CardDescription>
                </CardHeader>
                <CardContent className="text-center relative">
                  <div className="text-6xl font-bold mb-8">
                    <span className="text-primary">₹0</span>
                    <span className="text-2xl text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-4 mb-10 text-left">
                    {[
                      'Unlimited expense tracking',
                      'Basic portfolio monitoring',
                      '10 AI queries / month',
                      'Core insights & alerts',
                      'Bank-grade security',
                    ].map((feature, index) => (
                      <motion.li
                        key={index}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <span className="font-medium">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="w-full py-4 text-lg font-semibold">
                      Get Started Free – No Credit Card Required
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-20"
              initial="initial"
              whileInView="animate"
              variants={fadeInUp}
              viewport={{ once: true }}
            >
              <Badge className="mb-6 bg-primary text-primary-foreground border-0 px-4 py-2">
                ❓ Frequently Asked Questions
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
                Got Questions?
              </h2>
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
                      'Absolutely. We use bank-grade encryption with zero-knowledge architecture. Your financial data is protected with the same security standards used by major financial institutions, including 256-bit SSL encryption and multi-factor authentication.',
                  },
                  {
                    question: 'Can I import data from other apps?',
                    answer:
                      'Yes! We support CSV imports from banks, brokers, and popular finance tools like Mint, YNAB, and Personal Capital. We also offer direct bank connections through secure APIs to automatically sync your transactions.',
                  },
                  {
                    question: 'How accurate is the AI assistant?',
                    answer:
                      'Our AI is trained on millions of financial data points and learns from your specific spending patterns. It provides personalized insights with 95%+ accuracy and continuously improves as it learns more about your financial habits.',
                  },
                  {
                    question: 'Do I need to connect my bank account?',
                    answer:
                      'No, bank connections are completely optional. You can start by manually adding expenses and investments, or upload CSV files. Bank connections simply provide automated transaction importing for added convenience.',
                  },
                  {
                    question: 'What happens if I exceed the free plan limits?',
                    answer:
                      "The free plan includes 10 AI queries per month. If you need more, you'll be notified and can upgrade to our premium plan for unlimited AI queries, advanced analytics, and priority support.",
                  },
                ].map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border border-border rounded-lg px-6"
                  >
                    <AccordionTrigger className="text-left font-semibold text-lg hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative overflow-hidden bg-primary">
          <motion.div
            className="container mx-auto px-4 text-center relative z-10"
            initial="initial"
            whileInView="animate"
            variants={fadeInUp}
            viewport={{ once: true }}
          >
            <div className="max-w-5xl mx-auto text-primary-foreground">
              <motion.h2 className="text-5xl md:text-8xl font-black mb-12">
                Ready to Take Control of Your{' '}
                <motion.span
                  className="text-secondary"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  Finances?
                </motion.span>
              </motion.h2>

              <p className="text-xl md:text-3xl mb-16 opacity-90 leading-relaxed font-medium">
                Join over 50,000 users who are already managing their money smarter with FinanceIQ.
                Start your journey to financial freedom today.
              </p>

              <motion.div
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.95 }}
                className="relative inline-block"
              >
                <Button
                  size="lg"
                  variant="secondary"
                  className="px-16 py-8 text-2xl font-black shadow-2xl rounded-3xl"
                >
                  <Rocket className="mr-4 h-8 w-8" />
                  Start Your Free Journey Today
                  <motion.div
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <ArrowRight className="ml-4 h-8 w-8" />
                  </motion.div>
                </Button>
              </motion.div>

              <p className="mt-8 text-lg opacity-75">
                No credit card required • Setup in under 2 minutes • Cancel anytime
              </p>
            </div>
          </motion.div>
        </section>
      </div>
      {/* <Footer /> */}
    </>
  );
}
