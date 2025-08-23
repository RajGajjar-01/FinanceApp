# portfolio/services/portfolio_service.py
from decimal import Decimal
from datetime import datetime
from django.db import transaction
from django.db.models import F
from rest_framework.exceptions import ValidationError
from portfolio.models import Stock, Portfolio, PortfolioSummary
from portfolio.serializers import StockSerializer, PortfolioSerializer, PortfolioSummarySerializer
from portfolio.utils.finnhub import fetch_stock_from_finnhub
import logging

logger = logging.getLogger(__name__)

@transaction.atomic
def add_stock_to_portfolio_by_symbol(user, data: dict) -> dict:
    """
    1) Finnhub for core fields
    2) Groq for description/thesis
    3) Upsert Stock
    4) Upsert/merge Portfolio (if exists, DCA average)
    5) Refresh summary
    """
    try:
        symbol = (data.get("symbol") or "").strip().upper()
        logger.info(f"🔄 Starting portfolio add for symbol: {symbol}, user: {user.id}")
        
        if not symbol:
            raise ValidationError({"symbol": "Symbol is required"})

        shares_owned: Decimal = data["shares_owned"]
        purchase_price: Decimal = data["purchase_price"]
        purchase_date = data["purchase_date"]
        
        # Convert purchase_date from string to datetime.date if necessary
        if isinstance(purchase_date, str):
            purchase_date = datetime.strptime(purchase_date, "%Y-%m-%d").date()
        
        notes = data.get("notes") or ""
        thesis_override = (data.get("investment_thesis") or "").strip()

        # 1) Finnhub data
        logger.info(f"📡 Fetching Finnhub data for: {symbol}")
        finnhub_payload = fetch_stock_from_finnhub(symbol)
        logger.info(f"✅ Finnhub data received: {finnhub_payload.get('name')}")

        # 3) Upsert Stock
        logger.info(f"💾 Upserting stock: {symbol}")
        stock, created = Stock.objects.update_or_create(
            symbol=symbol,
            defaults={
                "name": finnhub_payload["name"],
                "exchange": finnhub_payload["exchange"],
                "sector": finnhub_payload["sector"],
                "current_price": finnhub_payload["current_price"],
                "previous_close": finnhub_payload["previous_close"],
                "market_cap": finnhub_payload["market_cap"],
                "website_url": finnhub_payload["website_url"],
                "description": None,
                "is_active": True,
            },
        )
        
        logger.info(f"{'✅ Created' if created else '📝 Updated'} stock: {stock.name} ({stock.symbol})")

        # 4) Upsert/merge Portfolio
        logger.info(f"📊 Processing portfolio for user {user.id}")
        holding = Portfolio.objects.filter(user=user, stock=stock, is_active=True).first()
        
        if holding:
            logger.info(f"📈 Merging existing holding for {symbol}")
            # Dollar-cost average merge
            add_cost = shares_owned * purchase_price
            new_shares = holding.shares_owned + shares_owned
            new_total_cost = holding.total_invested + add_cost
            new_avg_price = (new_total_cost / new_shares) if new_shares > 0 else purchase_price

            holding.shares_owned = new_shares
            holding.purchase_price = new_avg_price
            holding.notes = (holding.notes or "")
        
            # keep earliest purchase_date
            if purchase_date < holding.purchase_date:
                holding.purchase_date = purchase_date
            holding.save()
            logger.info(f"📈 Updated holding: {new_shares} shares at ${new_avg_price}")
        else:
            logger.info(f"🆕 Creating new holding for {symbol}")
            holding = Portfolio.objects.create(
                user=user,
                stock=stock,
                shares_owned=shares_owned,
                purchase_price=purchase_price,
                purchase_date=purchase_date,
                notes=notes or "",
                investment_thesis=(thesis_override or ""),
                is_active=True,
            )
            logger.info(f"✅ Created new holding: {shares_owned} shares at ${purchase_price}")

        # 5) Refresh summary
        logger.info("🔄 Refreshing portfolio summary")
        summary = PortfolioSummary.refresh_for_user(user)
        logger.info("✅ Portfolio summary refreshed")

        return {
            "stock": StockSerializer(stock).data,
            "holding": PortfolioSerializer(holding).data,
            "summary": PortfolioSummarySerializer(summary).data,
        }
        
    except Exception as e:
        logger.error(f"❌ Error in add_stock_to_portfolio_by_symbol: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise