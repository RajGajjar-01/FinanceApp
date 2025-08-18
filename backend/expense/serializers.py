import csv
import io
from decimal import Decimal
from django.db import transaction
from django.db.models import Sum, Q
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import (
    Account, AccountType, Budget, RecurringInterval, Transaction,
    TransactionStatus, TransactionType
)

class AccountSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    balance = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        min_value=Decimal("0.00"),
        required=False,
        default=Decimal("0.00")
    )

    class Meta:
        model = Account
        fields = (
            "id", "name", "type", "balance", "is_default",
            "created_at", "updated_at", "user"
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_name(self, value):
        if not value or not value.strip():
            raise ValidationError(_("Account name cannot be empty."))
        return value.strip().lower()

    def validate_type(self, value):
        if value not in [choice[0] for choice in AccountType.choices]:
            raise ValidationError(_("Invalid account type."))
        return value

    def validate_balance(self, value):
        if value is None:
            return Decimal("0.00")
        if value < Decimal("0.00"):
            raise ValidationError(_("Balance cannot be negative."))
        if value > Decimal("999999999999999.99"):
            raise ValidationError(_("Balance exceeds maximum allowed value."))
        return value

    def validate(self, attrs):
        user = self.context["request"].user
        is_creation = self.instance is None
        if not is_creation and "balance" in attrs:
            raise ValidationError({
                "balance": _("Balance cannot be modified directly. Use transactions instead.")
            })
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        user = validated_data["user"]
        is_default = validated_data.get("is_default", False)
        user_accounts_count = Account.objects.filter(user=user).count()
        if user_accounts_count >= 10:
            raise ValidationError(_("Maximum of 10 accounts allowed per user."))
        if not user_accounts_count:
            validated_data["is_default"] = True
        elif is_default:
            Account.objects.filter(user=user, is_default=True).update(is_default=False)
        return super().create(validated_data)

    @transaction.atomic
    def update(self, instance, validated_data):
        if "name" in validated_data:
            name = validated_data["name"]
            if Account.objects.filter(user=instance.user, name__iexact=name).exclude(pk=instance.pk).exists():
                raise ValidationError({"name": _("An account with this name already exists.")})
        is_default = validated_data.get("is_default", False)
        if is_default and not instance.is_default:
            Account.objects.filter(user=instance.user, is_default=True).update(is_default=False)
        elif "is_default" in validated_data and not is_default and instance.is_default:
            if not Account.objects.filter(user=instance.user).exclude(pk=instance.pk).exists():
                raise ValidationError({"is_default": _("Cannot unset default on the only account.")})
        return super().update(instance, validated_data)


class AccountListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ("id", "name", "type", "balance", "is_default", "created_at", "updated_at")
        read_only_fields = fields


class SetDefaultAccountSerializer(serializers.Serializer):
    @transaction.atomic
    def save(self):
        account = self.context["account"]
        user = account.user
        Account.objects.filter(user=user, is_default=True).update(is_default=False)
        account.is_default = True
        account.save(update_fields=["is_default", "updated_at"])
        return account


class TransactionSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    account_name = serializers.CharField(source='account.name', read_only=True)
    account_type = serializers.CharField(source='account.type', read_only=True)

    class Meta:
        model = Transaction
        fields = (
            "id", "type", "amount", "description", "date", "category",
            "receipt_url", "is_recurring", "recurring_interval",
            "next_recurring_date", "last_processed", "status", "account",
            "account_name", "account_type", "created_at", "updated_at", "user"
        )
        read_only_fields = ("id", "created_at", "updated_at", "last_processed", "account_name", "account_type")

    @staticmethod
    def setup_eager_loading(queryset):
        return queryset.select_related('user', 'account')

    def validate_account(self, value):
        if hasattr(value, 'user') and value.user != self.context["request"].user:
            raise ValidationError(_("Account does not belong to the current user."))
        return value

    def validate(self, attrs):
        is_recurring = attrs.get("is_recurring", False)
        recurring_interval = attrs.get("recurring_interval")
        if is_recurring and not recurring_interval:
            raise ValidationError({"recurring_interval": _("Recurring interval is required for recurring transactions.")})
        if not is_recurring and recurring_interval:
            raise ValidationError({"recurring_interval": _("Recurring interval should not be set for non-recurring transactions.")})
        if is_recurring and recurring_interval and not attrs.get("next_recurring_date"):
            current_date = attrs.get("date", timezone.now())
            interval_mapping = {
                RecurringInterval.DAILY: timezone.timedelta(days=1),
                RecurringInterval.WEEKLY: timezone.timedelta(weeks=1),
                RecurringInterval.MONTHLY: timezone.timedelta(days=30),
                RecurringInterval.YEARLY: timezone.timedelta(days=365),
            }
            if recurring_interval in interval_mapping:
                attrs["next_recurring_date"] = current_date + interval_mapping[recurring_interval]
        return attrs


class TransactionListSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    account_type = serializers.CharField(source='account.type', read_only=True)

    class Meta:
        model = Transaction
        fields = (
            "id", "type", "amount", "description", "date", "category",
            "receipt_url", "is_recurring", "recurring_interval",
            "next_recurring_date", "status", "account", "account_name",
            "account_type", "created_at", "updated_at"
        )
        read_only_fields = fields

    @staticmethod
    def setup_eager_loading(queryset):
        return queryset.select_related('account', 'user')


class TransactionCreateSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Transaction
        fields = (
            "type", "amount", "description", "date", "category",
            "receipt_url", "is_recurring", "recurring_interval",
            "account", "user"
        )

    def validate_account(self, value):
        if hasattr(value, 'user') and value.user != self.context["request"].user:
            raise ValidationError(_("Account does not belong to the current user."))
        return value

    def validate(self, attrs):
        is_recurring = attrs.get("is_recurring", False)
        recurring_interval = attrs.get("recurring_interval")
        if is_recurring and not recurring_interval:
            raise ValidationError({"recurring_interval": _("Recurring interval is required for recurring transactions.")})
        if not is_recurring and recurring_interval:
            raise ValidationError({"recurring_interval": _("Recurring interval should not be set for non-recurring transactions.")})
        if not attrs.get("date"):
            attrs["date"] = timezone.now()
        if is_recurring and recurring_interval:
            current_date = attrs.get("date", timezone.now())
            interval_mapping = {
                RecurringInterval.DAILY: timezone.timedelta(days=1),
                RecurringInterval.WEEKLY: timezone.timedelta(weeks=1),
                RecurringInterval.MONTHLY: timezone.timedelta(days=30),
                RecurringInterval.YEARLY: timezone.timedelta(days=365),
            }
            if recurring_interval in interval_mapping:
                attrs["next_recurring_date"] = current_date + interval_mapping[recurring_interval]
        return attrs


class BulkTransactionCreateSerializer(serializers.Serializer):
    csv_file = serializers.FileField()

    def validate_csv_file(self, value):
        if not hasattr(value, 'name') or not value.name.endswith('.csv'):
            raise ValidationError(_("File must be a CSV file."))
        if hasattr(value, 'size') and value.size > 5 * 1024 * 1024:
            raise ValidationError(_("File size cannot exceed 5MB."))
        return value

    @transaction.atomic
    def create(self, validated_data):
        csv_file = validated_data['csv_file']
        user = self.context['request'].user
        try:
            user_accounts = {str(account.id): account for account in Account.objects.filter(user=user).select_related('user')}
        except Exception:
            user_accounts = {}
        try:
            content = csv_file.read().decode('utf-8')
            csv_rows = csv.DictReader(io.StringIO(content))
        except Exception as error:
            return {'created_transactions': [], 'success_count': 0, 'errors': [{'error': f'Failed to read CSV: {error}'}], 'total_rows': 0}

        required_fields = ['type', 'amount', 'category', 'date', 'account_id']
        transactions_to_create, errors = [], []
        for row_index, row in enumerate(csv_rows, start=1):
            missing_fields = [field for field in required_fields if not row.get(field)]
            if missing_fields:
                errors.append({'row': row_index, 'error': f"Missing: {', '.join(missing_fields)}"})
                continue
            account = user_accounts.get(row['account_id'])
            if not account:
                errors.append({'row': row_index, 'error': 'Invalid account'})
                continue
            try:
                transaction_type = row['type'].upper()
                amount = Decimal(str(row['amount']))
            except Exception as error:
                errors.append({'row': row_index, 'error': f'Data error: {error}'})
                continue
            description = row.get('description', '').strip()[:500] or None
            is_recurring = row.get('is_recurring', '').lower() == 'true'
            recurring_interval = row.get('recurring_interval') or None
            transaction_data = {
                'user': user, 'account': account, 'type': transaction_type,
                'amount': amount, 'category': row['category'].strip(),
                'description': description, 'date': row['date'],
                'status': TransactionStatus.COMPLETED,
                'is_recurring': is_recurring, 'recurring_interval': recurring_interval,
                'receipt_url': row.get('receipt_url') or None,
            }
            transactions_to_create.append(Transaction(**transaction_data))

        created_transactions = []
        if transactions_to_create:
            try:
                created_transactions = Transaction.objects.bulk_create(transactions_to_create, batch_size=1000)
            except Exception:
                for transaction_obj in transactions_to_create:
                    try:
                        transaction_obj.save()
                        created_transactions.append(transaction_obj)
                    except Exception as error:
                        errors.append({'error': f'Save failed: {error}'})

        return {
            'created_transactions': created_transactions,
            'success_count': len(created_transactions),
            'errors': errors,
            'total_rows': len(created_transactions) + len(errors)
        }


class UpdateTransactionStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=TransactionStatus.choices)

    @transaction.atomic
    def save(self):
        transaction_obj = self.context.get("transaction")
        if not transaction_obj:
            raise ValidationError(_("Transaction not in context."))
        new_status = self.validated_data.get("status", None)
        if transaction_obj.status != new_status:
            transaction_obj.status = new_status
            transaction_obj.save(update_fields=["status", "updated_at"])
        return transaction_obj

class BudgetSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    current_month_expenses = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    budget_utilization_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = Budget
        fields = (
            "id", "amount", "current_month_expenses", "budget_utilization_percentage", 
            "last_alert_sent", "created_at", "updated_at", "user"
        )
        read_only_fields = ("id", "created_at", "updated_at", "last_alert_sent")

    def validate_amount(self, value):
        if value is None:
            raise ValidationError(_("Budget amount cannot be empty."))
        if value <= Decimal("0.00"):
            raise ValidationError(_("Budget amount must be greater than zero."))
        if value > Decimal("999999999999999.99"):
            raise ValidationError(_("Budget amount exceeds maximum allowed value."))
        return value

    def validate(self, attrs):
        user = self.context["request"].user
        is_creation = self.instance is None
        if is_creation and Budget.objects.filter(user=user).exists():
            raise ValidationError({"user": _("User can only have one budget. Update existing budget instead.")})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        user = validated_data["user"]
        if Budget.objects.filter(user=user).exists():
            raise ValidationError(_("User already has a budget."))
        return super().create(validated_data)

    @transaction.atomic  
    def update(self, instance, validated_data):
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['current_month_expenses'] = instance.current_month_expenses
        data['budget_utilization_percentage'] = instance.budget_utilization_percentage
        return data


class BudgetListSerializer(serializers.ModelSerializer):
    current_month_expenses = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    budget_utilization_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = Budget
        fields = (
            "id", "amount", "current_month_expenses", "budget_utilization_percentage",
            "last_alert_sent", "created_at", "updated_at"
        )
        read_only_fields = fields

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['current_month_expenses'] = instance.current_month_expenses
        data['budget_utilization_percentage'] = instance.budget_utilization_percentage
        return data


class BudgetUtilizationSerializer(serializers.Serializer):
    budget_amount = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    current_month_expenses = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    budget_utilization_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    remaining_budget = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    days_left_in_month = serializers.IntegerField(read_only=True)
    average_daily_spending = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    projected_monthly_spending = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    is_over_budget = serializers.BooleanField(read_only=True)
    alert_threshold_reached = serializers.BooleanField(read_only=True)
    category_breakdown = serializers.ListField(read_only=True)
    spending_trend = serializers.CharField(read_only=True)
