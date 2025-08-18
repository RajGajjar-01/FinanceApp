from django.urls import path
from .views import latest_stock,stock_search

urlpatterns = [
    path("latest/<str:symbol>/", latest_stock, name="latest-stock"),
    path('stocks/search/', stock_search, name='stock-search'),
]
