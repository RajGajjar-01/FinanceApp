from expense.models import *
from user.models import UserCustom


def run():
    print("Hello from script")
    
    user = UserCustom.objects.first()
    print(user)
    
    checking_account = Account.objects.create(
        user=user,
        name="Second Account",
        type=AccountType.CURRENT,
        balance=Decimal('2500.00'),
        is_default=True  # This becomes their primary account
    )
    
    print(checking_account)
    
    checking_account = Account.objects.first()
    
    budget = Budget.objects.create(
        user=user,
        amount=Decimal('3000.00')  # $3000 monthly budget
    )
    
    salary_transaction = Transaction.objects.create(
        user=user,
        account=checking_account,
        type=TransactionType.INCOME,
        amount=Decimal('4500.00'),
        description="Monthly Salary - Company XYZ",
        date=timezone.now(),
        category="Salary",
        status=TransactionStatus.COMPLETED
    )
    
    print(salary_transaction)

    rent_transaction = Transaction.objects.create(
        user=user,
        account=checking_account,
        type=TransactionType.EXPENSE,
        amount=Decimal('1200.00'),
        description="Monthly Rent Payment",
        date=timezone.now(),
        category="Housing",
        status=TransactionStatus.COMPLETED
    )
    # rent_transaction2 = Transaction.objects.create(
    #     user=user,
    #     account=checking_account,
    #     type=TransactionType.EXPENSE,
    #     amount=Decimal('1200.00'),
    #     description="Monthly Rent Payment",
    #     date=timezone.now(),
    #     category="Housing",
    #     status=TransactionStatus.COMPLETED
    # )
    
    # print(rent_transaction)
