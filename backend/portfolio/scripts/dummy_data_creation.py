from decimal import Decimal
from django.utils import timezone
from datetime import date, timedelta
from portfolio.models import Stock, Portfolio, Wishlist, PriceAlert, PortfolioSummary
from user.models import UserCustom

def run():
    print("=== Extended Dummy Data Creation ===")
    
    # Get or create test user
    user, created = UserCustom.objects.get_or_create(
        email="programmingnotesbyraj@gmail.com",
    )
    print(f"User: {user} ({'created' if created else 'existing'})")
    
    # Create more diverse stocks
    stocks_data = [
        # Portfolio stocks (user will own these)
        {"symbol": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ", "sector": "TECH", "current": 185.50, "previous": 183.20, "cap": 2900000000000},
        {"symbol": "TSLA", "name": "Tesla Inc.", "exchange": "NASDAQ", "sector": "TECH", "current": 245.80, "previous": 240.15, "cap": 780000000000},
        {"symbol": "JPM", "name": "JPMorgan Chase", "exchange": "NYSE", "sector": "FIN", "current": 155.30, "previous": 153.90, "cap": 450000000000},
        {"symbol": "JNJ", "name": "Johnson & Johnson", "exchange": "NYSE", "sector": "HC", "current": 168.75, "previous": 167.20, "cap": 445000000000},
        {"symbol": "XOM", "name": "Exxon Mobil", "exchange": "NYSE", "sector": "EN", "current": 118.90, "previous": 120.40, "cap": 485000000000},
        
        # Wishlist stocks (user watches but doesn't own)
        {"symbol": "MSFT", "name": "Microsoft Corp", "exchange": "NASDAQ", "sector": "TECH", "current": 415.20, "previous": 412.80, "cap": 3080000000000},
        {"symbol": "GOOGL", "name": "Alphabet Inc", "exchange": "NASDAQ", "sector": "TECH", "current": 145.90, "previous": 144.30, "cap": 1850000000000},
        {"symbol": "AMZN", "name": "Amazon.com Inc", "exchange": "NASDAQ", "sector": "CONS", "current": 155.75, "previous": 157.20, "cap": 1620000000000},
        {"symbol": "NVDA", "name": "NVIDIA Corp", "exchange": "NASDAQ", "sector": "TECH", "current": 875.40, "previous": 865.90, "cap": 2150000000000},
        {"symbol": "BAC", "name": "Bank of America", "exchange": "NYSE", "sector": "FIN", "current": 35.85, "previous": 35.40, "cap": 285000000000},
        
        # Additional stocks (neither owned nor watched)
        {"symbol": "WMT", "name": "Walmart Inc", "exchange": "NYSE", "sector": "CONS", "current": 165.30, "previous": 164.80, "cap": 535000000000},
        {"symbol": "PG", "name": "Procter & Gamble", "exchange": "NYSE", "sector": "CONS", "current": 155.90, "previous": 156.20, "cap": 370000000000},
        {"symbol": "HD", "name": "Home Depot", "exchange": "NYSE", "sector": "CONS", "current": 385.60, "previous": 383.40, "cap": 395000000000},
        {"symbol": "V", "name": "Visa Inc", "exchange": "NYSE", "sector": "FIN", "current": 275.85, "previous": 274.20, "cap": 580000000000},
        {"symbol": "UNH", "name": "UnitedHealth Group", "exchange": "NYSE", "sector": "HC", "current": 545.30, "previous": 543.80, "cap": 515000000000},
    ]
    
    created_stocks = []
    for stock_data in stocks_data:
        stock, created = Stock.objects.get_or_create(
            symbol=stock_data["symbol"],
            defaults={
                "name": stock_data["name"],
                "exchange": stock_data["exchange"],
                "sector": stock_data["sector"],
                "current_price": Decimal(str(stock_data["current"])),
                "previous_close": Decimal(str(stock_data["previous"])),
                "market_cap": stock_data["cap"],
                # "currency": "USD"
            }
        )
        created_stocks.append(stock)
        print(f"Stock: {stock.symbol} - {stock.name} ({'created' if created else 'existing'})")
    
    # Create portfolio holdings (first 5 stocks)
    portfolio_stocks = created_stocks[:5]
    holdings_data = [
        {"stock": portfolio_stocks[0], "shares": 15.5, "price": 175.80, "days_ago": 30, "allocation": 35.0},
        {"stock": portfolio_stocks[1], "shares": 8.25, "price": 220.40, "days_ago": 45, "allocation": 25.0},
        {"stock": portfolio_stocks[2], "shares": 25.0, "price": 148.90, "days_ago": 60, "allocation": 20.0},
        {"stock": portfolio_stocks[3], "shares": 12.75, "price": 162.30, "days_ago": 20, "allocation": 15.0},
        {"stock": portfolio_stocks[4], "shares": 6.5, "price": 125.60, "days_ago": 15, "allocation": 5.0},
    ]
    
    for holding_data in holdings_data:
        purchase_date = date.today() - timedelta(days=holding_data["days_ago"])
        holding, created = Portfolio.objects.get_or_create(
            user=user,
            stock=holding_data["stock"],
            defaults={
                "shares_owned": Decimal(str(holding_data["shares"])),
                "purchase_price": Decimal(str(holding_data["price"])),
                "purchase_date": purchase_date,
                "target_allocation_percentage": Decimal(str(holding_data["allocation"])),
                "investment_thesis": f"Long-term investment in {holding_data['stock'].name}",
                "notes": f"Purchased {holding_data['days_ago']} days ago"
            }
        )
        print(f"Holding: {holding.stock.symbol} - {holding.shares_owned} shares ({'created' if created else 'existing'})")
    
    # Create wishlist items (stocks 6-10)
    wishlist_stocks = created_stocks[5:10]
    wishlist_data = [
        {"stock": wishlist_stocks[0], "target": 400.00, "amount": 5000.00, "priority": 1, "reason": "Cloud dominance"},
        {"stock": wishlist_stocks[1], "target": 140.00, "amount": 3000.00, "priority": 2, "reason": "Search monopoly"},
        {"stock": wishlist_stocks[2], "target": 150.00, "amount": 2500.00, "priority": 3, "reason": "E-commerce growth"},
        {"stock": wishlist_stocks[3], "target": 850.00, "amount": 4000.00, "priority": 1, "reason": "AI revolution"},
        {"stock": wishlist_stocks[4], "target": 34.00, "amount": 1500.00, "priority": 4, "reason": "Banking recovery"},
    ]
    
    for wish_data in wishlist_data:
        wishlist, created = Wishlist.objects.get_or_create(
            user=user,
            stock=wish_data["stock"],
            defaults={
                "target_buy_price": Decimal(str(wish_data["target"])),
                "planned_investment_amount": Decimal(str(wish_data["amount"])),
                "priority": wish_data["priority"],
                "watch_reason": wish_data["reason"],
                "email_alerts_enabled": True
            }
        )
        print(f"Wishlist: {wishlist.stock.symbol} - Target: ${wishlist.target_buy_price} ({'created' if created else 'existing'})")
    
    # Create some price alerts
    wishlist_items = Wishlist.objects.filter(user=user)
    for i, wishlist_item in enumerate(wishlist_items[:3]):
        alert, created = PriceAlert.objects.get_or_create(
            wishlist_item=wishlist_item,
            defaults={
                "alert_type": "PRICE_BELOW",
                "target_price": wishlist_item.target_buy_price,
                "actual_price": wishlist_item.stock.current_price,
                "status": "TRIGGERED" if i == 0 else "ACTIVE",
                "email_sent": i == 0,
                "email_sent_at": timezone.now() if i == 0 else None
            }
        )
        print(f"Alert: {alert.wishlist_item.stock.symbol} ({'created' if created else 'existing'})")
    
    # Refresh portfolio summary
    summary = PortfolioSummary.refresh_for_user(user)
    print(f"Portfolio Summary refreshed: ${summary.current_portfolio_value}")
    
    print("=== Extended dummy data creation completed ===")
