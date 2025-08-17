from user.models import UserCustom
from portfolio.models import Portfolio
from decimal import Decimal

def run():
    print("=== Portfolio Holdings Analysis ===")
    
    user = UserCustom.objects.filter(email="testuser@example.com").first()
    if not user:
        print("Test user not found!")
        return
    
    holdings = Portfolio.objects.filter(user=user, is_active=True).select_related('stock')
    
    print(f"User: {user.username}")
    print(f"Total Holdings: {holdings.count()}")
    print("-" * 80)
    
    total_invested = Decimal('0.00')
    total_current_value = Decimal('0.00')
    
    for holding in holdings:
        current_value = holding.current_value
        gain_loss = holding.unrealized_gain_loss
        gain_loss_pct = holding.unrealized_gain_loss_percentage
        day_change = holding.day_change_value
        
        total_invested += holding.total_invested
        total_current_value += current_value
        
        print(f"Stock: {holding.stock.symbol} ({holding.stock.name})")
        print(f"  Sector: {holding.stock.sector}")
        print(f"  Shares Owned: {holding.shares_owned}")
        print(f"  Purchase Price: ${holding.purchase_price}")
        print(f"  Current Price: ${holding.stock.current_price}")
        print(f"  Purchase Date: {holding.purchase_date}")
        print(f"  Total Invested: ${holding.total_invested}")
        print(f"  Current Value: ${current_value}")
        print(f"  Unrealized G/L: ${gain_loss} ({gain_loss_pct:.2f}%)")
        print(f"  Day Change: ${day_change}")
        print(f"  Target Allocation: {holding.target_allocation_percentage}%")
        print(f"  Investment Thesis: {holding.investment_thesis}")
        print(f"  Notes: {holding.notes}")
        print("-" * 40)
    
    overall_gain_loss = total_current_value - total_invested
    overall_gain_loss_pct = (overall_gain_loss / total_invested * 100) if total_invested > 0 else Decimal('0.00')
    
    print("PORTFOLIO TOTALS:")
    print(f"Total Invested: ${total_invested}")
    print(f"Current Value: ${total_current_value}")
    print(f"Overall G/L: ${overall_gain_loss} ({overall_gain_loss_pct:.2f}%)")
