import React, { useState, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
// import ModeToggle from './components/mode-toggler';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Tracker', href: '/tracker' },
  { name: 'All Transactions', href: '/transactions' },
  { name: 'Portfolio', href: '/portfolio' },
];

const ANIMATIONS = {
  dropdown: { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 } },
  mobile: { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 } },
  icon: { initial: { rotate: 90, opacity: 0 }, animate: { rotate: 0, opacity: 1 }, exit: { rotate: -90, opacity: 0 } },
};

const getActiveStyles = (isActive, isMobile = false) => `
  flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium 
  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary
  ${isMobile && isActive ? 'border-l-2 border-primary' : ''}
  ${isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-white hover:bg-accent/10'}
`;

const getUserInitials = (username) => {
  if (!username) return 'U';
  
  const words = username.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  
  return words.map(word => word[0]).join('').slice(0, 2).toUpperCase();
};

const NavLink = ({ item, isActive, onClick, isMobile }) => (
  <motion.div {...(isMobile && { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } })}>
    <Link
      to={item.href}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={getActiveStyles(isActive, isMobile)}
    >
      {item.name}
    </Link>
  </motion.div>
);

const UserDropdown = ({ user, onLogout }) => {
  const initials = useMemo(() => getUserInitials(user?.username), [user?.username]);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 p-2 rounded-lg transition-colors hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-primary">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} alt={user?.username} loading="lazy" />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <ChevronDown size={16} className="hidden sm:block text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="center" className="mt-2 min-w-[200px] font-space-grotesk" sideOffset={8}>
        <motion.div {...ANIMATIONS.dropdown} transition={{ duration: 0.2 }}>
          <div className="px-3 py-2">
            <p className="text-md font-semibold truncate">{user?.username || 'Unknown User'}</p>
            <p className="text-md text-muted-foreground truncate">{user?.email || 'No email'}</p>
          </div>
          
          <DropdownMenuSeparator />
          
          {[
            { icon: User, label: 'Profile', href: '/profile' },
            { icon: Settings, label: 'Settings', href: '/settings' },
          ].map(({ icon: Icon, label, href }) => (
            <DropdownMenuItem key={href} className="cursor-pointer">
              <Icon size={16} className="mr-2" />
              <Link to={href} className="flex items-center w-full">{label}</Link>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="cursor-pointer text-red-400 focus:text-red-600"
            onClick={onLogout}
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const MobileToggle = ({ isOpen, onClick }) => (
  <button
    className="md:hidden p-2 rounded-lg transition-colors hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-primary"
    onClick={onClick}
    aria-label={isOpen ? 'Close menu' : 'Open menu'}
    aria-expanded={isOpen}
  >
    <AnimatePresence mode="wait">
      <motion.div key={isOpen} {...ANIMATIONS.icon} transition={{ duration: 0.2 }}>
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </motion.div>
    </AnimatePresence>
  </button>
);

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const navItemsWithState = useMemo(() => 
    NAV_ITEMS.map(item => ({ ...item, isActive: pathname === item.href })), 
    [pathname]
  );

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen(prev => !prev), []);
  
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      closeMobileMenu();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, closeMobileMenu]);

  if (!user) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center">
          <div className="text-muted-foreground">Please log in to continue</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link 
            to="/main" 
            className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            FinanceIQ
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navItemsWithState.map(item => (
              <NavLink key={item.href} item={item} isActive={item.isActive} />
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            
            <UserDropdown user={user} onLogout={handleLogout} />
            <MobileToggle isOpen={isMobileMenuOpen} onClick={toggleMobileMenu} />
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              {...ANIMATIONS.mobile}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-border/40"
            >
              <motion.nav 
                className="py-4 space-y-2"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {navItemsWithState.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <NavLink
                      item={item}
                      isActive={item.isActive}
                      onClick={closeMobileMenu}
                      isMobile
                    />
                  </motion.div>
                ))}
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;