from decimal import Decimal

from django.db import transaction
from django.utils.translation import gettext_lazy as _

from rest_framework import permissions, viewsets, filters
from rest_framework.decorators import action
from rest_framework.exceptions import (
    ValidationError,
    NotFound
)

from backend.utils import create_success_response, create_error_response
from .models import Account
from .serializers import (
    AccountSerializer,
    AccountListSerializer,
    SetDefaultAccountSerializer,
)


class AccountViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"
    
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['type', 'is_default']
    ordering_fields = ['name', 'balance', 'created_at']
    ordering = ['name']
    search_fields = ['name']
    
    def get_queryset(self):
        return Account.objects.filter(user=self.request.user).select_related('user')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AccountListSerializer
        if self.action == 'set_default':
            return SetDefaultAccountSerializer
        return AccountSerializer
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            
            if not queryset.exists():
                return create_success_response(
                    _("No accounts found. Create your first account to get started."),
                    data={
                        'results': [],
                        'count': 0,
                        'next': None,
                        'previous': None
                    }
                )
            
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                paginated_response = self.get_paginated_response(serializer.data)
                return create_success_response(
                    _("Accounts retrieved successfully."),
                    data=paginated_response.data
                )
            
            serializer = self.get_serializer(queryset, many=True)
            return create_success_response(
                _("Accounts retrieved successfully."),
                data={
                    'results': serializer.data,
                    'count': len(serializer.data)
                }
            )
            
        except Exception:
            return create_error_response(
                _("Failed to retrieve accounts."),
                errors=[_("An error occurred. Please try again.")]
            )
    
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return create_success_response(
                _("Account retrieved successfully."),
                data=serializer.data
            )
        except NotFound:
            return create_error_response(
                _("Account not found."),
                errors=[_("Account does not exist")]
            )
        except Exception:
            return create_error_response(
                _("Failed to retrieve account."),
                errors=[_("An error occurred. Please try again.")]
            )
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            user_accounts_count = Account.objects.filter(user=request.user).count()
            if user_accounts_count >= 10:
                return create_error_response(
                    _("Maximum of 10 accounts allowed per user."),
                    errors=[_("Account limit exceeded")]
                )
            
            account_name = request.data.get('name', '').strip().lower()
            if account_name and Account.objects.filter(user=request.user, name=account_name).exists():
                return create_error_response(
                    _("Account name already exists."),
                    errors=[_("An account with this name already exists for your account.")]
                )
            
            data = request.data.copy()
            if 'name' in data:
                data['name'] = account_name
            
            serializer = self.get_serializer(data=data)
            if not serializer.is_valid():
                return create_error_response(
                    _("Invalid account data provided."),
                    errors=serializer.errors
                )
            
            instance = serializer.save()
            response_data = AccountSerializer(instance, context={'request': request}).data
            
            return create_success_response(
                _("Account created successfully."),
                data=response_data
            )
            
        except ValidationError as e:
            return create_error_response(
                _("Account creation failed."),
                errors=str(e)
            )
        except Exception:
            return create_error_response(
                _("Account creation failed."),
                errors=[_("An error occurred. Please try again.")]
            )
    
    @transaction.atomic
    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            partial = kwargs.pop('partial', False)
            
            data = request.data.copy()
            if 'name' in request.data:
                new_name = request.data.get('name', '').strip().lower()
                data['name'] = new_name
                
                if new_name and Account.objects.filter(
                    user=request.user, 
                    name=new_name
                ).exclude(id=instance.id).exists():
                    return create_error_response(
                        _("Account name already exists."),
                        errors=[_("An account with this name already exists for your account.")]
                    )
            
            serializer = self.get_serializer(instance, data=data, partial=partial)
            if not serializer.is_valid():
                return create_error_response(
                    _("Invalid data provided."),
                    errors=serializer.errors
                )
            
            updated_instance = serializer.save()
            response_data = AccountSerializer(updated_instance, context={'request': request}).data
            
            return create_success_response(
                _("Account updated successfully."),
                data=response_data
            )
            
        except NotFound:
            return create_error_response(
                _("Account not found."),
                errors=[_("Account does not exist")]
            )
        except ValidationError as e:
            return create_error_response(
                _("Account update failed."),
                errors=str(e)
            )
        except Exception:
            return create_error_response(
                _("Account update failed."),
                errors=[_("An error occurred. Please try again.")]
            )
    
    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            
            user_accounts_count = Account.objects.filter(user=request.user).count()
            if user_accounts_count == 1:
                return create_error_response(
                    _("You must have at least one account."),
                    errors=[_("Cannot delete your only account.")]
                )
            
            if instance.transactions.exists():
                return create_error_response(
                    _("Account has transaction history."),
                    errors=[_("Cannot delete account with existing transactions.")]
                )
            
            account_name = instance.name
            account_id = str(instance.id)
            
            if instance.is_default:
                new_default = Account.objects.filter(user=request.user).exclude(id=instance.id).first()
                if new_default:
                    new_default.is_default = True
                    new_default.save(update_fields=['is_default', 'updated_at'])
            
            instance.delete()
            
            return create_success_response(
                _("Account deleted successfully."),
                data={
                    'account_name': account_name,
                    'deleted_account_id': account_id
                }
            )
            
        except NotFound:
            return create_error_response(
                _("Account not found."),
                errors=[_("Account does not exist")]
            )
        except Exception:
            return create_error_response(
                _("Account deletion failed."),
                errors=[_("An error occurred. Please try again.")]
            )
    
    @action(detail=True, methods=['patch'], url_path='set-default')
    def set_default(self, request, id=None):
        try:
            account = self.get_object()
            
            if account.is_default:
                return create_success_response(
                    _("Account is already default."),
                    data=AccountSerializer(account, context={'request': request}).data
                )
            
            serializer = self.get_serializer(context={'account': account, 'request': request})
            updated_account = serializer.save()
            
            response_data = AccountSerializer(updated_account, context={'request': request}).data
            
            return create_success_response(
                _("Default account set successfully."),
                data=response_data
            )
            
        except NotFound:
            return create_error_response(
                _("Account not found."),
                errors=[_("Account does not exist")]
            )
        except Exception:
            return create_error_response(
                _("Failed to set default account."),
                errors=[_("An error occurred. Please try again.")]
            )
