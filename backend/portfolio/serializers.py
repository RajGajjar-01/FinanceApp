from decimal import Decimal
from django.db import transaction
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model
from .models import (
    Stock, Portfolio, Wishlist, PriceAlert, PortfolioSummary,
    SectorChoices, AlertType, AlertStatus
)

User = get_user_model()


class StockSerializer(serializers.ModelSerializer):
    day_change = serializers.DecimalField(max_digits=15, decimal_places=4, read_only=True)
    day_change_percentage = serializers.DecimalField(max_digits=8, decimal_places=4, read_only=True)

    class Meta:
        model = Stock
        fields = (
            "id", "symbol", "name", "exchange", "sector", "current_price",
            "previous_close", "market_cap", "website_url", "description",
            "price_last_updated", "is_active", "day_change", "day_change_percentage",
            "created_at", "updated_at"
        )
        read_only_fields = ("id", "created_at", "updated_at", "price_last_updated")

    def validate_symbol(self, value):
        if not value or not value.strip():
            raise ValidationError(_("Stock symbol cannot be empty."))
        return value.strip().upper()

    def validate_name(self, value):
        if not value or not value.strip():
            raise ValidationError(_("Stock name cannot be empty."))
        return value.strip()

    def validate_exchange(self, value):
        if not value or not value.strip():
            raise ValidationError(_("Exchange cannot be empty."))
        return value.strip().upper()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['day_change'] = instance.day_change
        data['day_change_percentage'] = instance.day_change_percentage
        return data


class StockListSerializer(serializers.ModelSerializer):
    day_change = serializers.DecimalField(max_digits=15, decimal_places=4, read_only=True)
    day_change_percentage = serializers.DecimalField(max_digits=8, decimal_places=4, read_only=True)

    class Meta:
        model = Stock
        fields = (
            "id", "symbol", "name", "exchange", "sector", "current_price",
            "previous_close", "market_cap", "is_active", "day_change",
            "day_change_percentage", "price_last_updated"
        )
        read_only_fields = fields

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['day_change'] = instance.day_change
        data['day_change_percentage'] = instance.day_change_percentage
        return data


class PortfolioSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    stock_symbol = serializers.CharField(source='stock.symbol', read_only=True)
    stock_name = serializers.CharField(source='stock.name', read_only=True)
    current_value = serializers.DecimalField(max_digits=20, decimal_places=2, read_only=True)
    unrealized_gain_loss = serializers.DecimalField(max_digits=20, decimal_places=2, read_only=True)
    unrealized_gain_loss_percentage = serializers.DecimalField(max_digits=8, decimal_places=4, read_only=True)
    day_change_value = serializers.DecimalField(max_digits=20, decimal_places=2, read_only=True)
    sector = serializers.CharField(read_only=True)

    class Meta:
        model = Portfolio
        fields = (
            "id", "stock", "stock_symbol", "stock_name", "shares_owned",
            "purchase_price", "purchase_date", "total_invested",
            "target_allocation_percentage", "notes", "investment_thesis",
            "is_active", "current_value", "unrealized_gain_loss",
            "unrealized_gain_loss_percentage", "day_change_value", "sector",
            "created_at", "updated_at", "user"
        )
        read_only_fields = ("id", "created_at", "updated_at", "total_invested")

    @staticmethod
    def setup_eager_loading(queryset):
        return queryset.select_related('user', 'stock')

    def validate_stock(self, value):
        if not value.is_active:
            raise ValidationError(_("Cannot add inactive stock to portfolio."))
        return value

    def validate_shares_owned(self, value):
        if value <= Decimal('0.0000'):
            raise ValidationError(_("Shares owned must be greater than zero."))
        return value

    def validate_purchase_price(self, value):
        if value <= Decimal('0.0000'):
            raise ValidationError(_("Purchase price must be greater than zero."))
        return value

    def validate_purchase_date(self, value):
        if value > timezone.now().date():
            raise ValidationError(_("Purchase date cannot be in the future."))
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.update({
            'current_value': instance.current_value,
            'unrealized_gain_loss': instance.unrealized_gain_loss,
            'unrealized_gain_loss_percentage': instance.unrealized_gain_loss_percentage,
            'day_change_value': instance.day_change_value,
            'sector': instance.sector
        })
        return data


class PortfolioListSerializer(serializers.ModelSerializer):
    stock_symbol = serializers.CharField(source='stock.symbol', read_only=True)
    stock_name = serializers.CharField(source='stock.name', read_only=True)
    current_value = serializers.DecimalField(max_digits=20, decimal_places=2, read_only=True)
    unrealized_gain_loss = serializers.DecimalField(max_digits=20, decimal_places=2, read_only=True)
    unrealized_gain_loss_percentage = serializers.DecimalField(max_digits=8, decimal_places=4, read_only=True)
    day_change_value = serializers.DecimalField(max_digits=20, decimal_places=2, read_only=True)
    sector = serializers.CharField(read_only=True)

    class Meta:
        model = Portfolio
        fields = (
            "id", "stock", "stock_symbol", "stock_name", "shares_owned",
            "purchase_price", "purchase_date", "total_invested",
            "current_value", "unrealized_gain_loss", "unrealized_gain_loss_percentage",
            "day_change_value", "sector", "is_active", "created_at", "updated_at"
        )
        read_only_fields = fields

    @staticmethod
    def setup_eager_loading(queryset):
        return queryset.select_related('stock', 'user')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.update({
            'current_value': instance.current_value,
            'unrealized_gain_loss': instance.unrealized_gain_loss,
            'unrealized_gain_loss_percentage': instance.unrealized_gain_loss_percentage,
            'day_change_value': instance.day_change_value,
            'sector': instance.sector
        })
        return data


class PortfolioCreateSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Portfolio
        fields = (
            "stock", "shares_owned", "purchase_price", "purchase_date",
            "target_allocation_percentage", "notes", "investment_thesis", "user"
        )

    def validate_stock(self, value):
        if not value.is_active:
            raise ValidationError(_("Cannot add inactive stock to portfolio."))
        return value

    def validate_shares_owned(self, value):
        if value <= Decimal('0.0000'):
            raise ValidationError(_("Shares owned must be greater than zero."))
        return value

    def validate_purchase_price(self, value):
        if value <= Decimal('0.0000'):
            raise ValidationError(_("Purchase price must be greater than zero."))
        return value

    def validate_purchase_date(self, value):
        if value > timezone.now().date():
            raise ValidationError(_("Purchase date cannot be in the future."))
        return value


class WishlistSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    stock_symbol = serializers.CharField(source='stock.symbol', read_only=True)
    stock_name = serializers.CharField(source='stock.name', read_only=True)
    stock_current_price = serializers.DecimalField(source='stock.current_price', max_digits=15, decimal_places=4, read_only=True)
    price_change_since_added = serializers.DecimalField(max_digits=15, decimal_places=4, read_only=True)
    price_change_percentage_since_added = serializers.DecimalField(max_digits=8, decimal_places=4, read_only=True)
    distance_to_target = serializers.DecimalField(max_digits=15, decimal_places=4, read_only=True)
    distance_to_target_percentage = serializers.DecimalField(max_digits=8, decimal_places=4, read_only=True)
    should_trigger_alert = serializers.BooleanField(read_only=True)

    class Meta:
        model = Wishlist
        fields = (
            "id", "stock", "stock_symbol", "stock_name", "stock_current_price",
            "target_buy_price", "price_when_added", "planned_investment_amount",
            "email_alerts_enabled", "priority", "notes", "watch_reason",
            "is_active", "price_change_since_added", "price_change_percentage_since_added",
            "distance_to_target", "distance_to_target_percentage", "should_trigger_alert",
            "created_at", "updated_at", "user"
        )
        read_only_fields = ("id", "created_at", "updated_at", "price_when_added")

    @staticmethod
    def setup_eager_loading(queryset):
        return queryset.select_related('user', 'stock')

    def validate_stock(self, value):
        if not value.is_active:
            raise ValidationError(_("Cannot add inactive stock to wishlist."))
        return value

    def validate_target_buy_price(self, value):
        if value <= Decimal('0.0000'):
            raise ValidationError(_("Target buy price must be greater than zero."))
        return value

    def validate_planned_investment_amount(self, value):
        if value is not None and value <= Decimal('0.00'):
            raise ValidationError(_("Planned investment amount must be greater than zero."))
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.update({
            'price_change_since_added': instance.price_change_since_added,
            'price_change_percentage_since_added': instance.price_change_percentage_since_added,
            'distance_to_target': instance.distance_to_target,
            'distance_to_target_percentage': instance.distance_to_target_percentage,
            'should_trigger_alert': instance.should_trigger_alert()
        })
        return data


class WishlistListSerializer(serializers.ModelSerializer):
    stock_symbol = serializers.CharField(source='stock.symbol', read_only=True)
    stock_name = serializers.CharField(source='stock.name', read_only=True)
    stock_current_price = serializers.DecimalField(source='stock.current_price', max_digits=15, decimal_places=4, read_only=True)
    distance_to_target = serializers.DecimalField(max_digits=15, decimal_places=4, read_only=True)
    distance_to_target_percentage = serializers.DecimalField(max_digits=8, decimal_places=4, read_only=True)
    should_trigger_alert = serializers.BooleanField(read_only=True)

    class Meta:
        model = Wishlist
        fields = (
            "id", "stock", "stock_symbol", "stock_name", "stock_current_price",
            "target_buy_price", "planned_investment_amount", "email_alerts_enabled",
            "priority", "watch_reason", "is_active", "distance_to_target",
            "distance_to_target_percentage", "should_trigger_alert",
            "created_at", "updated_at"
        )
        read_only_fields = fields

    @staticmethod
    def setup_eager_loading(queryset):
        return queryset.select_related('stock', 'user')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.update({
            'distance_to_target': instance.distance_to_target,
            'distance_to_target_percentage': instance.distance_to_target_percentage,
            'should_trigger_alert': instance.should_trigger_alert()
        })
        return data


class WishlistCreateSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Wishlist
        fields = (
            "stock", "target_buy_price", "planned_investment_amount",
            "email_alerts_enabled", "priority", "notes", "watch_reason", "user"
        )

    def validate_stock(self, value):
        if not value.is_active:
            raise ValidationError(_("Cannot add inactive stock to wishlist."))
        return value

    def validate_target_buy_price(self, value):
        if value <= Decimal('0.0000'):
            raise ValidationError(_("Target buy price must be greater than zero."))
        return value


class ToggleWishlistAlertsSerializer(serializers.Serializer):
    email_alerts_enabled = serializers.BooleanField()

    @transaction.atomic
    def save(self):
        wishlist_item = self.context.get("wishlist_item")
        if not wishlist_item:
            raise ValidationError(_("Wishlist item not in context."))
        
        new_status = self.validated_data.get("email_alerts_enabled")
        if wishlist_item.email_alerts_enabled != new_status:
            wishlist_item.email_alerts_enabled = new_status
            wishlist_item.save(update_fields=["email_alerts_enabled", "updated_at"])
        
        return wishlist_item


class PriceAlertSerializer(serializers.ModelSerializer):
    wishlist_stock_symbol = serializers.CharField(source='wishlist_item.stock.symbol', read_only=True)
    wishlist_stock_name = serializers.CharField(source='wishlist_item.stock.name', read_only=True)
    user_email = serializers.CharField(source='wishlist_item.user.email', read_only=True)

    class Meta:
        model = PriceAlert
        fields = (
            "id", "wishlist_item", "wishlist_stock_symbol", "wishlist_stock_name",
            "alert_type", "target_price", "actual_price", "status",
            "email_sent", "email_sent_at", "user_email", "created_at", "updated_at"
        )
        read_only_fields = ("id", "created_at", "updated_at")

    @staticmethod
    def setup_eager_loading(queryset):
        return queryset.select_related('wishlist_item__stock', 'wishlist_item__user')


class PriceAlertListSerializer(serializers.ModelSerializer):
    wishlist_stock_symbol = serializers.CharField(source='wishlist_item.stock.symbol', read_only=True)
    wishlist_stock_name = serializers.CharField(source='wishlist_item.stock.name', read_only=True)

    class Meta:
        model = PriceAlert
        fields = (
            "id", "wishlist_stock_symbol", "wishlist_stock_name",
            "alert_type", "target_price", "actual_price", "status",
            "email_sent", "email_sent_at", "created_at"
        )
        read_only_fields = fields

    @staticmethod
    def setup_eager_loading(queryset):
        return queryset.select_related('wishlist_item__stock')


class UpdatePriceAlertStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=AlertStatus.choices)

    @transaction.atomic
    def save(self):
        alert = self.context.get("alert")
        if not alert:
            raise ValidationError(_("Price alert not in context."))
        
        new_status = self.validated_data.get("status")
        if alert.status != new_status:
            alert.status = new_status
            alert.save(update_fields=["status", "updated_at"])
        
        return alert


class PortfolioSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioSummary
        fields = (
            "id", "total_invested", "current_portfolio_value", "total_gain_loss",
            "total_gain_loss_percentage", "day_change_value", "day_change_percentage",
            "number_of_holdings", "largest_holding_percentage", "sector_allocation",
            "last_calculated", "created_at", "updated_at"
        )
        read_only_fields = fields


class PortfolioSummaryDetailSerializer(serializers.Serializer):
    portfolio_summary = PortfolioSummarySerializer(read_only=True)
    top_performers = serializers.ListField(read_only=True)
    worst_performers = serializers.ListField(read_only=True)
    sector_breakdown = serializers.DictField(read_only=True)
    recent_activities = serializers.ListField(read_only=True)
    risk_metrics = serializers.DictField(read_only=True)
    recommendations = serializers.ListField(read_only=True)


class RefreshPortfolioSummarySerializer(serializers.Serializer):
    @transaction.atomic
    def save(self):
        user = self.context.get("user")
        if not user:
            raise ValidationError(_("User not in context."))
        
        summary = PortfolioSummary.refresh_for_user(user)
        return summary
