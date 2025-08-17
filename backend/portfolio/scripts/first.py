from decimal import Decimal
from django.utils import timezone
from portfolio.models import Stock, Portfolio, Wishlist, PriceAlert, PortfolioSummary
from user.models import UserCustom  # Change as needed for your user model

def run():
    print("Dummy portfolio data script start.")

    # Fetch an existing user, or create one for testing
    user, created = UserCustom.objects.get_or_create(
        email="testuser@example.com",
        defaults={
            "username": "testuser",
            "password": "testpass123"
        }
    )
    print("User:", user)

    # Create stocks
    stock1 = Stock.objects.create(
        symbol="AAPL",
        name="Apple Inc.",
        exchange="NASDAQ",
        sector="TECH",
        current_price=Decimal('180.00'),
        previous_close=Decimal('178.00'),
        market_cap=2_900_000_000_000,
        currency="USD"
    )
    stock2 = Stock.objects.create(
        symbol="TSLA",
        name="Tesla, Inc.",
        exchange="NASDAQ",
        sector="TECH",
        current_price=Decimal('820.00'),
        previous_close=Decimal('800.00'),
        market_cap=800_000_000_000,
        currency="USD"
    )
    stock3 = Stock.objects.create(
        symbol="JPM",
        name="JP Morgan Chase",
        exchange="NYSE",
        sector="FIN",
        current_price=Decimal('150.00'),
        previous_close=Decimal('148.00'),
        market_cap=490_000_000_000,
        currency="USD"
    )
    print("Stocks:", stock1, stock2, stock3)

    # Create portfolio holdings
    holding1 = Portfolio.objects.create(
        user=user,
        stock=stock1,
        shares_owned=Decimal('10'),
        purchase_price=Decimal('170.00'),
        purchase_date=timezone.now().date(),
        target_allocation_percentage=Decimal('40.0')
    )
    holding2 = Portfolio.objects.create(
        user=user,
        stock=stock2,
        shares_owned=Decimal('5'),
        purchase_price=Decimal('750.00'),
        purchase_date=timezone.now().date(),
        target_allocation_percentage=Decimal('35.0')
    )
    holding3 = Portfolio.objects.create(
        user=user,
        stock=stock3,
        shares_owned=Decimal('20'),
        purchase_price=Decimal('140.00'),
        purchase_date=timezone.now().date(),
        target_allocation_percentage=Decimal('25.0')
    )
    print("Holdings:", holding1, holding2, holding3)

    # Create wishlist items
    wishlist1 = Wishlist.objects.create(
        user=user,
        stock=stock1,
        target_buy_price=Decimal('175.00'),
        price_when_added=Decimal('178.00'),
        planned_investment_amount=Decimal('2000.00'),
        priority=2,
        watch_reason="Long-term growth"
    )
    wishlist2 = Wishlist.objects.create(
        user=user,
        stock=stock2,
        target_buy_price=Decimal('800.00'),
        price_when_added=Decimal('810.00'),
        planned_investment_amount=Decimal('4000.00'),
        priority=4,
        watch_reason="EV expansion"
    )
    print("Wishlist:", wishlist1, wishlist2)

    # Create price alerts for the wishlist items
    price_alert1 = PriceAlert.objects.create(
        wishlist_item=wishlist1,
        alert_type="PRICE_BELOW",
        target_price=Decimal('175.00'),
        actual_price=Decimal('174.50'),
        status="TRIGGERED",
        email_sent=True,
        email_sent_at=timezone.now()
    )
    price_alert2 = PriceAlert.objects.create(
        wishlist_item=wishlist2,
        alert_type="PRICE_ABOVE",
        target_price=Decimal('820.00'),
        actual_price=Decimal('825.00'),
        status="ACTIVE",
        email_sent=False
    )
    print("PriceAlerts:", price_alert1, price_alert2)

    # Refresh and print portfolio summary
    summary = PortfolioSummary.refresh_for_user(user)
    print("Portfolio summary:", summary)

    print("Dummy portfolio data creation finished.")
