import { Link } from "react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield, Zap, Users, Sparkles } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggler";
import { motion } from "motion/react";

const Landing = () => {
  const [isHovered, setIsHovered] = useState(false);

  // Features array moved outside JSX
  const features = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description:
        "Built with industry-leading security standards, including OAuth 2.0, JWT tokens, and encrypted data storage.",
      color: "text-blue-500",
      gradient: "from-blue-500/10 to-blue-600/10",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Optimized React components with server-side rendering and intelligent caching for sub-second load times.",
      color: "text-yellow-500",
      gradient: "from-yellow-500/10 to-yellow-600/10",
    },
    {
      icon: Users,
      title: "Infinitely Scalable",
      description:
        "Architected for growth with microservices, horizontal scaling, and enterprise-grade infrastructure.",
      color: "text-green-500",
      gradient: "from-green-500/10 to-green-600/10",
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
        type: "spring",
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
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.7,
      },
    },
  };

  const sparkleVariants = {
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, 180, 360],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden">


      {/* Floating sparkles with improved positioning */}
      <motion.div
        className="absolute top-20 left-16 text-primary/15 hidden md:block"
        variants={sparkleVariants}
        animate="animate"
      >
        <Sparkles className="h-5 w-5" />
      </motion.div>
      <motion.div
        className="absolute top-32 right-24 text-primary/15 hidden lg:block"
        variants={sparkleVariants}
        animate="animate"
        transition={{ delay: 0.8 }}
      >
        <Sparkles className="h-4 w-4" />
      </motion.div>
      <motion.div
        className="absolute bottom-32 left-24 text-primary/15 hidden md:block"
        variants={sparkleVariants}
        animate="animate"
        transition={{ delay: 1.6 }}
      >
        <Sparkles className="h-6 w-6" />
      </motion.div>

      {/* Gradient orbs for depth */}
      <div className="absolute top-0 left-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 blur-3xl opacity-50"></div> 

      <motion.div
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center max-w-5xl mx-auto">
          {/* Header with mode toggle */}
          <motion.div
            className="flex items-center justify-center mb-8"
            variants={itemVariants}
          >
            <div className="flex items-center gap-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none">
                Welcome to{" "}
                <motion.span
                  className="text-primary inline-block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
                >
                  AuthApp
                </motion.span>
              </h1>
              <motion.div
                className="flex-shrink-0"
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <ModeToggle />
              </motion.div>
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-medium"
            variants={itemVariants}
          >
            A modern authentication platform built with React and Django.
            <br className="hidden sm:block" />
            Secure, scalable, and ready for your next project.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button
                size="lg"
                asChild
                className="text-lg px-8 relative overflow-hidden group"
              >
                <Link
                  to="/register"
                  className="flex items-center"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <motion.div className="absolute inset-0 bg-primary/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                  <span className="relative z-10">Get Started</span>
                  <motion.div
                    className="ml-2 relative z-10"
                    animate={{ x: isHovered ? 5 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </Link>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button
                variant="outline"
                size="lg"
                asChild
                className="text-lg px-8 bg-transparent hover:bg-primary/10"
              >
                <Link to="/login">Sign In</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            className="grid md:grid-cols-3 gap-6 md:gap-8 mt-24"
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{
                  y: -8,
                  transition: { type: "spring", stiffness: 400, damping: 25 },
                }}
                className="group h-full"
              >
                <Card className="bg-gradient-to-b from-background/80 to-muted/20 backdrop-blur-sm hover:from-background/90 hover:to-muted/30 transition-all duration-500 shadow-lg hover:shadow-2xl h-full border border-border/60 dark:border-border/70 hover:border-border/70 dark:hover:border-border/80">
                  <CardContent className="p-8 text-center h-full flex flex-col">
                    <motion.div
                      className="flex justify-center mb-6"
                      whileHover={{ 
                        scale: 1.1,
                        rotate: [0, -5, 5, 0],
                        transition: { duration: 0.4 }
                      }}
                    >
                      <div
                        className={`p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} ${feature.color} shadow-lg`}
                      >
                        <feature.icon className="h-8 w-8" />
                      </div>
                    </motion.div>
                    <motion.h3
                      className="text-xl md:text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-300"
                      initial={{ opacity: 0.9 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {feature.title}
                    </motion.h3>
                    <motion.p
                      className="text-muted-foreground leading-relaxed flex-1 text-base"
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
            className="mt-24 pt-12 border-t border-border/40"
            variants={itemVariants}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System Status: All systems operational</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-border/40"></div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>SOC 2 Type II Certified</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-border/40"></div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>99.99% Uptime SLA</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;