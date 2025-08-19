from django.db import models, transaction
from decimal import Decimal
import uuid
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth import get_user_model

User = get_user_model()

class SectorChoices(models.TextChoices):
    TECHNOLOGY = 'TECH', 'Technology'
    FINANCIALS = 'FIN', 'Financials'
    HEALTHCARE = 'HC', 'Healthcare'
    INDUSTRIALS = 'IND', 'Industrials'
    CONSUMER = 'CONS', 'Consumer'
    ENERGY = 'EN', 'Energy'
    OTHER = 'OTHER', 'Other'

class AlertType(models.TextChoices):
    PRICE_ABOVE = 'PRICE_ABOVE', 'Price Above Target'
    PRICE_BELOW = 'PRICE_BELOW', 'Price Below Target'

class AlertStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Active'
    TRIGGERED = 'TRIGGERED', 'Triggered'
    DISABLED = 'DISABLED', 'Disabled'

class TimeStampedModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True

class Stock(TimeStampedModel):
    symbol = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=200, db_index=True)
    exchange = models.CharField(max_length=50, db_index=True)
    sector = models.CharField(max_length=50, choices=SectorChoices.choices, default=SectorChoices.OTHER, db_index=True)
    current_price = models.DecimalField(max_digits=15, decimal_places=4, default=Decimal('0.0000'), validators=[MinValueValidator(Decimal('0.0000'))])
    previous_close = models.DecimalField(max_digits=15, decimal_places=4, default=Decimal('0.0000'), validators=[MinValueValidator(Decimal('0.0000'))])
    market_cap = models.BigIntegerField(blank=True, null=True, validators=[MinValueValidator(0)])
    website_url = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    price_last_updated = models.DateTimeField(auto_now=True, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    
    class Meta:
        db_table = 'portfolio_stocks'
        indexes = [
            models.Index(fields=['symbol', 'exchange']),
            models.Index(fields=['sector', 'is_active']),
            models.Index(fields=['price_last_updated']),
            models.Index(fields=['is_active', 'updated_at']),
        ]
    
    def __str__(self):
        return f"{self.symbol} - {self.name}"
    
    @property
    def day_change(self):
        return self.current_price - self.previous_close if self.previous_close else Decimal('0.00')
    
    @property
    def day_change_percentage(self):
        if self.previous_close > 0:
            return (self.day_change / self.previous_close) * 100
        return Decimal('0.00')

class Portfolio(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='portfolio_holdings', db_index=True)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='portfolio_holders', db_index=True)
    shares_owned = models.DecimalField(max_digits=15, decimal_places=4, validators=[MinValueValidator(Decimal('0.0001'))])
    purchase_price = models.DecimalField(max_digits=15, decimal_places=4, validators=[MinValueValidator(Decimal('0.0001'))])
    purchase_date = models.DateField(db_index=True)
    total_invested = models.DecimalField(max_digits=20, decimal_places=2, default=Decimal('0.00'))
    target_allocation_percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(Decimal('0.00')), MaxValueValidator(Decimal('100.00'))])
    notes = models.TextField(blank=True, null=True)
    investment_thesis = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True, db_index=True)
    
    class Meta:
        db_table = 'portfolio_holdings'
        constraints = [
            models.UniqueConstraint(fields=['user', 'stock'], name='unique_user_stock_holding')
        ]
        indexes = [
            models.Index(fields=['user', 'stock']),
            models.Index(fields=['user', 'purchase_date']),
            models.Index(fields=['stock', 'purchase_date']),
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['is_active', 'updated_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.stock.symbol}"
    
    def save(self, *args, **kwargs):
        self.total_invested = self.shares_owned * self.purchase_price
        super().save(*args, **kwargs)
    
    @property
    def current_value(self):
        return self.shares_owned * self.stock.current_price
    
    @property
    def unrealized_gain_loss(self):
        return self.current_value - self.total_invested
    
    @property
    def unrealized_gain_loss_percentage(self):
        if self.total_invested > 0:
            return (self.unrealized_gain_loss / self.total_invested) * 100
        return Decimal('0.00')
    
    @property
    def day_change_value(self):
        return self.shares_owned * self.stock.day_change
    
    @property
    def sector(self):
        return self.stock.sector

class Wishlist(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist_items', db_index=True)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='wishlist_watchers', db_index=True)
    target_buy_price = models.DecimalField(max_digits=15, decimal_places=4, validators=[MinValueValidator(Decimal('0.0001'))])
    price_when_added = models.DecimalField(max_digits=15, decimal_places=4, null=True, blank=True)
    planned_investment_amount = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(Decimal('0.01'))])
    email_alerts_enabled = models.BooleanField(default=True)
    priority = models.IntegerField(default=5, validators=[MinValueValidator(1), MaxValueValidator(10)])
    notes = models.TextField(blank=True, null=True)
    watch_reason = models.CharField(max_length=200, blank=True, null=True)
    is_active = models.BooleanField(default=True, db_index=True)
    
    class Meta:
        db_table = 'portfolio_wishlist'
        constraints = [
            models.UniqueConstraint(fields=['user', 'stock'], condition=models.Q(is_active=True), name='unique_active_user_stock_wishlist')
        ]
        indexes = [
            models.Index(fields=['user', 'stock']),
            models.Index(fields=['user', 'priority']),
            models.Index(fields=['email_alerts_enabled', 'target_buy_price']),
            models.Index(fields=['user', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.user.username} watching {self.stock.symbol}"
    
    def save(self, *args, **kwargs):
        if self.price_when_added is None:
            self.price_when_added = self.stock.current_price
        super().save(*args, **kwargs)
    
    @property
    def price_change_since_added(self):
        if self.price_when_added:
            return self.stock.current_price - self.price_when_added
        return Decimal('0.00')
    
    @property
    def price_change_percentage_since_added(self):
        if self.price_when_added and self.price_when_added > 0:
            return (self.price_change_since_added / self.price_when_added) * 100
        return Decimal('0.00')
    
    @property
    def distance_to_target(self):
        return self.target_buy_price - self.stock.current_price
    
    @property
    def distance_to_target_percentage(self):
        if self.stock.current_price > 0:
            return (self.distance_to_target / self.stock.current_price) * 100
        return Decimal('0.00')
    
    def should_trigger_alert(self):
        if not self.email_alerts_enabled or not self.is_active:
            return False
        return self.stock.current_price <= self.target_buy_price

class PriceAlert(TimeStampedModel):
    wishlist_item = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='alert_history', db_index=True)
    alert_type = models.CharField(max_length=20, choices=AlertType.choices, default=AlertType.PRICE_BELOW)
    target_price = models.DecimalField(max_digits=15, decimal_places=4)
    actual_price = models.DecimalField(max_digits=15, decimal_places=4)
    status = models.CharField(max_length=10, choices=AlertStatus.choices, default=AlertStatus.TRIGGERED)
    email_sent = models.BooleanField(default=False)
    email_sent_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'portfolio_price_alerts'
        indexes = [
            models.Index(fields=['wishlist_item', 'created_at']),
            models.Index(fields=['status', 'email_sent']),
            models.Index(fields=['created_at', 'status']),
        ]
    
    def __str__(self):
        return f"Alert for {self.wishlist_item.stock.symbol} at ${self.actual_price}"

class PortfolioSummary(TimeStampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='portfolio_summary')
    total_invested = models.DecimalField(max_digits=20, decimal_places=2, default=Decimal('0.00'))
    current_portfolio_value = models.DecimalField(max_digits=20, decimal_places=2, default=Decimal('0.00'))
    total_gain_loss = models.DecimalField(max_digits=20, decimal_places=2, default=Decimal('0.00'))
    total_gain_loss_percentage = models.DecimalField(max_digits=8, decimal_places=4, default=Decimal('0.0000'))
    day_change_value = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    day_change_percentage = models.DecimalField(max_digits=8, decimal_places=4, default=Decimal('0.0000'))
    number_of_holdings = models.IntegerField(default=0)
    largest_holding_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    sector_allocation = models.JSONField(default=dict)
    last_calculated = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'portfolio_summary'
        indexes = [
            models.Index(fields=['last_calculated']),
        ]
    
    def __str__(self):
        return f"{self.user.username} Portfolio Summary - ${self.current_portfolio_value}"
    
    @classmethod
    @transaction.atomic
    def refresh_for_user(cls, user):
        holdings = Portfolio.objects.filter(user=user, is_active=True).select_related('stock')
        
        if not holdings.exists():
            summary, created = cls.objects.get_or_create(user=user)
            return summary
        
        total_invested = sum(h.total_invested for h in holdings)
        current_value = sum(h.current_value for h in holdings)
        day_change = sum(h.day_change_value for h in holdings)
        
        total_gain_loss = current_value - total_invested
        total_gain_loss_percentage = (total_gain_loss / total_invested * 100) if total_invested > 0 else Decimal('0.0000')
        
        previous_value = current_value - day_change
        day_change_percentage = (day_change / previous_value * 100) if previous_value > 0 else Decimal('0.0000')
        
        sector_allocation = {}
        for holding in holdings:
            sector = holding.stock.sector
            sector_value = float(holding.current_value)
            sector_allocation[sector] = sector_allocation.get(sector, 0) + sector_value
        
        for sector in sector_allocation:
            if current_value > 0:
                sector_allocation[sector] = round((sector_allocation[sector] / float(current_value)) * 100, 2)
            else:
                sector_allocation[sector] = 0
        
        largest_holding = Decimal('0.00')
        if current_value > 0 and holdings:
            largest_holding = max(holding.current_value / current_value * 100 for holding in holdings)
        
        summary, created = cls.objects.update_or_create(
            user=user,
            defaults={
                'total_invested': total_invested,
                'current_portfolio_value': current_value,
                'total_gain_loss': total_gain_loss,
                'total_gain_loss_percentage': total_gain_loss_percentage,
                'day_change_value': day_change,
                'day_change_percentage': day_change_percentage,
                'number_of_holdings': holdings.count(),
                'largest_holding_percentage': largest_holding,
                'sector_allocation': sector_allocation,
            }
        )
        
        return summary
