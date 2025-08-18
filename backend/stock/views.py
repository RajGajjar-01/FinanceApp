from django.conf import settings
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import StockData
import requests
import logging

logger = logging.getLogger(__name__)

FINNHUB_API_KEY = getattr(settings, "FINNHUB_API_KEY", None)
FINNHUB_SEARCH_URL = "https://finnhub.io/api/v1/search"

# --- Latest Stock Endpoint ---
@api_view(["GET"])
def latest_stock(request, symbol="AAPL"):
    """
    Returns the latest stock data for a given symbol.
    """
    try:
        stock = StockData.objects.filter(symbol=symbol).order_by("-timestamp").first()
        if not stock:
            return Response({"error": f"No data found for symbol '{symbol}'"}, status=404)

        return Response({
            "symbol": stock.symbol,
            "price": stock.price,
            "high": stock.high,
            "low": stock.low,
            "open": stock.open_price,
            "prev_close": stock.prev_close,
            "timestamp": stock.timestamp
        })
    except Exception as e:
        logger.error(f"Error fetching latest stock for {symbol}: {e}")
        return Response({"error": "Internal server error"}, status=500)


# --- Stock Search Endpoint ---
@api_view(["GET"])
def stock_search(request):
    """
    Searches for stocks by query using Finnhub API.
    Returns a list of matching stocks with their symbol and name.
    """
    query = request.GET.get("query", "").strip()
    if not query:
        return JsonResponse({"found": False, "stocks": [], "message": "Query parameter is required."})

    if not FINNHUB_API_KEY:
        logger.error("Finnhub API key not configured.")
        return JsonResponse({"found": False, "stocks": [], "message": "API key not configured."})

    try:
        response = requests.get(FINNHUB_SEARCH_URL, params={"q": query, "token": FINNHUB_API_KEY}, timeout=5)
        response.raise_for_status()
        data = response.json()

        results = data.get("result", [])
        if not results:
            return JsonResponse({"found": False, "stocks": [], "message": f"No stocks found for '{query}'."})

        stocks = [{"symbol": item["symbol"], "name": item["description"]} for item in results]
        return JsonResponse({"found": True, "stocks": stocks})

    except requests.exceptions.RequestException as e:
        logger.error(f"Request error during stock search: {e}")
        return JsonResponse({"found": False, "stocks": [], "message": "Failed to fetch stock data."})
    except Exception as e:
        logger.exception(f"Unexpected error during stock search: {e}")
        return JsonResponse({"found": False, "stocks": [], "message": "Internal server error."})
