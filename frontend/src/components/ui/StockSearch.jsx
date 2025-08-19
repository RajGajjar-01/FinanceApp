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

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalStock, setModalStock] = useState(null);

  // Modal input state
  const [buyPrice, setBuyPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyDate, setBuyDate] = useState("");

  const debouncedQuery = useDebounce(query, 300);

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  const accessToken = getCookie("access_token");

  const fetchStocks = useCallback(async () => {
    if (!debouncedQuery) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `http://localhost:8000/api/stocks/search/?query=${encodeURIComponent(
          debouncedQuery
        )}`,
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch stock data");

      const data = await res.json();

      if (data.data && data.data.results && data.data.results.length > 0) {
        setSuggestions(data.data.results);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to fetch stock data. Try again later.");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, accessToken]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
  };

  const handleAddToPortfolioClick = async (stock) => {
    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:8000/api/stocks/details/?symbol=${stock.symbol}`,
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch stock details");

      const data = await res.json();
      console.log(data);
      setModalStock(data);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch stock details. Try again later.");
    } finally {
      setLoading(false);
    }
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

 const handleSubmitPortfolio = async () => {
  const payload = {
    symbol: modalStock.symbol,
    shares_owned: quantity,
    purchase_price: buyPrice,
    purchase_date: buyDate,
  };

  try {
    const response = await fetch("http://localhost:8000/api/portfolio/add-by-symbol/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // if JWT auth
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Stock added to portfolio successfully!");
      setIsModalOpen(false);
    } else {
      alert(data.errors?.[0] || data.message || "Failed to add stock");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
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
          <li
            key={stock.symbol}
            className="flex justify-between mb-2 items-center"
          >
            <span>
              {stock.symbol} - {stock.name}
            </span>
            <div>
              <button
                onClick={() => handleAddToPortfolioClick(stock)}
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

      {/* Modal */}
      {showModal && modalStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 text-black">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {modalStock.name} ({modalStock.symbol})
            </h2>

            {/* Prefilled fields */}
            <div className="mb-2">
              <label className="block font-semibold">Current Price</label>
              <input
                type="text"
                value={modalStock.currentPrice}
                readOnly
                className="border w-full px-2 py-1 rounded text-black"
              />
            </div>
            <div className="mb-2">
              <label className="block font-semibold">Previous Close</label>
              <input
                type="text"
                value={modalStock.previousClose}
                readOnly
                className="border w-full px-2 py-1 rounded text-black"
              />
            </div>

            {/* User input fields */}
            <div className="mb-2">
              <label className="block font-semibold">Buy Price</label>
              <input
                type="number"
                className="border w-full px-2 py-1 rounded text-black"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="block font-semibold">Quantity</label>
              <input
                type="number"
                className="border w-full px-2 py-1 rounded text-black"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block font-semibold">Buy Date</label>
              <input
                type="date"
                className="border w-full px-2 py-1 rounded text-black"
                value={buyDate}
                onChange={(e) => setBuyDate(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleSubmitPortfolio}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition text-black"
              >
                Submit
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition text-black"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
