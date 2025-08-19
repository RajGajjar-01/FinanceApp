from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StockViewSet, PortfolioViewSet, WishlistViewSet

app_name = 'portfolio'

router = DefaultRouter()
router.register(r'stocks', StockViewSet, basename='stocks')
router.register(r'portfolio', PortfolioViewSet, basename='portfolio')
router.register(r'wishlist', WishlistViewSet, basename="wishlist")

urlpatterns = [
    path('', include(router.urls)),
]
