from django.urls import path
from .views import latest_stock

urlpatterns = [
    path("latest/<str:symbol>/", latest_stock, name="latest-stock"),
]
