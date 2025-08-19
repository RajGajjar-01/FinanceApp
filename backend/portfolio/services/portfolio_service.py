# portfolio/services/portfolio_service.py
from decimal import Decimal
from datetime import datetime
from django.db import transaction
from django.db.models import F
from rest_framework.exceptions import ValidationError
from portfolio.models import Stock, Portfolio, PortfolioSummary
from portfolio.serializers import StockSerializer, PortfolioSerializer, PortfolioSummarySerializer
from portfolio.utils.finnhub import fetch_stock_from_finnhub
from portfolio.utils.groq import fetch_description_and_thesis

@transaction.atomic
def add_stock_to_portfolio_by_symbol(user, data: dict) -> dict:
    """
    1) Finnhub for core fields
    2) Groq for description/thesis
    3) Upsert Stock
    4) Upsert/merge Portfolio (if exists, DCA average)
    5) Refresh summary
    """
    symbol = (data.get("symbol") or "").strip().upper()
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
    finnhub_payload = fetch_stock_from_finnhub(symbol)

    # 2) Groq text (optional)
    groq_payload = fetch_description_and_thesis({
        **finnhub_payload,
        "symbol": symbol,
    })
    print("Groq payload:", groq_payload)

    # 3) Upsert Stock
    stock, _ = Stock.objects.update_or_create(
        symbol=symbol,
        defaults={
            "name": finnhub_payload["name"],
            "exchange": finnhub_payload["exchange"],
            "sector": finnhub_payload["sector"],
            "current_price": finnhub_payload["current_price"],
            "previous_close": finnhub_payload["previous_close"],
            "market_cap": finnhub_payload["market_cap"],
            "website_url": finnhub_payload["website_url"],
            "description":  None,
            "is_active": True,
        },
    )

    # 4) Upsert/merge Portfolio
    holding = Portfolio.objects.filter(user=user, stock=stock, is_active=True).first()
    if holding:
        # Dollar-cost average merge
        add_cost = shares_owned * purchase_price
        new_shares = holding.shares_owned + shares_owned
        new_total_cost = holding.total_invested + add_cost
        new_avg_price = (new_total_cost / new_shares) if new_shares > 0 else purchase_price

        holding.shares_owned = new_shares
        holding.purchase_price = new_avg_price
        holding.notes = (holding.notes or "")
        if notes:
            holding.notes = f"{holding.notes}\n{notes}".strip()
        # prefer explicit override; else append Groq thesis if empty
        if thesis_override:
            holding.investment_thesis = thesis_override
        elif not holding.investment_thesis and groq_payload.get("investment_thesis"):
            holding.investment_thesis = groq_payload["investment_thesis"]
        # keep earliest purchase_date
        if purchase_date < holding.purchase_date:
            holding.purchase_date = purchase_date
        holding.save()
    else:
        holding = Portfolio.objects.create(
            user=user,
            stock=stock,
            shares_owned=shares_owned,
            purchase_price=purchase_price,
            purchase_date=purchase_date,
            notes=notes or "",
            investment_thesis=(thesis_override or  ""),
            is_active=True,
        )

    # 5) Refresh summary
    summary = PortfolioSummary.refresh_for_user(user)

    return {
        "stock": StockSerializer(stock).data,
        "holding": PortfolioSerializer(holding).data,
        "summary": PortfolioSummarySerializer(summary).data,
    }
