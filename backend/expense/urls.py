from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AccountViewSet, TransactionViewSet, BudgetViewSet

app_name = 'expense'

router = DefaultRouter()
router.register(r'accounts', AccountViewSet, basename='accounts')
router.register(r'transactions', TransactionViewSet, basename='transactions')
router.register(r'budget', BudgetViewSet, basename='budget')

urlpatterns = [
    path('expense/', include(router.urls)),
]

