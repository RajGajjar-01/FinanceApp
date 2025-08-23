from decimal import Decimal, InvalidOperation
from django.db.models import Q, Count, Sum, Avg, F, Case, When, DecimalField
from django.http import JsonResponse
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
    WishlistCreateSerializer, ToggleWishlistAlertsSerializer, PriceAlertSerializer, 
    PriceAlertListSerializer, UpdatePriceAlertStatusSerializer , AddToPortfolioBySymbolSerializer
)
from portfolio.services.portfolio_service import add_stock_to_portfolio_by_symbol
from django.conf import settings
import requests

FINNHUB_SEARCH_URL = "https://finnhub.io/api/v1/search"
FINHUB_API_KEY = getattr(settings, "FINHUB_API_KEY", None)

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
        for field, param in [('current_price__gte', 'min_price'), ('current_price__lte', 'max_price')]:
            value = request.query_params.get(param)
            if value:
                try:
                    queryset = queryset.filter(**{field: Decimal(value)})
                except (ValueError, TypeError, InvalidOperation):
                    pass
        return queryset

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            
            # Apply text filters
            for field, param in [('sector__icontains', 'sector'), ('exchange__icontains', 'exchange')]:
                value = request.query_params.get(param)
                if value:
                    queryset = queryset.filter(**{field: value})
            
            queryset = self._apply_price_filters(queryset, request)
            
            if not queryset.exists():
                return create_success_response(
                    _("No stocks found matching your criteria."),
                    data={'results': [], 'count': 0, 'next': None, 'previous': None}
                )
            
            page = self.paginate_queryset(queryset)
            serializer = StockListSerializer(page or queryset, many=True)
            
            if page is not None:
                return create_success_response(_("Stocks retrieved successfully."),
                                             data=self.get_paginated_response(serializer.data).data)
            
            return create_success_response(_("Stocks retrieved successfully."),
                                         data={'results': serializer.data, 'count': len(serializer.data)})
        except Exception as error:
            return create_error_response(_("Failed to retrieve stocks."), errors=[str(error)])

    def retrieve(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(self.get_object())
            return create_success_response(_("Stock retrieved successfully."), data=serializer.data)
        except NotFound:
            return create_error_response(_("Stock not found."), errors=[_("Stock does not exist")])
        except Exception as error:
            return create_error_response(_("Failed to retrieve stock."), errors=[str(error)])

    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        """
        Search for stocks using Finnhub API and local database search.
        """
        query = request.query_params.get("query", request.query_params.get('q', '')).strip()
        
        if not query:
            return create_error_response(_("Search query required."), errors=[_("Please provide a search query.")])

        # First try Finnhub API search if API key is available
        if FINHUB_API_KEY:
            try:
                response = requests.get(
                    FINNHUB_SEARCH_URL,
                    params={"q": query, "token": FINHUB_API_KEY},
                    timeout=5
                )
                response.raise_for_status()
                data = response.json()
                results = data.get("result", [])
                
                if results:
                    stocks = [{"symbol": item["symbol"], "name": item["description"]} for item in results]
                    return create_success_response(_("Search results retrieved successfully."), 
                                                 data={'results': stocks, 'count': len(stocks), 'query': query, 'source': 'finnhub'})
            except requests.exceptions.RequestException:
                # Fall back to database search if Finnhub fails
                pass
            except Exception:
                # Fall back to database search for any other exception
                pass
        
        # Fallback to database search (from second code)
        if len(query) < 2:
            return create_error_response(_("Search query too short."), 
                                       errors=[_("Search query must be at least 2 characters")])
        
        # Optimized search with database-level filtering
        queryset = self.get_queryset().filter(
            Q(name__icontains=query) | Q(symbol__icontains=query) | Q(sector__icontains=query)
        ).only('id', 'name', 'symbol', 'sector', 'current_price', 'exchange')[:20]
        
        serializer = StockListSerializer(queryset, many=True)
        message = _("Search results retrieved successfully.") if queryset else _("No stocks found for your search.")
        
        return create_success_response(message, data={
            'results': serializer.data, 'count': len(serializer.data), 'query': query, 'source': 'database'
        })

    @action(detail=False, methods=['get'], url_path='sectors')
    def sectors(self, request):
        try:
            # Optimized single query with database aggregation
            sector_stats = (Stock.objects.filter(is_active=True)
                          .exclude(sector__isnull=True, sector__exact='')
                          .values('sector')
                          .annotate(stock_count=Count('id'))
                          .order_by('sector'))
            
            sectors_data = list(sector_stats)
            
            if not sectors_data:
                return create_success_response(_("No sectors found."), data={'results': [], 'count': 0})
            
            return create_success_response(_("Sectors retrieved successfully."),
                                         data={'results': sectors_data, 'count': len(sectors_data)})
        except Exception as error:
            return create_error_response(_("Failed to retrieve sectors."), errors=[str(error)])

    @action(detail=False, methods=['get'], url_path='exchanges')
    def exchanges(self, request):
        try:
            # Optimized single query with database aggregation
            exchange_stats = (Stock.objects.filter(is_active=True)
                            .exclude(exchange__isnull=True, exchange__exact='')
                            .values('exchange')
                            .annotate(stock_count=Count('id'))
                            .order_by('exchange'))
            
            exchanges_data = list(exchange_stats)
            
            if not exchanges_data:
                return create_success_response(_("No exchanges found."), data={'results': [], 'count': 0})
            
            return create_success_response(_("Exchanges retrieved successfully."),
                                         data={'results': exchanges_data, 'count': len(exchanges_data)})
        except Exception as error:
            return create_error_response(_("Failed to retrieve exchanges."), errors=[str(error)])
        
    @action(detail=True, methods=['get'], url_path='latest')
    def latest(self, request, symbol=None):
        """
        Get the latest stock data for a specific symbol.
        """
        try:
            stock = self.get_queryset().filter(symbol=symbol).order_by("-price_last_updated").first()
            if not stock:
                return create_error_response(_("Stock data not found."), errors=[f"Symbol '{symbol}' does not exist."])
            
            serializer = self.get_serializer(stock)
            return create_success_response(_("Latest stock data retrieved successfully."), data=serializer.data)
        except Exception as error:
            return create_error_response(_("Failed to retrieve latest stock data."), errors=[str(error)])
 
    @action(detail=False, methods=['get'], url_path='details')
    def get_stock_details(self, request):
        symbol = request.GET.get("symbol")
        if not symbol:
            return JsonResponse({"error": "Symbol required"}, status=400)

        try:
            if not FINHUB_API_KEY:
                return JsonResponse({"error": "API key not configured"}, status=500)
                
            url = f"https://finnhub.io/api/v1/quote?symbol={symbol}&token={FINHUB_API_KEY}"
            response = requests.get(url)
            data = response.json()
            print("Stock details response:", data)
            # Finnhub quote API returns: c=current price, pc=previous close
            return JsonResponse({
                "symbol": symbol,
                "name": symbol,  # You can add another API call for full name if needed
                "currentPrice": data.get("c"),
                "previousClose": data.get("pc")
            })
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


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
        ).select_related('stock')

    def get_serializer_class(self):
        serializer_map = {'list': PortfolioListSerializer, 'create': PortfolioCreateSerializer}
        return serializer_map.get(self.action, PortfolioSerializer)

    def _apply_value_filters(self, queryset, request):
        params = request.query_params
        
        # Investment amount filters
        for field, param in [('total_invested__gte', 'min_invested'), ('total_invested__lte', 'max_invested')]:
            value = params.get(param)
            if value:
                try:
                    queryset = queryset.filter(**{field: Decimal(value)})
                except (ValueError, TypeError, InvalidOperation):
                    pass
        
        # Current value filters - calculated at database level
        current_value_annotation = F('shares_owned') * F('stock__current_price')
        
        min_current_value = params.get('min_current_value')
        max_current_value = params.get('max_current_value')
        
        if min_current_value or max_current_value:
            queryset = queryset.annotate(current_val=current_value_annotation)
            
            if min_current_value:
                try:
                    queryset = queryset.filter(current_val__gte=Decimal(min_current_value))
                except (ValueError, TypeError, InvalidOperation):
                    pass
            
            if max_current_value:
                try:
                    queryset = queryset.filter(current_val__lte=Decimal(max_current_value))
                except (ValueError, TypeError, InvalidOperation):
                    pass
        
        return queryset

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            
            # Text filters
            for field, param in [('stock__sector__icontains', 'sector'), ('stock__exchange__icontains', 'exchange')]:
                value = request.query_params.get(param)
                if value:
                    queryset = queryset.filter(**{field: value})
            
            # Gain/loss filter - calculated at database level
            gain_loss = request.query_params.get('gain_loss')
            if gain_loss in ['profit', 'loss', 'breakeven']:
                current_val = F('shares_owned') * F('stock__current_price')
                queryset = queryset.annotate(current_val=current_val)
                
                filter_map = {
                    'profit': 'current_val__gt', 
                    'loss': 'current_val__lt', 
                    'breakeven': 'current_val'
                }
                queryset = queryset.filter(**{filter_map[gain_loss]: F('total_invested')})
            
            queryset = self._apply_value_filters(queryset, request)
            
            if not queryset.exists():
                return create_success_response(
                    _("No portfolio holdings found matching your criteria."),
                    data={'results': [], 'count': 0, 'next': None, 'previous': None}
                )
            
            page = self.paginate_queryset(queryset)
            serializer = self.get_serializer(page or queryset, many=True)
            
            if page is not None:
                return create_success_response(_("Portfolio holdings retrieved successfully."),
                                             data=self.get_paginated_response(serializer.data).data)
            
            return create_success_response(_("Portfolio holdings retrieved successfully."),
                                         data={'results': serializer.data, 'count': len(serializer.data)})
        except Exception as error:
            return create_error_response(_("Failed to retrieve portfolio holdings."), errors=[str(error)])

    def retrieve(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(self.get_object())
            return create_success_response(_("Portfolio holding retrieved successfully."), data=serializer.data)
        except NotFound:
            return create_error_response(_("Portfolio holding not found."), 
                                       errors=[_("Holding does not exist or you don't have permission to view it")])
        except Exception as error:
            return create_error_response(_("Failed to retrieve portfolio holding."), errors=[str(error)])

    def create(self, request, *args, **kwargs):
        try:
            stock_id = request.data.get('stock')
            if stock_id and Portfolio.objects.filter(user=request.user, stock_id=stock_id, is_active=True).exists():
                return create_error_response(_("Stock already in portfolio."),
                                           errors=[_("You already own shares of this stock. Consider updating your existing holding.")])
            
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                holding = serializer.save()
                return create_success_response(_("Stock added to portfolio successfully."),
                                             data=PortfolioSerializer(holding).data, 
                                             status_code=status.HTTP_201_CREATED)
            
            return create_error_response(_("Failed to add stock to portfolio."), errors=serializer.errors)
        except Exception as error:
            return create_error_response(_("Failed to add stock to portfolio."), errors=[str(error)])

    def _perform_update(self, request, partial=False):
        """Common update logic for full and partial updates"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            
            if serializer.is_valid():
                serializer.save()
                return create_success_response(_("Portfolio holding updated successfully."), data=serializer.data)
            
            return create_error_response(_("Failed to update portfolio holding."), errors=serializer.errors)
        except NotFound:
            return create_error_response(_("Portfolio holding not found."), 
                                       errors=[_("Holding does not exist or you don't have permission to modify it")])
        except Exception as error:
            return create_error_response(_("Failed to update portfolio holding."), errors=[str(error)])

    def update(self, request, *args, **kwargs):
        return self._perform_update(request, partial=False)

    def partial_update(self, request, *args, **kwargs):
        return self._perform_update(request, partial=True)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.is_active = False
            instance.save(update_fields=['is_active', 'updated_at'])
            return create_success_response(_("Stock removed from portfolio successfully."), data={})
        except NotFound:
            return create_error_response(_("Portfolio holding not found."), 
                                       errors=[_("Holding does not exist or you don't have permission to delete it")])
        except Exception as error:
            return create_error_response(_("Failed to remove stock from portfolio."), errors=[str(error)])

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        try:
            summary = PortfolioSummary.refresh_for_user(request.user)
            return create_success_response(_("Portfolio summary retrieved successfully."), 
                                         data=PortfolioSummarySerializer(summary).data)
        except Exception as error:
            return create_error_response(_("Failed to retrieve portfolio summary."), errors=[str(error)])

    @action(detail=False, methods=['get'], url_path='performance')
    def performance(self, request):
        try:
            # Database-level calculations for better performance
            performance_data = self.get_queryset().aggregate(
                total_invested=Sum('total_invested'),
                current_value=Sum(F('shares_owned') * F('stock__current_price'), output_field=DecimalField()),
                number_of_holdings=Count('id')
            )
            
            if not performance_data['total_invested']:
                return create_success_response(_("No holdings found for performance calculation."),
                                             data={'total_invested': '0.00', 'current_value': '0.00', 'total_gain_loss': '0.00'})
            
            total_invested = performance_data['total_invested'] or Decimal('0.00')
            current_value = performance_data['current_value'] or Decimal('0.00')
            total_gain_loss = current_value - total_invested
            gain_loss_percentage = (total_gain_loss / total_invested * 100) if total_invested > 0 else Decimal('0.00')
            
            # Calculate day change at database level - check if stock model has day_change or price_change field
            try:
                day_change = self.get_queryset().aggregate(
                    day_change=Sum(F('shares_owned') * F('stock__day_change'), output_field=DecimalField())
                )['day_change'] or Decimal('0.00')
            except Exception:
                # Fallback if day_change field doesn't exist
                day_change = Decimal('0.00')
            
            return create_success_response(_("Portfolio performance retrieved successfully."), data={
                'total_invested': str(total_invested),
                'current_value': str(current_value),
                'total_gain_loss': str(total_gain_loss),
                'gain_loss_percentage': str(gain_loss_percentage),
                'day_change': str(day_change),
                'number_of_holdings': performance_data['number_of_holdings']
            })
        except Exception as error:
            return create_error_response(_("Failed to retrieve portfolio performance."), errors=[str(error)])

    @action(detail=False, methods=['get'], url_path='by-sector')
    def by_sector(self, request):
        try:
            # Single optimized query with database-level calculations
            sector_data = (self.get_queryset()
                         .values('stock__sector')
                         .annotate(
                             holdings_count=Count('id'),
                             total_invested=Sum('total_invested'),
                             current_value=Sum(F('shares_owned') * F('stock__current_price'), output_field=DecimalField()),
                             avg_purchase_price=Avg('purchase_price')
                         )
                         .order('stock__sector'))
            
            if not sector_data:
                return create_success_response(_("No sector data found."), data={'results': [], 'count': 0})
            
            results = []
            for item in sector_data:
                current_value = item['current_value'] or Decimal('0.00')
                total_invested = item['total_invested'] or Decimal('0.00')
                
                results.append({
                    'sector': item['stock__sector'],
                    'holdings_count': item['holdings_count'],
                    'total_invested': str(total_invested),
                    'current_value': str(current_value),
                    'gain_loss': str(current_value - total_invested),
                    'avg_purchase_price': str(item['avg_purchase_price'] or Decimal('0.00'))
                })
            
            return create_success_response(_("Portfolio holdings by sector retrieved successfully."),
                                         data={'results': results, 'count': len(results)})
        except Exception as error:
            return create_error_response(_("Failed to retrieve portfolio holdings by sector."), errors=[str(error)])

    @action(detail=False, methods=['post'], url_path='bulk-add')
    def bulk_add(self, request):
        try:
            holdings_data = request.data.get('holdings', [])
            if not holdings_data:
                return create_error_response(_("No holdings data provided."), 
                                           errors=[_("Please provide an array of holdings to add")])
            if len(holdings_data) > 50:
                return create_error_response(_("Too many holdings."), 
                                           errors=[_("Maximum 50 holdings can be added at once")])
            
            # Optimize by checking existing stocks in a single query
            stock_ids = [h.get('stock') for h in holdings_data if h.get('stock')]
            existing_stocks = set(Portfolio.objects.filter(
                user=request.user, stock_id__in=stock_ids, is_active=True
            ).values_list('stock_id', flat=True))
            
            created_holdings, errors = [], []
            
            for i, holding_data in enumerate(holdings_data):
                stock_id = holding_data.get('stock')
                if stock_id and stock_id in existing_stocks:
                    errors.append(f"Holding {i+1}: Stock already in portfolio")
                    continue
                
                serializer = PortfolioCreateSerializer(data=holding_data, context={'request': request})
                if serializer.is_valid():
                    created_holdings.append(serializer.save())
                else:
                    errors.append(f"Holding {i+1}: {serializer.errors}")
            
            if created_holdings:
                return create_success_response(_("Bulk add completed."), data={
                    'created': PortfolioListSerializer(created_holdings, many=True).data,
                    'created_count': len(created_holdings),
                    'errors': errors,
                    'error_count': len(errors)
                })
            
            return create_error_response(_("Failed to add any holdings."), errors=errors)
        except Exception as error:
            return create_error_response(_("Failed to bulk add holdings."), errors=[str(error)])

    def _get_sorted_holdings(self, request, reverse=True):
        """Get sorted holdings by performance - optimized with database sorting"""
        try:
            limit = min(int(request.query_params.get('limit', 10)), 50)
            
            # Calculate performance at database level for sorting
            holdings = (self.get_queryset()
                       .annotate(
                           current_value=F('shares_owned') * F('stock__current_price'),
                           gain_loss_pct=Case(
                               When(total_invested__gt=0, 
                                   then=(F('shares_owned') * F('stock__current_price') - F('total_invested')) / F('total_invested') * 100),
                               default=Decimal('0.00'),
                               output_field=DecimalField()
                           )
                       )
                       .order_by('-gain_loss_pct' if reverse else 'gain_loss_pct')[:limit])
            
            if not holdings:
                return create_success_response(_("No holdings found."), data={'results': [], 'count': 0})
            
            serializer = PortfolioListSerializer(holdings, many=True)
            message = (_("Top performing holdings retrieved successfully.") if reverse 
                      else _("Worst performing holdings retrieved successfully."))
            
            return create_success_response(message, data={'results': serializer.data, 'count': len(serializer.data)})
        except ValueError:
            return create_error_response(_("Invalid limit parameter."), errors=[_("Limit must be a valid number")])

    @action(detail=False, methods=['get'], url_path='top-performers')
    def top_performers(self, request):
        try:
            return self._get_sorted_holdings(request, reverse=True)
        except Exception as error:
            return create_error_response(_("Failed to retrieve top performers."), errors=[str(error)])

    @action(detail=False, methods=['get'], url_path='worst-performers')
    def worst_performers(self, request):
        try:
            return self._get_sorted_holdings(request, reverse=False)
        except Exception as error:
            return create_error_response(_("Failed to retrieve worst performers."), errors=[str(error)])
    

    @action(detail=False, methods=['post'], url_path='add-by-symbol')
    def add_by_symbol(self, request):
        """
        Add/merge a holding by stock symbol. This path performs:
        Finnhub fetch -> Groq description -> Stock upsert -> Portfolio DCA merge -> Summary refresh
        """
        try:
            serializer = AddToPortfolioBySymbolSerializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            result = add_stock_to_portfolio_by_symbol(request.user, serializer.validated_data)
            return create_success_response(
                _("Stock added to portfolio successfully."),
                data=result,
                status_code=status.HTTP_201_CREATED
            )
        except Exception as e:
            return create_error_response(_("Failed to add stock to portfolio."), errors=[str(e)])


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
        ).select_related('stock')

    def get_serializer_class(self):
        serializer_map = {
            'list': WishlistListSerializer, 'by_priority': WishlistListSerializer, 
            'alerts_ready': WishlistListSerializer, 'create': WishlistCreateSerializer,
            'toggle_alerts': ToggleWishlistAlertsSerializer
        }
        return serializer_map.get(self.action, WishlistSerializer)

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            serializer = self.get_serializer(page if page is not None else queryset, many=True)
            count = queryset.count() if page is None else len(page)
            
            data = (self.get_paginated_response(serializer.data).data if page is not None 
                   else {'results': serializer.data, 'count': count})
            
            return create_success_response(_("Wishlist items retrieved successfully."), data=data)
        except Exception as error:
            return create_error_response(_("Failed to retrieve wishlist."), errors=[str(error)])

    def retrieve(self, request, *args, **kwargs):
        try:
            return create_success_response(_("Wishlist item retrieved successfully."), 
                                         data=WishlistSerializer(self.get_object()).data)
        except NotFound:
            return create_error_response(_("Wishlist item not found."), 
                                       errors=[_("Wishlist item does not exist")])
        except Exception as error:
            return create_error_response(_("Failed to retrieve wishlist item."), errors=[str(error)])

    def create(self, request, *args, **kwargs):
        try:
            stock_id = request.data.get('stock')
            if stock_id and Wishlist.objects.filter(user=request.user, stock_id=stock_id, is_active=True).exists():
                return create_error_response(_("This stock is already in your active wishlist."),
                                           errors=[_("Consider updating your wishlist item instead.")])
            
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                wishlist = serializer.save()
                return create_success_response(_("Wishlist item created successfully."),
                                             data=WishlistSerializer(wishlist).data, 
                                             status_code=status.HTTP_201_CREATED)
            
            return create_error_response(_("Failed to create wishlist item."), errors=serializer.errors)
        except Exception as error:
            return create_error_response(_("Failed to create wishlist item."), errors=[str(error)])

    def _perform_wishlist_update(self, request, partial=False):
        """Common update logic for wishlist items"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            if serializer.is_valid():
                wishlist = serializer.save()
                return create_success_response(_("Wishlist item updated successfully."), 
                                             data=WishlistSerializer(wishlist).data)
            return create_error_response(_("Failed to update wishlist item."), errors=serializer.errors)
        except NotFound:
            error_msg = (_("Wishlist item does not exist") if not partial 
                        else _("Wishlist item does not exist or you don't have permission to modify"))
            return create_error_response(_("Wishlist item not found."), errors=[error_msg])
        except Exception as error:
            return create_error_response(_("Failed to update wishlist item."), errors=[str(error)])

    def update(self, request, *args, **kwargs):
        return self._perform_wishlist_update(request, partial=False)

    def partial_update(self, request, *args, **kwargs):
        return self._perform_wishlist_update(request, partial=True)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.is_active = False
            instance.save(update_fields=['is_active', 'updated_at'])
            return create_success_response(_("Wishlist item removed successfully."), data={})
        except NotFound:
            return create_error_response(_("Wishlist item not found."), 
                                       errors=[_("Wishlist item does not exist")])
        except Exception as error:
            return create_error_response(_("Failed to remove wishlist item."), errors=[str(error)])

    @action(detail=False, methods=['get'], url_path='alerts-ready')
    def alerts_ready(self, request):
        try:
            queryset = self.get_queryset().filter(
                email_alerts_enabled=True, target_buy_price__gte=F('stock__current_price')
            )
            serializer = WishlistListSerializer(queryset, many=True)
            return create_success_response(_("Alert-ready wishlist items retrieved successfully."),
                                         data={'results': serializer.data, 'count': len(serializer.data)})
        except Exception as error:
            return create_error_response(_("Failed to fetch alert ready items."), errors=[str(error)])

    @action(detail=True, methods=['post'], url_path='toggle-alerts')
    def toggle_alerts(self, request, pk=None):
        try:
            wishlist_item = self.get_object()
            serializer = ToggleWishlistAlertsSerializer(data=request.data, 
                                                       context={'wishlist_item': wishlist_item})
            if serializer.is_valid():
                wishlist_item = serializer.save()
                return create_success_response(_("Wishlist email alerts status updated."),
                                             data=WishlistSerializer(wishlist_item).data)
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
            return create_success_response(_("Wishlist items sorted by priority."),
                                         data={'results': serializer.data, 'count': len(serializer.data)})
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
        ).select_related('wishlist_item__stock')

    def get_serializer_class(self):
        serializer_map = {
            'list': PriceAlertListSerializer, 'recent': PriceAlertListSerializer,
            'partial_update': UpdatePriceAlertStatusSerializer, 'update_status': UpdatePriceAlertStatusSerializer
        }
        return serializer_map.get(self.action, PriceAlertSerializer)

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            serializer = PriceAlertListSerializer(page if page is not None else queryset, many=True)
            
            data = (self.get_paginated_response(serializer.data).data if page is not None 
                   else {'results': serializer.data, 'count': len(serializer.data)})
            
            return create_success_response(_("Price alerts retrieved successfully."), data=data)
        except Exception as error:
            return create_error_response(_("Failed to retrieve price alerts."), errors=[str(error)])

    def retrieve(self, request, *args, **kwargs):
        try:
            return create_success_response(_("Price alert details retrieved."), 
                                         data=PriceAlertSerializer(self.get_object()).data)
        except NotFound:
            return create_error_response(_("Price alert not found."), errors=[_("Alert does not exist")])
        except Exception as error:
            return create_error_response(_("Failed to retrieve price alert."), errors=[str(error)])

    def partial_update(self, request, *args, **kwargs):
        try:
            alert = self.get_object()
            serializer = UpdatePriceAlertStatusSerializer(data=request.data, context={"alert": alert})
            
            if serializer.is_valid():
                alert = serializer.save()
                return create_success_response(_("Price alert status updated."),
                                             data=PriceAlertSerializer(alert).data)
            
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
            return create_success_response(_("Recent price alerts retrieved."),
                                         data={'results': serializer.data, 'count': len(serializer.data)})
        except Exception as error:
            return create_error_response(_("Failed to retrieve recent alerts."), errors=[str(error)])

    @action(detail=False, methods=['get'], url_path='unread')
    def unread(self, request):
        try:
            count = self.get_queryset().filter(status='TRIGGERED').count()
            return create_success_response(_("Unread alerts count."), data={'unread_count': count})
        except Exception as error:
            return create_error_response(_("Failed to retrieve unread alerts count."), errors=[str(error)])