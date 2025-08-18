from decimal import Decimal, InvalidOperation
from django.db.models import Q, Count, Sum, Avg, F
from django.utils.translation import gettext_lazy as _
from rest_framework import permissions, viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied
from backend.utils import create_success_response, create_error_response
from .models import Stock, Portfolio, PortfolioSummary, Wishlist, PriceAlert
from .serializers import (
    StockSerializer, StockListSerializer,
    PortfolioSerializer, PortfolioListSerializer, PortfolioCreateSerializer,
    PortfolioSummarySerializer, WishlistSerializer, WishlistListSerializer, 
    WishlistCreateSerializer, ToggleWishlistAlertsSerializer, PriceAlertSerializer, PriceAlertListSerializer, UpdatePriceAlertStatusSerializer
)

class StockViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StockSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "symbol"
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['sector', 'exchange', 'is_active']
    ordering_fields = ['name', 'symbol', 'current_price', 'market_cap', 'created_at', 'price_last_updated']
    ordering = ['name']
    search_fields = ['name', 'symbol', 'sector']

    def get_queryset(self):
        return Stock.objects.filter(is_active=True)

    def _apply_price_filters(self, queryset, request):
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        
        if min_price:
            try:
                queryset = queryset.filter(current_price__gte=Decimal(min_price))
            except (ValueError, TypeError, InvalidOperation):
                pass
        
        if max_price:
            try:
                queryset = queryset.filter(current_price__lte=Decimal(max_price))
            except (ValueError, TypeError, InvalidOperation):
                pass
        
        return queryset

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            
            sector = request.query_params.get('sector')
            exchange = request.query_params.get('exchange')
            
            if sector:
                queryset = queryset.filter(sector__icontains=sector)
            if exchange:
                queryset = queryset.filter(exchange__icontains=exchange)
            
            queryset = self._apply_price_filters(queryset, request)
            
            if not queryset.exists():
                return create_success_response(
                    _("No stocks found matching your criteria."),
                    data={'results': [], 'count': 0, 'next': None, 'previous': None}
                )
            
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = StockListSerializer(page, many=True)
                return create_success_response(
                    _("Stocks retrieved successfully."),
                    data=self.get_paginated_response(serializer.data).data
                )
            
            serializer = StockListSerializer(queryset, many=True)
            return create_success_response(
                _("Stocks retrieved successfully."),
                data={'results': serializer.data, 'count': len(serializer.data)}
            )
        except Exception as error:
            return create_error_response(_("Failed to retrieve stocks."), errors=[str(error)])

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return create_success_response(_("Stock retrieved successfully."), data=serializer.data)
        except NotFound:
            return create_error_response(_("Stock not found."), errors=[_("Stock does not exist")])
        except Exception as error:
            return create_error_response(_("Failed to retrieve stock."), errors=[str(error)])

    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        try:
            query = request.query_params.get('q', '').strip()
            if not query:
                return create_error_response(_("Search query required."), errors=[_("Please provide a search query")])
            
            if len(query) < 2:
                return create_error_response(_("Search query too short."), errors=[_("Search query must be at least 2 characters")])
            
            queryset = self.get_queryset().filter(
                Q(name__icontains=query) | Q(symbol__icontains=query) | Q(sector__icontains=query)
            )[:20]
            
            if not queryset:
                return create_success_response(
                    _("No stocks found for your search."),
                    data={'results': [], 'count': 0, 'query': query}
                )
            
            serializer = StockListSerializer(queryset, many=True)
            return create_success_response(
                _("Search results retrieved successfully."),
                data={'results': serializer.data, 'count': len(serializer.data), 'query': query}
            )
        except Exception as error:
            return create_error_response(_("Search failed."), errors=[str(error)])

    @action(detail=False, methods=['get'], url_path='sectors')
    def sectors(self, request):
        try:
            sector_stats = (Stock.objects
                          .filter(is_active=True)
                          .exclude(sector__isnull=True)
                          .exclude(sector__exact='')
                          .values('sector')
                          .annotate(stock_count=Count('id'))
                          .order_by('sector'))
            
            sectors_data = [
                {'sector': item['sector'], 'stock_count': item['stock_count']}
                for item in sector_stats
            ]
            
            if not sectors_data:
                return create_success_response(_("No sectors found."), data={'results': [], 'count': 0})
            
            return create_success_response(
                _("Sectors retrieved successfully."),
                data={'results': sectors_data, 'count': len(sectors_data)}
            )
        except Exception as error:
            return create_error_response(_("Failed to retrieve sectors."), errors=[str(error)])

    @action(detail=False, methods=['get'], url_path='exchanges')
    def exchanges(self, request):
        try:
            exchange_stats = (Stock.objects
                            .filter(is_active=True)
                            .exclude(exchange__isnull=True)
                            .exclude(exchange__exact='')
                            .values('exchange')
                            .annotate(stock_count=Count('id'))
                            .order_by('exchange'))
            
            exchanges_data = [
                {'exchange': item['exchange'], 'stock_count': item['stock_count']}
                for item in exchange_stats
            ]
            
            if not exchanges_data:
                return create_success_response(_("No exchanges found."), data={'results': [], 'count': 0})
            
            return create_success_response(
                _("Exchanges retrieved successfully."),
                data={'results': exchanges_data, 'count': len(exchanges_data)}
            )
        except Exception as error:
            return create_error_response(_("Failed to retrieve exchanges."), errors=[str(error)])


class PortfolioViewSet(viewsets.ModelViewSet):
    serializer_class = PortfolioSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['stock__sector', 'stock__exchange', 'is_active']
    ordering_fields = ['purchase_date', 'shares_owned', 'purchase_price', 'total_invested', 'created_at']
    ordering = ['-purchase_date']
    search_fields = ['stock__name', 'stock__symbol', 'notes', 'investment_thesis']

    def get_queryset(self):
        return Portfolio.objects.filter(
            user=self.request.user, is_active=True
        ).select_related('stock', 'user')

    def get_serializer_class(self):
        if self.action == 'list':
            return PortfolioListSerializer
        elif self.action == 'create':
            return PortfolioCreateSerializer
        return PortfolioSerializer

    def _apply_value_filters(self, queryset, request):
        min_value = request.query_params.get('min_current_value')
        max_value = request.query_params.get('max_current_value')
        min_invested = request.query_params.get('min_invested')
        max_invested = request.query_params.get('max_invested')
        
        if min_value:
            try:
                queryset = queryset.annotate(current_val=F('shares_owned') * F('stock__current_price')).filter(current_val__gte=Decimal(min_value))
            except (ValueError, TypeError, InvalidOperation):
                pass
        
        if max_value:
            try:
                queryset = queryset.annotate(current_val=F('shares_owned') * F('stock__current_price')).filter(current_val__lte=Decimal(max_value))
            except (ValueError, TypeError, InvalidOperation):
                pass
                
        if min_invested:
            try:
                queryset = queryset.filter(total_invested__gte=Decimal(min_invested))
            except (ValueError, TypeError, InvalidOperation):
                pass
                
        if max_invested:
            try:
                queryset = queryset.filter(total_invested__lte=Decimal(max_invested))
            except (ValueError, TypeError, InvalidOperation):
                pass
        
        return queryset

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            
            sector = request.query_params.get('sector')
            exchange = request.query_params.get('exchange')
            gain_loss_filter = request.query_params.get('gain_loss')
            
            if sector:
                queryset = queryset.filter(stock__sector__icontains=sector)
            if exchange:
                queryset = queryset.filter(stock__exchange__icontains=exchange)
                
            if gain_loss_filter == 'profit':
                queryset = queryset.annotate(current_val=F('shares_owned') * F('stock__current_price')).filter(current_val__gt=F('total_invested'))
            elif gain_loss_filter == 'loss':
                queryset = queryset.annotate(current_val=F('shares_owned') * F('stock__current_price')).filter(current_val__lt=F('total_invested'))
            elif gain_loss_filter == 'breakeven':
                queryset = queryset.annotate(current_val=F('shares_owned') * F('stock__current_price')).filter(current_val=F('total_invested'))
            
            queryset = self._apply_value_filters(queryset, request)
            
            if not queryset.exists():
                return create_success_response(
                    _("No portfolio holdings found matching your criteria."),
                    data={'results': [], 'count': 0, 'next': None, 'previous': None}
                )
            
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return create_success_response(
                    _("Portfolio holdings retrieved successfully."),
                    data=self.get_paginated_response(serializer.data).data
                )
            
            serializer = self.get_serializer(queryset, many=True)
            return create_success_response(
                _("Portfolio holdings retrieved successfully."),
                data={'results': serializer.data, 'count': len(serializer.data)}
            )
        except Exception as error:
            return create_error_response(_("Failed to retrieve portfolio holdings."), errors=[str(error)])

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return create_success_response(_("Portfolio holding retrieved successfully."), data=serializer.data)
        except NotFound:
            return create_error_response(_("Portfolio holding not found."), errors=[_("Holding does not exist or you don't have permission to view it")])
        except Exception as error:
            return create_error_response(_("Failed to retrieve portfolio holding."), errors=[str(error)])

    def create(self, request, *args, **kwargs):
        try:
            stock_id = request.data.get('stock')
            if stock_id:
                existing_holding = Portfolio.objects.filter(user=request.user, stock_id=stock_id, is_active=True).first()
                if existing_holding:
                    return create_error_response(
                        _("Stock already in portfolio."),
                        errors=[_("You already own shares of this stock. Consider updating your existing holding.")]
                    )
            
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                holding = serializer.save()
                response_serializer = PortfolioSerializer(holding)
                return create_success_response(
                    _("Stock added to portfolio successfully."),
                    data=response_serializer.data, status_code=status.HTTP_201_CREATED
                )
            
            return create_error_response(_("Failed to add stock to portfolio."), errors=serializer.errors)
        except Exception as error:
            return create_error_response(_("Failed to add stock to portfolio."), errors=[str(error)])

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=False)
            
            if serializer.is_valid():
                holding = serializer.save()
                return create_success_response(_("Portfolio holding updated successfully."), data=serializer.data)
            
            return create_error_response(_("Failed to update portfolio holding."), errors=serializer.errors)
        except NotFound:
            return create_error_response(_("Portfolio holding not found."), errors=[_("Holding does not exist or you don't have permission to modify it")])
        except Exception as error:
            return create_error_response(_("Failed to update portfolio holding."), errors=[str(error)])

    def partial_update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            
            if serializer.is_valid():
                holding = serializer.save()
                return create_success_response(_("Portfolio holding updated successfully."), data=serializer.data)
            
            return create_error_response(_("Failed to update portfolio holding."), errors=serializer.errors)
        except NotFound:
            return create_error_response(_("Portfolio holding not found."), errors=[_("Holding does not exist or you don't have permission to modify it")])
        except Exception as error:
            return create_error_response(_("Failed to update portfolio holding."), errors=[str(error)])

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.is_active = False
            instance.save(update_fields=['is_active', 'updated_at'])
            
            return create_success_response(_("Stock removed from portfolio successfully."), data={})
        except NotFound:
            return create_error_response(_("Portfolio holding not found."), errors=[_("Holding does not exist or you don't have permission to delete it")])
        except Exception as error:
            return create_error_response(_("Failed to remove stock from portfolio."), errors=[str(error)])

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        try:
            summary = PortfolioSummary.refresh_for_user(request.user)
            serializer = PortfolioSummarySerializer(summary)
            return create_success_response(_("Portfolio summary retrieved successfully."), data=serializer.data)
        except Exception as error:
            return create_error_response(_("Failed to retrieve portfolio summary."), errors=[str(error)])

    @action(detail=False, methods=['get'], url_path='performance')
    def performance(self, request):
        try:
            holdings = self.get_queryset()
            
            if not holdings.exists():
                return create_success_response(
                    _("No holdings found for performance calculation."),
                    data={'total_invested': '0.00', 'current_value': '0.00', 'total_gain_loss': '0.00'}
                )
            
            total_invested = sum(h.total_invested for h in holdings)
            current_value = sum(h.current_value for h in holdings)
            total_gain_loss = current_value - total_invested
            gain_loss_percentage = (total_gain_loss / total_invested * 100) if total_invested > 0 else Decimal('0.00')
            day_change = sum(h.day_change_value for h in holdings)
            
            performance_data = {
                'total_invested': str(total_invested),
                'current_value': str(current_value),
                'total_gain_loss': str(total_gain_loss),
                'gain_loss_percentage': str(gain_loss_percentage),
                'day_change': str(day_change),
                'number_of_holdings': holdings.count()
            }
            
            return create_success_response(_("Portfolio performance retrieved successfully."), data=performance_data)
        except Exception as error:
            return create_error_response(_("Failed to retrieve portfolio performance."), errors=[str(error)])

    @action(detail=False, methods=['get'], url_path='by-sector')
    def by_sector(self, request):
        try:
            sector_data = (self.get_queryset()
                         .values('stock__sector')
                         .annotate(
                             holdings_count=Count('id'),
                             total_invested=Sum('total_invested'),
                             avg_purchase_price=Avg('purchase_price')
                         )
                         .order_by('stock__sector'))
            
            if not sector_data:
                return create_success_response(_("No sector data found."), data={'results': [], 'count': 0})
            
            results = []
            for item in sector_data:
                sector_holdings = self.get_queryset().filter(stock__sector=item['stock__sector'])
                current_value = sum(h.current_value for h in sector_holdings)
                
                results.append({
                    'sector': item['stock__sector'],
                    'holdings_count': item['holdings_count'],
                    'total_invested': str(item['total_invested']),
                    'current_value': str(current_value),
                    'gain_loss': str(current_value - item['total_invested']),
                    'avg_purchase_price': str(item['avg_purchase_price'])
                })
            
            return create_success_response(
                _("Portfolio holdings by sector retrieved successfully."),
                data={'results': results, 'count': len(results)}
            )
        except Exception as error:
            return create_error_response(_("Failed to retrieve portfolio holdings by sector."), errors=[str(error)])

    @action(detail=False, methods=['post'], url_path='bulk-add')
    def bulk_add(self, request):
        try:
            holdings_data = request.data.get('holdings', [])
            if not holdings_data:
                return create_error_response(_("No holdings data provided."), errors=[_("Please provide an array of holdings to add")])
            
            if len(holdings_data) > 50:
                return create_error_response(_("Too many holdings."), errors=[_("Maximum 50 holdings can be added at once")])
            
            created_holdings = []
            errors = []
            
            for i, holding_data in enumerate(holdings_data):
                stock_id = holding_data.get('stock')
                if stock_id and Portfolio.objects.filter(user=request.user, stock_id=stock_id, is_active=True).exists():
                    errors.append(f"Holding {i+1}: Stock already in portfolio")
                    continue
                
                serializer = PortfolioCreateSerializer(data=holding_data, context={'request': request})
                if serializer.is_valid():
                    holding = serializer.save()
                    created_holdings.append(holding)
                else:
                    errors.append(f"Holding {i+1}: {serializer.errors}")
            
            if created_holdings:
                response_serializer = PortfolioListSerializer(created_holdings, many=True)
                response_data = {
                    'created': response_serializer.data,
                    'created_count': len(created_holdings),
                    'errors': errors,
                    'error_count': len(errors)
                }
                
                return create_success_response(_("Bulk add completed."), data=response_data)
            else:
                return create_error_response(_("Failed to add any holdings."), errors=errors)
                
        except Exception as error:
            return create_error_response(_("Failed to bulk add holdings."), errors=[str(error)])

    @action(detail=False, methods=['get'], url_path='top-performers')
    def top_performers(self, request):
        try:
            limit = min(int(request.query_params.get('limit', 10)), 50)
            
            holdings = list(self.get_queryset())
            if not holdings:
                return create_success_response(_("No holdings found."), data={'results': [], 'count': 0})
            
            sorted_holdings = sorted(holdings, key=lambda h: h.unrealized_gain_loss_percentage, reverse=True)[:limit]
            
            serializer = PortfolioListSerializer(sorted_holdings, many=True)
            return create_success_response(
                _("Top performing holdings retrieved successfully."),
                data={'results': serializer.data, 'count': len(serializer.data)}
            )
        except Exception as error:
            return create_error_response(_("Failed to retrieve top performers."), errors=[str(error)])

    @action(detail=False, methods=['get'], url_path='worst-performers')
    def worst_performers(self, request):
        try:
            limit = min(int(request.query_params.get('limit', 10)), 50)
            
            holdings = list(self.get_queryset())
            if not holdings:
                return create_success_response(_("No holdings found."), data={'results': [], 'count': 0})
            
            sorted_holdings = sorted(holdings, key=lambda h: h.unrealized_gain_loss_percentage)[:limit]
            
            serializer = PortfolioListSerializer(sorted_holdings, many=True)
            return create_success_response(
                _("Worst performing holdings retrieved successfully."),
                data={'results': serializer.data, 'count': len(serializer.data)}
            )
        except Exception as error:
            return create_error_response(_("Failed to retrieve worst performers."), errors=[str(error)])


class WishlistViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['priority', 'is_active', 'email_alerts_enabled']
    lookup_field = 'stock__symbol'
    ordering_fields = ['priority', 'created_at', 'updated_at', 'target_buy_price']
    ordering = ['priority', '-created_at']
    search_fields = ['stock__name', 'stock__symbol', 'notes', 'watch_reason']

    def get_queryset(self):
        return Wishlist.objects.filter(
            user=self.request.user, is_active=True
        ).select_related('stock', 'user')

    def get_serializer_class(self):
        if self.action in ['list', 'by_priority', 'alerts_ready']:
            return WishlistListSerializer
        elif self.action == 'create':
            return WishlistCreateSerializer
        elif self.action == 'toggle_alerts':
            return ToggleWishlistAlertsSerializer
        return WishlistSerializer

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            serializer = self.get_serializer(page if page is not None else queryset, many=True)
            count = queryset.count() if page is None else len(page)
            return create_success_response(
                _("Wishlist items retrieved successfully."),
                data=self.get_paginated_response(serializer.data).data if page is not None else {'results': serializer.data, 'count': count}
            )
        except Exception as error:
            return create_error_response(_("Failed to retrieve wishlist."), errors=[str(error)])

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = WishlistSerializer(instance)
            return create_success_response(_("Wishlist item retrieved successfully."), data=serializer.data)
        except NotFound:
            return create_error_response(_("Wishlist item not found."), errors=[_("Wishlist item does not exist")])
        except Exception as error:
            return create_error_response(_("Failed to retrieve wishlist item."), errors=[str(error)])

    def create(self, request, *args, **kwargs):
        try:
            stock_id = request.data.get('stock')
            if stock_id and Wishlist.objects.filter(user=request.user, stock_id=stock_id, is_active=True).exists():
                return create_error_response(
                    _("This stock is already in your active wishlist."),
                    errors=[_("Consider updating your wishlist item instead.")]
                )
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                wishlist = serializer.save()
                response_serializer = WishlistSerializer(wishlist)
                return create_success_response(
                    _("Wishlist item created successfully."),
                    data=response_serializer.data, status_code=status.HTTP_201_CREATED
                )
            return create_error_response(_("Failed to create wishlist item."), errors=serializer.errors)
        except Exception as error:
            return create_error_response(_("Failed to create wishlist item."), errors=[str(error)])

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=False)
            if serializer.is_valid():
                wishlist = serializer.save()
                return create_success_response(
                    _("Wishlist item updated successfully."), data=WishlistSerializer(wishlist).data
                )
            return create_error_response(_("Failed to update wishlist item."), errors=serializer.errors)
        except NotFound:
            return create_error_response(_("Wishlist item not found."), errors=[_("Wishlist item does not exist")])
        except Exception as error:
            return create_error_response(_("Failed to update wishlist item."), errors=[str(error)])

    def partial_update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            if serializer.is_valid():
                wishlist = serializer.save()
                return create_success_response(
                    _("Wishlist item updated successfully."), data=WishlistSerializer(wishlist).data
                )
            return create_error_response(_("Failed to update wishlist item."), errors=serializer.errors)
        except NotFound:
            return create_error_response(_("Wishlist item not found."), errors=[_("Wishlist item does not exist or you don't have permission to modify")])
        except Exception as error:
            return create_error_response(_("Failed to update wishlist item."), errors=[str(error)])

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.is_active = False
            instance.save(update_fields=['is_active', 'updated_at'])
            return create_success_response(_("Wishlist item removed successfully."), data={})
        except NotFound:
            return create_error_response(_("Wishlist item not found."), errors=[_("Wishlist item does not exist")])
        except Exception as error:
            return create_error_response(_("Failed to remove wishlist item."), errors=[str(error)])

    @action(detail=False, methods=['get'], url_path='alerts-ready')
    def alerts_ready(self, request):
        try:
            queryset = self.get_queryset().filter(
                email_alerts_enabled=True, target_buy_price__gte=F('stock__current_price')
            )
            serializer = WishlistListSerializer(queryset, many=True)
            return create_success_response(
                _("Alert-ready wishlist items retrieved successfully."),
                data={'results': serializer.data, 'count': len(serializer.data)}
            )
        except Exception as error:
            return create_error_response(_("Failed to fetch alert ready items."), errors=[str(error)])

    @action(detail=True, methods=['post'], url_path='toggle-alerts')
    def toggle_alerts(self, request, pk=None):
        try:
            wishlist_item = self.get_object()
            serializer = ToggleWishlistAlertsSerializer(
                data=request.data, context={'wishlist_item': wishlist_item}
            )
            if serializer.is_valid():
                wishlist_item = serializer.save()
                return create_success_response(
                    _("Wishlist email alerts status updated."),
                    data=WishlistSerializer(wishlist_item).data
                )
            return create_error_response(_("Failed to toggle alerts."), errors=serializer.errors)
        except NotFound:
            return create_error_response(_("Wishlist item not found."), errors=[_("No such wishlist item")])
        except Exception as error:
            return create_error_response(_("Failed to toggle alerts."), errors=[str(error)])

    @action(detail=False, methods=['get'], url_path='by-priority')
    def by_priority(self, request):
        try:
            queryset = self.get_queryset().order_by('priority', '-created_at')
            serializer = WishlistListSerializer(queryset, many=True)
            return create_success_response(
                _("Wishlist items sorted by priority."),
                data={'results': serializer.data, 'count': len(serializer.data)}
            )
        except Exception as error:
            return create_error_response(_("Failed to fetch priority-sorted wishlist."), errors=[str(error)])

class PriceAlertViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['alert_type', 'status', 'email_sent']
    ordering_fields = ['created_at', 'email_sent_at']
    ordering = ['-created_at']
    search_fields = ['wishlist_item__stock__name', 'wishlist_item__stock__symbol']
    queryset = PriceAlert.objects.none()

    def get_queryset(self):
        return PriceAlert.objects.filter(
            wishlist_item__user=self.request.user
        ).select_related('wishlist_item', 'wishlist_item__stock')

    def get_serializer_class(self):
        if self.action in ['list', 'recent']:
            return PriceAlertListSerializer
        elif self.action in ['partial_update', 'update_status']:
            return UpdatePriceAlertStatusSerializer
        return PriceAlertSerializer

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            serializer = PriceAlertListSerializer(page if page is not None else queryset, many=True)
            data = self.get_paginated_response(serializer.data).data if page is not None else {'results': serializer.data, 'count': len(serializer.data)}
            return create_success_response(_("Price alerts retrieved successfully."), data=data)
        except Exception as error:
            return create_error_response(_("Failed to retrieve price alerts."), errors=[str(error)])

    def retrieve(self, request, *args, **kwargs):
        try:
            alert = self.get_object()
            serializer = PriceAlertSerializer(alert)
            return create_success_response(_("Price alert details retrieved."), data=serializer.data)
        except NotFound:
            return create_error_response(_("Price alert not found."), errors=[_("Alert does not exist")])
        except Exception as error:
            return create_error_response(_("Failed to retrieve price alert."), errors=[str(error)])

    def partial_update(self, request, *args, **kwargs):
        try:
            alert = self.get_object()
            serializer = UpdatePriceAlertStatusSerializer(
                data=request.data, context={"alert": alert}
            )
            if serializer.is_valid():
                alert = serializer.save()
                return create_success_response(
                    _("Price alert status updated."),
                    data=PriceAlertSerializer(alert).data
                )
            return create_error_response(_("Failed to update alert status."), errors=serializer.errors)
        except NotFound:
            return create_error_response(_("Price alert not found."), errors=[_("Alert does not exist")])
        except Exception as error:
            return create_error_response(_("Failed to update alert status."), errors=[str(error)])

    @action(detail=False, methods=['get'], url_path='recent')
    def recent(self, request):
        try:
            queryset = self.get_queryset().order_by('-created_at')[:20]
            serializer = PriceAlertListSerializer(queryset, many=True)
            return create_success_response(
                _("Recent price alerts retrieved."),
                data={'results': serializer.data, 'count': len(serializer.data)}
            )
        except Exception as error:
            return create_error_response(_("Failed to retrieve recent alerts."), errors=[str(error)])

    @action(detail=False, methods=['get'], url_path='unread')
    def unread(self, request):
        try:
            count = self.get_queryset().filter(status='TRIGGERED').count()
            return create_success_response(
                _("Unread alerts count."),
                data={'unread_count': count}
            )
        except Exception as error:
            return create_error_response(_("Failed to retrieve unread alerts count."), errors=[str(error)])

