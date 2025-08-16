import { Link } from 'react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Shield, TrendingUp, PieChart } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggler';
import { motion } from 'motion/react';

const Landing = () => {
  const features = [
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description:
        'Built with industry-leading security standards, including OAuth 2.0, JWT tokens, and encrypted data storage.',
      color: 'text-blue-500',
      gradient: 'from-blue-500/10 to-blue-600/10',
    },
    {
      icon: TrendingUp,
      title: 'Smart Analytics',
      description:
        'Advanced financial insights with AI-powered analytics, real-time reporting, and intelligent forecasting.',
      color: 'text-yellow-500',
      gradient: 'from-yellow-500/10 to-yellow-600/10',
    },
    {
      icon: PieChart,
      title: 'Portfolio Management',
      description:
        'Comprehensive portfolio tracking with automated rebalancing, risk assessment, and performance monitoring.',
      color: 'text-green-500',
      gradient: 'from-green-500/10 to-green-600/10',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration: 0.6,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration: 0.7,
      },
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient orbs for depth */}
      <div className="absolute top-0 left-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 blur-3xl opacity-50"></div>

      <motion.div
        className="container mx-auto px-2 sm:px-4 lg:px-8 py-12 sm:py-16 md:py-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center max-w-5xl mx-auto">
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center mb-8 gap-4 sm:gap-6"
            variants={itemVariants}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-center sm:text-left">
              Welcome to Finance App
            </h1>
            <motion.div className="flex-shrink-0" transition={{ duration: 0.6, ease: 'easeInOut' }}>
              <ModeToggle />
            </motion.div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-12 max-w-xs sm:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed font-medium px-4 sm:px-0"
            variants={itemVariants}
          >
            A comprehensive financial platform built with React and Django.
            <br className="hidden sm:block" />
            Secure banking, smart investments, and portfolio management in one place.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
            variants={itemVariants}
          >
            <div className="relative group">
              <Button
                size="default"
                asChild
                className="h-11 px-6 text-base font-semibold relative overflow-hidden bg-gradient-to-b from-primary to-primary/90 border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link to="/register" className="flex items-center relative">
                  Get Started
                </Link>
              </Button>
            </div>

            <div className="relative group">
              <Button
                variant="outline"
                size="default"
                asChild
                className="h-11 px-6 font-semibold text-base bg-background/50 backdrop-blur-sm border border-border/60 hover:border-border/80 hover:bg-background/80 hover:border-2 transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md"
              >
                <Link to="/login" className="relative">
                  Sign In
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-16 sm:mt-20 lg:mt-24 px-4 sm:px-0"
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{
                  y: -8,
                  transition: { type: 'spring', stiffness: 400, damping: 25 },
                }}
                className="group h-full"
              >
                <Card className="bg-gradient-to-b from-background/80 to-muted/20 backdrop-blur-sm hover:from-background/90 hover:to-muted/30 transition-all duration-500 shadow-lg hover:shadow-2xl h-full border border-border/60 dark:border-border/70 hover:border-border/70 dark:hover:border-border/80">
                  <CardContent className="p-4 sm:p-6 text-center h-full flex flex-col">
                    <motion.div
                      className="flex justify-center mb-3 sm:mb-4"
                      whileHover={{
                        scale: 1.1,
                        rotate: [0, -5, 5, 0],
                        transition: { duration: 0.4 },
                      }}
                    >
                      <div
                        className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.gradient} ${feature.color} shadow-lg`}
                      >
                        <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                    </motion.div>
                    <motion.h3
                      className="text-base sm:text-lg font-bold mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-300"
                      initial={{ opacity: 0.9 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {feature.title}
                    </motion.h3>
                    <motion.p
                      className="text-sm sm:text-base text-muted-foreground leading-relaxed flex-1"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {feature.description}
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom section with additional visual elements */}
          <motion.div
            className="mt-16 sm:mt-20 lg:mt-24 pt-8 sm:pt-12 border-t border-border/40"
            variants={itemVariants}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground px-4 sm:px-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-border/40"></div>
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>FDIC Insured</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-border/40"></div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Real-time Trading</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;
