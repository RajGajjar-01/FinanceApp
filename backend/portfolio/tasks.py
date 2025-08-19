from celery import shared_task
import requests
import os
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import StockData
from dotenv import load_dotenv
load_dotenv()
from django.conf import settings

FINNHUB_API_KEY = settings.FINNHUB_API_KEY

@shared_task
def fetch_stock_data(symbol="BINANCE:BTCUSDT"):   # 👈 Default set to Bitcoin
    url = f"https://finnhub.io/api/v1/quote?symbol={symbol}&token={FINNHUB_API_KEY}"
    response = requests.get(url).json()

    # save to database
    StockData.objects.create(
        symbol=symbol,
        price=response.get("c"),
        high=response.get("h"),
        low=response.get("l"),
        open_price=response.get("o"),
        prev_close=response.get("pc")
    )

    # also send to WebSocket
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "stocks",
        {"type": "stock_update", "data": response}
    )

    return response
