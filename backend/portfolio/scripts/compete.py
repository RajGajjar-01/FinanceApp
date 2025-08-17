from user.models import UserCustom
from portfolio.models import PortfolioSummary, Portfolio, Wishlist, PriceAlert, Stock

def run():
    print("=== Complete Portfolio Summary Report ===")
    
    user = UserCustom.objects.filter(email="testuser@example.com").first()
    if not user:
        print("Test user not found!")
        return
    
    # Get or refresh summary
    summary = PortfolioSummary.refresh_for_user(user)
    
    print(f"User: {user.username} ({user.email})")
    print(f"Report Generated: {summary.last_calculated}")
    print("=" * 80)
    
    # Portfolio Summary
    print("PORTFOLIO SUMMARY:")
    print(f"  Total Invested: ${summary.total_invested}")
    print(f"  Current Value: ${summary.current_portfolio_value}")
    print(f"  Total G/L: ${summary.total_gain_loss}")
    print(f"  Total G/L %: {summary.total_gain_loss_percentage:.4f}%")
    print(f"  Day Change: ${summary.day_change_value}")
    print(f"  Day Change %: {summary.day_change_percentage:.4f}%")
    print(f"  Holdings Count: {summary.number_of_holdings}")
    print(f"  Largest Holding: {summary.largest_holding_percentage:.2f}%")
    print()
    
    # Sector Allocation
    print("SECTOR ALLOCATION:")
    for sector, percentage in summary.sector_allocation.items():
        print(f"  {sector}: {percentage:.2f}%")
    print()
    
    # Holdings Summary
    holdings = Portfolio.objects.filter(user=user, is_active=True)
    print(f"HOLDINGS DETAIL ({holdings.count()} positions):")
    for holding in holdings:
        allocation = (holding.current_value / summary.current_portfolio_value * 100) if summary.current_portfolio_value > 0 else 0
        print(f"  {holding.stock.symbol}: ${holding.current_value:.2f} ({allocation:.1f}%)")
    print()
    
    # Wishlist Summary
    wishlist_items = Wishlist.objects.filter(user=user, is_active=True)
    print(f"WATCHLIST ({wishlist_items.count()} items):")
    for item in wishlist_items:
        status = "TARGET MET" if item.should_trigger_alert() else "WATCHING"
        print(f"  {item.stock.symbol}: Target ${item.target_buy_price} | Current ${item.stock.current_price} | {status}")
    print()
    
    # Alerts Summary
    alerts = PriceAlert.objects.filter(wishlist_item__user=user)
    triggered_alerts = alerts.filter(status='TRIGGERED').count()
    active_alerts = alerts.filter(status='ACTIVE').count()
    print(f"PRICE ALERTS:")
    print(f"  Total Alerts: {alerts.count()}")
    print(f"  Triggered: {triggered_alerts}")
    print(f"  Active: {active_alerts}")
    print()
    
    # Database Stats
    total_stocks = Stock.objects.filter(is_active=True).count()
    print(f"DATABASE STATS:")
    print(f"  Total Stocks: {total_stocks}")
    print(f"  Stocks in Portfolio: {holdings.count()}")
    print(f"  Stocks in Wishlist: {wishlist_items.count()}")
    print(f"  Stocks Not Tracked: {total_stocks - holdings.count() - wishlist_items.count()}")
