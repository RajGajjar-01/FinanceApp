from decimal import Decimal
from django.db import transaction
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Account, AccountType


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
            "id",
            "name", 
            "type",
            "balance",
            "is_default",
            "created_at",
            "updated_at",
            "user",
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
            if Account.objects.filter(
                user=instance.user, 
                name__iexact=name
            ).exclude(pk=instance.pk).exists():
                raise ValidationError({
                    "name": _("An account with this name already exists.")
                })

        is_default = validated_data.get("is_default", False)
        
        if is_default and not instance.is_default:
            Account.objects.filter(
                user=instance.user, 
                is_default=True
            ).update(is_default=False)
        elif "is_default" in validated_data and not is_default and instance.is_default:
            if not Account.objects.filter(user=instance.user).exclude(pk=instance.pk).exists():
                raise ValidationError({
                    "is_default": _("Cannot unset default on the only account.")
                })

        return super().update(instance, validated_data)


class AccountListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = (
            "id",
            "name",
            "type", 
            "balance",
            "is_default",
            "created_at",
            "updated_at"
        )
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
