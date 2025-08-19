# portfolio/utils/finnhub.py
import requests
from decimal import Decimal
from django.conf import settings
from .sector_map import map_sector

BASE = "https://finnhub.io/api/v1"

class FinnhubError(Exception):
    pass

def _get(path: str, params: dict):
    token = settings.FINNHUB_API_KEY
    if not token:
        raise FinnhubError("FINNHUB_API_KEY not configured")
    params = {**params, "token": token}
    r = requests.get(f"{BASE}{path}", params=params, timeout=getattr(settings, "HTTP_TIMEOUT", 8))
    if r.status_code != 200:
        raise FinnhubError(f"Finnhub {path} failed: {r.status_code} {r.text[:200]}")
    data = r.json()
    if isinstance(data, dict) and data.get("error"):
        raise FinnhubError(data["error"])
    return data

def get_profile(symbol: str) -> dict:
    # https://finnhub.io/docs/api/company-profile2
    return _get("/stock/profile2", {"symbol": symbol})

def get_quote(symbol: str) -> dict:
    # https://finnhub.io/docs/api/quote
    return _get("/quote", {"symbol": symbol})

def fetch_stock_from_finnhub(symbol: str) -> dict:
    """
    Return a normalized dict for your Stock model (except description).
    """
    symbol = symbol.strip().upper()
    profile = get_profile(symbol)
    quote = get_quote(symbol)

    # Guard basics
    name = profile.get("name") or ""
    exchange = profile.get("exchange") or ""
    finnhub_sector = profile.get("finnhubIndustry") or ""
    sector_code = map_sector(finnhub_sector)

    # Finnhub quote fields: c=current, pc=previous close
    current_price = Decimal(str(quote.get("c") or "0"))
    previous_close = Decimal(str(quote.get("pc") or "0"))

    # Finnhub marketCapitalization is typically in USD (often billions). Keep raw number; adjust if you prefer.
    market_cap_raw = profile.get("marketCapitalization")
    market_cap = int(market_cap_raw) if isinstance(market_cap_raw, (int, float)) else None

    return {
        "symbol": symbol,
        "name": name,
        "exchange": exchange,
        "sector": sector_code,
        "current_price": current_price,
        "previous_close": previous_close,
        "market_cap": market_cap,
        "website_url": profile.get("weburl") or None,
        # description handled by Groq
    }
