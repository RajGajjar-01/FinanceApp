import React, { useState, useEffect, useCallback } from "react";

// Utility function for debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const StockSearch = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const debouncedQuery = useDebounce(query, 300); // 300ms debounce for API calls

  // Fetch stocks from backend
  const fetchStocks = useCallback(async () => {
    if (!debouncedQuery) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `http://localhost:8000/api/stocks/search/?query=${encodeURIComponent(debouncedQuery)}`
      );
      if (!res.ok) throw new Error("Failed to fetch stock data");
      const data = await res.json();

      if (data.found) setSuggestions(data.stocks);
      else setSuggestions([]);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch stock data. Try again later.");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

   const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
  };
  const addToPortfolio = (stock) => {
    if (!portfolio.some((s) => s.symbol === stock.symbol)) {
      setPortfolio([...portfolio, stock]);
    }
     clearSearch();
  };

  const addToWishlist = (stock) => {
    if (!wishlist.some((s) => s.symbol === stock.symbol)) {
      setWishlist([...wishlist, stock]);
    }
     clearSearch();
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search stock symbol..."
        className="border p-2 mb-2 w-full rounded"
      />

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <ul>
        {suggestions.map((stock) => (
          <li key={stock.symbol} className="flex justify-between mb-2 items-center">
            <span>{stock.symbol} - {stock.name}</span>
            <div>
              <button
                onClick={() => addToPortfolio(stock)}
                className="mr-2 bg-green-500 text-white px-2 rounded hover:bg-green-600 transition"
              >
                Portfolio
              </button>
              <button
                onClick={() => addToWishlist(stock)}
                className="bg-blue-500 text-white px-2 rounded hover:bg-blue-600 transition"
              >
                Wishlist
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <h3 className="font-semibold">Portfolio:</h3>
        <pre>{JSON.stringify(portfolio, null, 2)}</pre>

        <h3 className="font-semibold mt-2">Wishlist:</h3>
        <pre>{JSON.stringify(wishlist, null, 2)}</pre>
      </div>
    </div>
  );
};

export default StockSearch;
