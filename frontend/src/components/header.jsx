import React, { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Menu, User } from 'lucide-react'; // Removed Mail, LogIn, UserPlus icons
import { motion } from 'motion/react';
import { ModeToggle } from './mode-toggler';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navButtons = [
    {
      label: 'Contact Us',
      href: '/contact',
      variant: 'ghost',
    },
    {
      label: 'Sign-In', // Changed from 'Login'
      href: '/login',
      variant: 'outline',
    },
    {
      label: 'Get Started', // Changed from 'Register'
      href: '/register',
      variant: 'default',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.98 },
  };

  return (
    <motion.header
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border/70 dark:border-border/50 shadow-sm"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Logo & Project Name */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Link to="/" className="flex items-center space-x-3 group">
              {/* Placeholder Logo */}
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary/90 transition-colors duration-200">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>

              {/* Project Name */}
              <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                ProjectName
              </span>
            </Link>
          </motion.div>

          {/* Right Side - Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Navigation Buttons */}
            <div className="flex items-center space-x-2">
              {navButtons.map((button) => {
                return (
                  <motion.div
                    key={button.label}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      variant={button.variant}
                      size="sm"
                      className={`
                        h-9 px-4 font-medium transition-all duration-200
                        ${
                          button.variant === 'outline'
                            ? 'border-2 border-primary/60 text-primary hover:bg-primary/10 hover:border-primary/80 dark:border-primary/50 dark:hover:bg-primary/20'
                            : ''
                        }
                        ${
                          button.variant === 'ghost'
                            ? 'hover:text-foreground hover:bg-muted/50 dark:hover:bg-muted/30'
                            : ''
                        }
                        ${
                          button.variant === 'default'
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg'
                            : ''
                        }
                      `}
                      asChild
                    >
                      <Link to={button.href} className="flex items-center">
                        <span>{button.label}</span>
                      </Link>
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            {/* Separator */}
            <Separator orientation="vertical" className="h-6" />

            {/* Mode Toggle Button */}
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <ModeToggle />
            </motion.div>
          </div>

          {/* Mobile Menu - Hamburger */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mode Toggle for Mobile */}
            <ModeToggle />

            {/* Mobile Menu Sheet */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 hover:bg-muted/50 transition-all duration-200"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </motion.div>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-80 bg-card/95 backdrop-blur-sm border-2 border-border/70 dark:border-border/50"
              >
                <SheetHeader className="pb-4">
                  <SheetTitle className="text-left text-lg font-semibold">Navigation</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col space-y-4 mt-6">
                  {navButtons.map((button, index) => {
                    return (
                      <motion.div
                        key={button.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Button
                          variant={button.variant}
                          size="lg"
                          className={`
                            w-full h-12 justify-center font-medium transition-all duration-200
                            ${
                              button.variant === 'outline'
                                ? 'border-2 border-primary/60 text-primary hover:bg-primary/10 hover:border-primary/80 dark:border-primary/50 dark:hover:bg-primary/20'
                                : ''
                            }
                            ${
                              button.variant === 'ghost'
                                ? 'hover:text-foreground hover:bg-muted/50 dark:hover:bg-muted/30'
                                : ''
                            }
                            ${
                              button.variant === 'default'
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg'
                                : ''
                            }
                          `}
                          asChild
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Link to={button.href} className="flex items-center">
                            <span>{button.label}</span>
                          </Link>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>

                <Separator className="my-6" />
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    ProjectName © 2025
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
