from main.models import *
from user.models import UserCustom

def run():
    print("Hello from script")
    
    user = UserCustom.objects.first()
    print(user)
    

    budget = Budget.objects.first()
    
    print(budget.current_month_expenses)
    print(budget.budget_utilization_percentage)
    
