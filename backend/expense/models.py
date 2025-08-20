from django.db import models, transaction
from decimal import Decimal
import uuid
from django.core.validators import MinValueValidator
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta, datetime
from django.core.exceptions import ValidationError


User = get_user_model()


class AccountType(models.TextChoices):
    CURRENT = 'CURRENT', 'Current Account'
    SAVINGS = 'SAVINGS', 'Savings Account'


class TransactionType(models.TextChoices):
    INCOME = 'INCOME', 'Income'
    EXPENSE = 'EXPENSE', 'Expense'


class TransactionStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    COMPLETED = 'COMPLETED', 'Completed'
    FAILED = 'FAILED', 'Failed'


class RecurringInterval(models.TextChoices):
    DAILY = 'DAILY', 'Daily'
    WEEKLY = 'WEEKLY', 'Weekly'
    MONTHLY = 'MONTHLY', 'Monthly'
    YEARLY = 'YEARLY', 'Yearly'


class TransactionCategory(models.TextChoices):
    # Income Categories
    SALARY = 'SALARY', 'Salary'
    BUSINESS = 'BUSINESS', 'Business Income'
    INVESTMENT = 'INVESTMENT', 'Investment Returns'
    FREELANCE = 'FREELANCE', 'Freelance/Consulting'
    RENTAL = 'RENTAL', 'Rental Income'
    BONUS = 'BONUS', 'Bonus/Commission'
    REFUND = 'REFUND', 'Refunds'
    GIFT = 'GIFT', 'Gifts Received'
    
    # Essential Expenses
    FOOD = 'FOOD', 'Food & Dining'
    GROCERIES = 'GROCERIES', 'Groceries'
    TRANSPORT = 'TRANSPORT', 'Transportation'
    FUEL = 'FUEL', 'Fuel/Gas'
    BILLS = 'BILLS', 'Bills & Utilities'
    RENT = 'RENT', 'Rent/Mortgage'
    INSURANCE = 'INSURANCE', 'Insurance'
    HEALTHCARE = 'HEALTHCARE', 'Healthcare'
    
    # Lifestyle & Personal
    SHOPPING = 'SHOPPING', 'Shopping'
    CLOTHING = 'CLOTHING', 'Clothing & Accessories'
    ENTERTAINMENT = 'ENTERTAINMENT', 'Entertainment'
    EDUCATION = 'EDUCATION', 'Education'
    TRAVEL = 'TRAVEL', 'Travel'
    FITNESS = 'FITNESS', 'Fitness & Sports'
    PERSONAL_CARE = 'PERSONAL_CARE', 'Personal Care'
    SUBSCRIPTIONS = 'SUBSCRIPTIONS', 'Subscriptions'
    
    # Financial
    SAVINGS = 'SAVINGS', 'Savings'
    INVESTMENTS = 'INVESTMENTS', 'Investments'
    LOAN_PAYMENT = 'LOAN_PAYMENT', 'Loan Payments'
    CREDIT_CARD = 'CREDIT_CARD', 'Credit Card Payment'
    BANK_FEES = 'BANK_FEES', 'Bank Fees'
    TAXES = 'TAXES', 'Taxes'
    
    # Family & Social
    CHILDCARE = 'CHILDCARE', 'Childcare'
    PET_CARE = 'PET_CARE', 'Pet Care'
    CHARITY = 'CHARITY', 'Charity/Donations'
    GIFTS_GIVEN = 'GIFTS_GIVEN', 'Gifts Given'
    
    # Home & Maintenance
    HOME_IMPROVEMENT = 'HOME_IMPROVEMENT', 'Home Improvement'
    MAINTENANCE = 'MAINTENANCE', 'Maintenance & Repairs'
    
    OTHER = 'OTHER', 'Other'


class TimeStampedModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


class Account(TimeStampedModel):
    name = models.CharField(max_length=100, db_index=True)
    type = models.CharField(
        max_length=10,
        choices=AccountType.choices,
        default=AccountType.CURRENT,
        db_index=True
    )
    balance = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    is_default = models.BooleanField(default=False, db_index=True)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='accounts',
        db_index=True
    )
    
    class Meta:
        db_table = 'main_accounts'
        constraints = [
            models.UniqueConstraint(
                fields=['user'],
                condition=models.Q(is_default=True),
                name='unique_default_account_per_user'
            )
        ]
        
    def __str__(self):
        return f"{self.user.email} - {self.name} ({self.type})"
    
    def save(self, *args, **kwargs):
        if self.is_default:
            Account.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)


class Transaction(TimeStampedModel):
    type = models.CharField(
        max_length=10,
        choices=TransactionType.choices,
        db_index=True
    )
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    description = models.CharField(max_length=500, blank=True, null=True)
    date = models.DateTimeField(db_index=True)
    # CHANGED: Updated category field to use TransactionCategory choices and increased max_length
    category = models.CharField(
        max_length=20,  # Changed from 100 to 20 to fit the choice values
        choices=TransactionCategory.choices,
        default=TransactionCategory.OTHER,  # Added default value
        db_index=True
    )
    receipt_url = models.URLField(blank=True, null=True)
    
    is_recurring = models.BooleanField(default=False, db_index=True)
    recurring_interval = models.CharField(
        max_length=10,
        choices=RecurringInterval.choices,
        blank=True,
        null=True
    )
    next_recurring_date = models.DateTimeField(blank=True, null=True, db_index=True)
    last_processed = models.DateTimeField(blank=True, null=True)
    
    status = models.CharField(
        max_length=10,
        choices=TransactionStatus.choices,
        default=TransactionStatus.COMPLETED,
        db_index=True
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='transactions',
        db_index=True
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        related_name='transactions',
        db_index=True
    )
    
    class Meta:
        db_table = 'main_transactions'
        indexes = [
            models.Index(fields=['user', 'type', 'date']),
            models.Index(fields=['user', 'category', 'date']),
            models.Index(fields=['account', 'type', 'date']),
            models.Index(fields=['is_recurring', 'next_recurring_date']),
            models.Index(fields=['status', 'date']),
            models.Index(fields=['user', 'account', 'type', 'status']),
        ]
    
    def __str__(self):
        return f"{self.type} - {self.amount} - {self.description}"
    
    def clean(self):
        if self.is_recurring and not self.recurring_interval:
            raise ValidationError("Recurring interval is required for recurring transactions")
        
        if not self.is_recurring and self.recurring_interval:
            raise ValidationError("Recurring interval should not be set for non-recurring transactions")
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
        
        if self.status == TransactionStatus.COMPLETED:
            self.update_account_balance()
    
    def update_account_balance(self):
        with transaction.atomic():
            account = Account.objects.select_for_update().get(id=self.account.id)
            
            if self.type == TransactionType.INCOME:
                account.balance += self.amount
            else:
                if account.balance < self.amount:
                    raise ValidationError("Insufficient funds in savings account")
                account.balance -= self.amount
            
            account.save(update_fields=['balance', 'updated_at'])  # CHANGED: Removed 'is_default' from update_fields


class Budget(TimeStampedModel):
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    last_alert_sent = models.DateTimeField(blank=True, null=True)
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='budget'
    )
    
    class Meta:
        db_table = 'main_budgets'
        indexes = [
            models.Index(fields=['user', 'last_alert_sent']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - Budget: {self.amount}"
    
    @property
    def current_month_expenses(self):
        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        return Transaction.objects.filter(
            user=self.user,
            type=TransactionType.EXPENSE,
            status=TransactionStatus.COMPLETED,
            date__gte=start_of_month,
            date__lte=now
        ).aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0.00')
    
    @property
    def budget_utilization_percentage(self):
        if self.amount == 0:
            return 0
        return min((self.current_month_expenses / self.amount) * 100, 100)
    
    def should_send_alert(self, threshold_percentage=80):
        utilization = self.budget_utilization_percentage
        
        if utilization < threshold_percentage:
            return False
        
        if self.last_alert_sent:
            time_since_last_alert = timezone.now() - self.last_alert_sent
            if time_since_last_alert < timedelta(hours=24):
                return False
        
        return True
