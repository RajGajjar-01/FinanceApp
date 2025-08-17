import calendar
from decimal import Decimal
from django.db import transaction
from django.db.models import Q, Sum, Count
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from rest_framework import permissions, viewsets, filters
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError, NotFound
from backend.utils import create_success_response, create_error_response
from .models import Account, Transaction, Budget, AccountType, TransactionStatus, TransactionType, RecurringInterval
from .serializers import *

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
        action_mapping = {
            'list': AccountListSerializer,
            'set_default': SetDefaultAccountSerializer,
        }
        return action_mapping.get(self.action, AccountSerializer)

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            if not queryset.exists():
                return create_success_response(
                    _("No accounts found. Create your first account to get started."),
                    data={'results': [], 'count': 0, 'next': None, 'previous': None}
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
                data={'results': serializer.data, 'count': len(serializer.data)}
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
                
                if new_name and Account.objects.filter(user=request.user, name=new_name).exclude(id=instance.id).exists():
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
                data={'account_name': account_name, 'deleted_account_id': account_id}
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


class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['type', 'status', 'category', 'is_recurring', 'account']
    ordering_fields = ['date', 'amount', 'created_at', 'category']
    ordering = ['-date', '-created_at']
    search_fields = ['description', 'category']

    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user).order_by('-date', '-created_at')
        serializer_class = self.get_serializer_class()
        return serializer_class.setup_eager_loading(queryset) if hasattr(serializer_class, 'setup_eager_loading') else queryset

    def get_serializer_class(self):
        action_mapping = {
            'list': TransactionListSerializer,
            'create': TransactionCreateSerializer,
            'bulk': BulkTransactionCreateSerializer,
            'update_status': UpdateTransactionStatusSerializer,
        }
        return action_mapping.get(self.action, TransactionSerializer)

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            date_from = request.query_params.get('date_from')
            date_to = request.query_params.get('date_to')
            if date_from:
                queryset = queryset.filter(date__date__gte=date_from)
            if date_to:
                queryset = queryset.filter(date__date__lte=date_to)
            if not queryset.exists():
                return create_success_response(
                    _("No transactions found."),
                    data={'results': [], 'count': 0, 'next': None, 'previous': None}
                )
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return create_success_response(
                    _("Transactions retrieved successfully."),
                    data=self.get_paginated_response(serializer.data).data
                )
            serializer = self.get_serializer(queryset, many=True)
            return create_success_response(
                _("Transactions retrieved successfully."),
                data={'results': serializer.data, 'count': len(serializer.data)}
            )
        except Exception as error:
            return create_error_response(
                _("Failed to retrieve transactions."),
                errors=[str(error)]
            )

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            return create_success_response(
                _("Transaction retrieved successfully."),
                data=self.get_serializer(instance).data
            )
        except NotFound:
            return create_error_response(
                _("Transaction not found."),
                errors=[_("Transaction does not exist")]
            )
        except Exception as error:
            return create_error_response(
                _("Failed to retrieve transaction."),
                errors=[str(error)]
            )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                return create_error_response(
                    _("Invalid transaction data provided."),
                    errors=serializer.errors
                )
            instance = serializer.save()
            return create_success_response(
                _("Transaction created successfully."),
                data=TransactionSerializer(instance, context={'request': request}).data
            )
        except Exception as error:
            error_message = getattr(error, 'detail', str(error))
            return create_error_response(
                _("Transaction creation failed."),
                errors=[error_message]
            )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            if instance.status == TransactionStatus.COMPLETED and any(field in request.data for field in ['amount','type','account']):
                return create_error_response(
                    _("Cannot modify completed transaction."),
                    errors=[_("Restricted fields cannot be modified.")]
                )
            serializer = self.get_serializer(instance, data=request.data, partial=kwargs.pop('partial', False))
            if not serializer.is_valid():
                return create_error_response(
                    _("Invalid transaction data provided."),
                    errors=serializer.errors
                )
            updated_instance = serializer.save()
            return create_success_response(
                _("Transaction updated successfully."),
                data=TransactionSerializer(updated_instance, context={'request': request}).data
            )
        except NotFound:
            return create_error_response(
                _("Transaction not found."),
                errors=[_("Transaction does not exist")]
            )
        except Exception as error:
            error_message = getattr(error, 'detail', str(error))
            return create_error_response(
                _("Transaction update failed."),
                errors=[error_message]
            )

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            if instance.status == TransactionStatus.COMPLETED:
                return create_error_response(
                    _("Cannot delete completed transaction."),
                    errors=[_("Completed transactions cannot be deleted.")]
                )
            transaction_id = str(instance.id)
            description = instance.description or f"{instance.type} - {instance.amount}"
            instance.delete()
            return create_success_response(
                _("Transaction deleted successfully."),
                data={'transaction_description': description, 'deleted_transaction_id': transaction_id}
            )
        except NotFound:
            return create_error_response(
                _("Transaction not found."),
                errors=[_("Transaction does not exist")]
            )
        except Exception as error:
            return create_error_response(
                _("Transaction deletion failed."),
                errors=[str(error)]
            )

    @action(detail=False, methods=['post'], url_path='bulk')
    def bulk(self, request):
        try:
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                return create_error_response(
                    _("Invalid CSV data provided."),
                    errors=serializer.errors
                )
            result = serializer.save()
            success_count = result.get('success_count', 0)
            total_rows = result.get('total_rows', 0)
            errors = result.get('errors', [])
            message = _("All transactions imported successfully.") if not errors else _("Transactions imported with some errors.")
            return create_success_response(
                message,
                data={'success_count': success_count, 'total_rows': total_rows, 'error_count': len(errors), 'errors': errors}
            )
        except Exception as error:
            return create_error_response(
                _("Bulk import failed."),
                errors=[str(error)]
            )

    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, id=None):
        try:
            transaction_obj = self.get_object()
            serializer = self.get_serializer(data=request.data, context={'transaction': transaction_obj})
            if not serializer.is_valid():
                return create_error_response(
                    _("Invalid status data provided."),
                    errors=serializer.errors
                )
            updated_transaction = serializer.save()
            return create_success_response(
                _("Transaction status updated successfully."),
                data=TransactionSerializer(updated_transaction, context={'request': request}).data
            )
        except NotFound:
            return create_error_response(
                _("Transaction not found."),
                errors=[_("Transaction does not exist")]
            )
        except Exception as error:
            return create_error_response(
                _("Failed to update transaction status."),
                errors=[str(error)]
            )

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        try:
            queryset = Transaction.objects.filter(user=request.user)
            date_from = request.query_params.get('date_from')
            date_to = request.query_params.get('date_to')
            if date_from:
                queryset = queryset.filter(date__date__gte=date_from)
            if date_to:
                queryset = queryset.filter(date__date__lte=date_to)
            summary_stats = queryset.aggregate(
                total_income=Sum('amount', filter=Q(type=TransactionType.INCOME, status=TransactionStatus.COMPLETED)),
                total_expense=Sum('amount', filter=Q(type=TransactionType.EXPENSE, status=TransactionStatus.COMPLETED)),
                completed_count=Count('id', filter=Q(status=TransactionStatus.COMPLETED)),
                pending_count=Count('id', filter=Q(status=TransactionStatus.PENDING)),
                failed_count=Count('id', filter=Q(status=TransactionStatus.FAILED)),
            )
            total_income = summary_stats.get('total_income') or Decimal('0.00')
            total_expense = summary_stats.get('total_expense') or Decimal('0.00')
            try:
                category_breakdown = list(queryset.filter(status=TransactionStatus.COMPLETED)
                           .values('category','type')
                           .annotate(total=Sum('amount'))
                           .order_by('-total'))
            except Exception:
                category_breakdown = []
            summary_data = {
                'total_income': total_income,
                'total_expense': total_expense,
                'net_amount': total_income - total_expense,
                'transaction_count': summary_stats.get('completed_count',0),
                'pending_count': summary_stats.get('pending_count',0),
                'failed_count': summary_stats.get('failed_count',0),
                'category_breakdown': category_breakdown,
                'period': {'from': date_from, 'to': date_to}
            }
            return create_success_response(
                _("Transaction summary retrieved successfully."),
                data=summary_data
            )
        except Exception as error:
            return create_error_response(
                _("Failed to retrieve transaction summary."),
                errors=[str(error)]
            )


class BudgetViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['amount', 'created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Budget.objects.filter(user=self.request.user)
        serializer_class = self.get_serializer_class()
        return serializer_class.setup_eager_loading(queryset) if hasattr(serializer_class, 'setup_eager_loading') else queryset

    def get_serializer_class(self):
        action_mapping = {
            'list': BudgetListSerializer,
            'utilization': BudgetUtilizationSerializer,
        }
        return action_mapping.get(self.action, BudgetSerializer)

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            if not queryset.exists():
                return create_success_response(
                    _("No budget found."),
                    data={'results': [], 'count': 0, 'next': None, 'previous': None}
                )
            serializer = self.get_serializer(queryset.first())
            return create_success_response(
                _("Budget retrieved successfully."),
                data={'results': [serializer.data], 'count': 1}
            )
        except Exception as error:
            return create_error_response(
                _("Failed to retrieve budget."),
                errors=[str(error)]
            )

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            return create_success_response(
                _("Budget retrieved successfully."),
                data=self.get_serializer(instance).data
            )
        except NotFound:
            return create_error_response(
                _("Budget not found."),
                errors=[_("Budget does not exist")]
            )
        except Exception as error:
            return create_error_response(
                _("Failed to retrieve budget."),
                errors=[str(error)]
            )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            if Budget.objects.filter(user=request.user).exists():
                return create_error_response(
                    _("Budget already exists."),
                    errors=[_("User can only have one budget.")]
                )
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                return create_error_response(
                    _("Invalid budget data provided."),
                    errors=serializer.errors
                )
            instance = serializer.save()
            return create_success_response(
                _("Budget created successfully."),
                data=BudgetSerializer(instance, context={'request': request}).data
            )
        except ValidationError as e:
            return create_error_response(
                _("Budget creation failed."),
                errors=getattr(e, 'detail', str(e))
            )
        except Exception as error:
            return create_error_response(
                _("Budget creation failed."),
                errors=[str(error)]
            )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=kwargs.pop('partial', False))
            if not serializer.is_valid():
                return create_error_response(
                    _("Invalid budget data provided."),
                    errors=serializer.errors
                )
            updated_instance = serializer.save()
            return create_success_response(
                _("Budget updated successfully."),
                data=BudgetSerializer(updated_instance, context={'request': request}).data
            )
        except NotFound:
            return create_error_response(
                _("Budget not found."),
                errors=[_("Budget does not exist")]
            )
        except ValidationError as e:
            return create_error_response(
                _("Budget update failed."),
                errors=getattr(e, 'detail', str(e))
            )
        except Exception as error:
            return create_error_response(
                _("Budget update failed."),
                errors=[str(error)]
            )

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            budget_id = str(instance.id)
            budget_amount = instance.amount
            instance.delete()
            return create_success_response(
                _("Budget deleted successfully."),
                data={'budget_amount': budget_amount, 'deleted_budget_id': budget_id}
            )
        except NotFound:
            return create_error_response(
                _("Budget not found."),
                errors=[_("Budget does not exist")]
            )
        except Exception as error:
            return create_error_response(
                _("Budget deletion failed."),
                errors=[str(error)]
            )

    @action(detail=True, methods=['get'], url_path='utilization')
    def utilization(self, request, id=None):
        try:
            budget = self.get_object()
            serializer = self.get_serializer(budget)
            return create_success_response(
                _("Budget utilization retrieved successfully."),
                data=serializer.data
            )
        except NotFound:
            return create_error_response(
                _("Budget not found."),
                errors=[_("Budget does not exist")]
            )
        except Exception as error:
            return create_error_response(
                _("Failed to retrieve budget utilization."),
                errors=[str(error)]
            )

    @action(detail=False, methods=['get'], url_path='current')
    def current(self, request):
        try:
            budget = Budget.objects.get(user=request.user)
            serializer = BudgetSerializer(budget, context={'request': request})
            return create_success_response(
                _("Current budget retrieved successfully."),
                data=serializer.data
            )
        except Budget.DoesNotExist:
            return create_error_response(
                _("No budget found."),
                errors=[_("Please create a budget first.")]
            )
        except Exception as error:
            return create_error_response(
                _("Failed to retrieve current budget."),
                errors=[str(error)]
            )

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        try:
            budget = Budget.objects.select_related('user').get(user=request.user)
            now = timezone.now()
            start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

            transactions_qs = Transaction.objects.filter(
                user=request.user,
                type=TransactionType.EXPENSE,
                status=TransactionStatus.COMPLETED,
                date__gte=start_of_month,
                date__lte=now
            )

            current_expenses = transactions_qs.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            utilization_percentage = (float(current_expenses) / float(budget.amount) * 100 if budget.amount > 0 else 0.0)
            transaction_count = transactions_qs.count()
            average_transaction = (current_expenses / transaction_count if transaction_count > 0 else Decimal('0.00'))
            days_in_month = calendar.monthrange(now.year, now.month)[1]
            days_elapsed = now.day
            days_remaining = days_in_month - days_elapsed + 1
            average_daily_spending = (current_expenses / days_elapsed if days_elapsed > 0 else Decimal('0.00'))
            projected_spending = average_daily_spending * days_in_month
            category_breakdown = list(transactions_qs.values('category').annotate(total=Sum('amount')).order_by('-total')[:10])

            recommendations = []
            if utilization_percentage >= 100:
                recommendations.append({'type': 'critical', 'message': _("Budget exceeded!")})
            elif utilization_percentage >= 80:
                recommendations.append({'type': 'warning', 'message': _("Approaching budget limit.")})
            elif utilization_percentage >= 60:
                recommendations.append({'type': 'caution', 'message': _("Monitor high-spending categories.")})
            else:
                recommendations.append({'type': 'success', 'message': _("Great job staying within budget!")})

            summary_data = {
                'budget_info': {
                    'id': str(budget.id),
                    'amount': budget.amount,
                    'created_at': budget.created_at,
                    'last_alert_sent': budget.last_alert_sent
                },
                'utilization': {
                    'current_month_expenses': current_expenses,
                    'utilization_percentage': round(utilization_percentage, 2),
                    'category_breakdown': category_breakdown,
                    'average_daily_spending': average_daily_spending,
                    'projected_monthly_spending': projected_spending,
                    'days_remaining_in_month': days_remaining,
                },
                'transaction_stats': {
                    'monthly_transaction_count': transaction_count,
                    'average_transaction_amount': average_transaction,
                },
                'recommendations': recommendations
            }

            return create_success_response(
                _("Budget summary retrieved successfully."),
                data=summary_data
            )
        except Budget.DoesNotExist:
            return create_error_response(
                _("No budget found."),
                errors=[_("Please create a budget first.")]
            )
        except Exception as e:
            return create_error_response(
                _("Failed to retrieve budget summary."),
                errors=[str(e)]
            )
