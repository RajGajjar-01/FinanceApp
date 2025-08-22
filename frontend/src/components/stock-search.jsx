import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, TrendingUp, TrendingDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { motion, AnimatePresence } from 'motion/react';

const StockSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState('');
  
  const { axiosPrivate } = useAuth();
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Debounced search function
  const performSearch = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const response = await axiosPrivate.get(`/portfolio/stocks/search/?q=${encodeURIComponent(query)}`);
      
      if (response.data?.success) {
        setSearchResults(response.data.data.results || []);
        setIsOpen(true);
      } else {
        setSearchResults([]);
        setError('Search failed');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search stocks');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [axiosPrivate]);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (searchTerm.length >= 2) {
      debounceTimeoutRef.current = setTimeout(() => {
        performSearch(searchTerm);
      }, 300);
    } else {
      setSearchResults([]);
      setIsOpen(false);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm, performSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleStockSelect(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, searchResults, selectedIndex]);

  const handleStockSelect = (stock) => {
    // Navigate to stock details or portfolio
    console.log('Selected stock:', stock);
    // TODO: Implement navigation to stock details
    setIsOpen(false);
    setSearchTerm('');
    setSelectedIndex(-1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    setError('');
    inputRef.current?.focus();
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getPriceChangeColor = (current, previous) => {
    if (!current || !previous) return 'text-muted-foreground';
    return parseFloat(current) >= parseFloat(previous) 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400';
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search stocks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
          className="pl-10 pr-10 h-9 text-sm w-full"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-hidden w-full"
          >
            {isLoading && (
              <div className="p-4 text-center text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto mb-2"></div>
                Searching...
              </div>
            )}

            {error && (
              <div className="p-4 text-center text-red-600 text-sm">
                {error}
              </div>
            )}

            {!isLoading && !error && searchResults.length === 0 && searchTerm.length >= 2 && (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No stocks found for "{searchTerm}"
              </div>
            )}

            {!isLoading && !error && searchResults.length > 0 && (
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((stock, index) => (
                  <motion.div
                    key={stock.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.1, delay: index * 0.05 }}
                    className={`
                      flex items-center justify-between p-3 cursor-pointer transition-colors
                      ${index === selectedIndex ? 'bg-muted/50' : 'hover:bg-muted/30'}
                      ${index < searchResults.length - 1 ? 'border-b border-border/50' : ''}
                    `}
                    onClick={() => handleStockSelect(stock)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground text-sm">
                          {stock.symbol}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {stock.sector || 'N/A'}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {stock.name}
                      </div>
                    </div>
                    
                    <div className="text-right ml-3">
                      <div className="text-sm font-medium text-foreground">
                        {formatPrice(stock.current_price)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stock.exchange}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockSearch;
