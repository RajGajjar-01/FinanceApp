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
  const [portfolio, setPortfolio] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  
  // Modal state - ADDED FROM FIRST COMPONENT
  const [showModal, setShowModal] = useState(false);
  const [modalStock, setModalStock] = useState(null);
  const [buyPrice, setBuyPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyDate, setBuyDate] = useState("");
  
  const { axiosPrivate } = useAuth();
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Utility function for getting cookies
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  const accessToken = getCookie("access_token");

  // Debounced search function using Django's built-in search
  // Debounced search function using Finnhub API search
const performSearch = useCallback(async (query) => {
  if (!query || query.length < 2) {
    setSearchResults([]);
    setIsOpen(false);
    return;
  }

  try {
    setIsLoading(true);
    setError('');
    
    const response = await fetch(
      `http://localhost:8000/portfolio/stocks/search/?query=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    );
    
    if (!response.ok) throw new Error("Failed to fetch stock data");

    const data = await response.json();

    // Handle the response format from Finnhub search
    if (data.data && data.data.results && data.data.results.length > 0) {
      // Finnhub returns {symbol, name} objects
      setSearchResults(data.data.results);
      setIsOpen(true);
    } else {
      setSearchResults([]);
      setError('No stocks found');
    }
  } catch (err) {
    console.error('Search error:', err);
    setError('Unable to fetch stock data. Try again later.');
    setSearchResults([]);
  } finally {
    setIsLoading(false);
  }
}, [accessToken]);

  // ADDED FROM FIRST COMPONENT: Handle adding to portfolio with modal
  const handleAddToPortfolioClick = async (stock) => {
    try {
      setIsLoading(true);
      setError('');

      // Fetch stock details for the modal
      const response = await fetch(
        `http://localhost:8000/portfolio/stocks/details/?symbol=${stock.symbol}`,
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch stock details");

      const data = await response.json();
      console.log("Stock details:", data);
      
      // Set modal data
      setModalStock({
        ...stock,
        currentPrice: data.currentPrice,
        previousClose: data.previousClose
      });
      setShowModal(true);
      
      // Reset form fields
      setBuyPrice("");
      setQuantity("");
      setBuyDate(new Date().toISOString().split('T')[0]); // Default to today
      
    } catch (err) {
      console.error('Error fetching stock details:', err);
      setError('Unable to fetch stock details. Try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // ADDED FROM FIRST COMPONENT: Submit portfolio form
  const handleSubmitPortfolio = async () => {
    if (!modalStock) return;

    const payload = {
      symbol: modalStock.symbol,
      shares_owned: quantity,
      purchase_price: buyPrice,
      purchase_date: buyDate,
    };

    try {
      const response = await fetch("http://localhost:8000/portfolio/portfolio/add-by-symbol/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Stock added to portfolio successfully!");
        setShowModal(false);
        clearSearch();
        // Add to local portfolio state
        if (!portfolio.some((s) => s.symbol === modalStock.symbol)) {
          setPortfolio([...portfolio, modalStock]);
        }
      } else {
        alert(data.errors?.[0] || data.message || "Failed to add stock");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

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

  const addToWishlist = (stock) => {
    if (!wishlist.some((s) => s.symbol === stock.symbol)) {
      setWishlist([...wishlist, stock]);
    }
    clearSearch();
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `$${parseFloat(price).toFixed(2)}`;
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
        key={`${stock.symbol}-${index}`}  // FIXED: Added index to make key unique
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
            {/* Finnhub results don't have sector, so hide the badge or handle differently */}
            {stock.sector && (
              <Badge variant="secondary" className="text-xs">
                {stock.sector}
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {stock.name || stock.description}
          </div>
          {/* Finnhub results don't have price, so hide this */}
          {stock.current_price && (
            <div className="text-xs font-medium mt-1">
              {formatPrice(stock.current_price)}
            </div>
          )}
        </div>
        
        <div className="flex gap-2 ml-3">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToPortfolioClick(stock);
            }}
            className="h-7 px-2 text-xs"
          >
            Portfolio
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              addToWishlist(stock);
            }}
            className="h-7 px-2 text-xs"
          >
            Wishlist
          </Button>
        </div>
      </motion.div>
    ))}
  </div>
)}
          </motion.div>
        )}
      </AnimatePresence>

{showModal && modalStock && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50
  }}>
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      width: '90%',
      maxWidth: '28rem',
      margin: '1rem'
    }}>
      <div style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
          {modalStock.name} ({modalStock.symbol})
        </h2>

        {/* Prefilled fields */}
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>Current Price</label>
          <input
            type="text"
            value={modalStock.currentPrice || 'N/A'}
            readOnly
            style={{
              border: '1px solid #d1d5db',
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              color: '#1f2937',
              backgroundColor: '#f9fafb'
            }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>Previous Close</label>
          <input
            type="text"
            value={modalStock.previousClose || 'N/A'}
            readOnly
            style={{
              border: '1px solid #d1d5db',
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              color: '#1f2937',
              backgroundColor: '#f9fafb'
            }}
          />
        </div>

        {/* User input fields */}
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>Buy Price ($)</label>
          <input
            type="number"
            step="0.01"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            placeholder="0.00"
            style={{
              border: '1px solid #d1d5db',
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              color: '#1f2937'
            }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>Quantity</label>
          <input
            type="number"
            step="0.0001"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            style={{
              border: '1px solid ',
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              color: '#1f2937'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>Buy Date</label>
          <input
            type="date"
            value={buyDate}
            onChange={(e) => setBuyDate(e.target.value)}
            style={{
              border: '1px solid #d1d5db',
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              color: '#1f2937'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            onClick={() => setShowModal(false)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              color: '#374151',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitPortfolio}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#16a34a',
              color: 'white',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Add to Portfolio
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default StockSearch;