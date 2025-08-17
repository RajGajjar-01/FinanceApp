from user.models import UserCustom  # Adjust if your user model differs
from portfolio.models import PortfolioSummary

def run():
    # Fetch the test user, assuming you created with this email.
    user = UserCustom.objects.filter(email="testuser@example.com").first()
    if not user:
        print("Test user not found. Please run the dummy data script first.")
        return
    
    summary = PortfolioSummary.objects.filter(user=user).first()
    if not summary:
        print("No summary found for the test user.")
        return
    
    print("===== Portfolio Summary =====")
    print("User:", user.username)
    print("Total Invested: $", summary.total_invested)
    print("Current Portfolio Value: $", summary.current_portfolio_value)
    print("Total Gain/Loss: $", summary.total_gain_loss)
    print("Total Gain/Loss %:", summary.total_gain_loss_percentage)
    print("Day Change Value: $", summary.day_change_value)
    print("Day Change %:", summary.day_change_percentage)
    print("Number of Holdings:", summary.number_of_holdings)
    print("Largest Holding %:", summary.largest_holding_percentage)
    print("Sector Allocation:", summary.sector_allocation)
    print("Last Calculated:", summary.last_calculated)
