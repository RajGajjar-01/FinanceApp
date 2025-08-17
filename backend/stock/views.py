from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import StockData

@api_view(["GET"])
def latest_stock(request, symbol="AAPL"):
    stock = StockData.objects.filter(symbol=symbol).order_by("-timestamp").first()
    if stock:
        return Response({
            "symbol": stock.symbol,
            "price": stock.price,
            "high": stock.high,
            "low": stock.low,
            "open": stock.open_price,
            "prev_close": stock.prev_close,
            "timestamp": stock.timestamp
        })
    return Response({"error": "No data found"}, status=404)
