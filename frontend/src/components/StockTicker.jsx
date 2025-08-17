import React, { useEffect, useState } from "react";

function StockPrice() {
  const [stock, setStock] = useState(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws/stocks/");

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onmessage = (event) => {
      console.log("📩 Received:", event.data);  // <- MUST log every 10s
      setStock(JSON.parse(event.data));
    };

    socket.onclose = () => {
      console.log("❌ WebSocket closed");
    };

    return () => socket.close();
  }, []);

  return (
    <div>
      <h2>📈 Live Stock Price</h2>
      {stock ? (
        <div>
          <p>Price: {stock.c}</p>
          <p>High: {stock.h}</p>
          <p>Low: {stock.l}</p>
          <p>Open: {stock.o}</p>
          <p>Prev Close: {stock.pc}</p>
        </div>
      ) : (
        <p>Waiting for updates...</p>
      )}
    </div>
  );
}

export default StockPrice;
