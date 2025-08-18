from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StockViewSet, PortfolioViewSet

app_name = 'portfolio'

router = DefaultRouter()
router.register(r'stocks', StockViewSet, basename='stocks')
router.register(r'portfolio', PortfolioViewSet, basename='portfolio')

urlpatterns = [
    path('', include(router.urls)),
]
