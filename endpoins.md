GET    /api/budget/                 # Get user's budget
POST   /api/budget/                 # Create budget (if doesn't exist)
PUT    /api/budget/                 # Update budget
DELETE /api/budget/                 # Delete budget
GET    /api/budget/utilization/     # Get budget utilization stats


GET    /api/transactions/           # List transactions with filters
POST   /api/transactions/           # Create new transaction
GET    /api/transactions/{id}/      # Get specific transaction
PUT    /api/transactions/{id}/      # Update transaction
DELETE /api/transactions/{id}/      # Delete transaction
POST   /api/transactions/bulk/      # Bulk create transactions (CSV import)

GET    /api/accounts/               # List user's accounts
POST   /api/accounts/               # Create new account
GET    /api/accounts/{id}/          # Get specific account details
PUT    /api/accounts/{id}/          # Update account
DELETE /api/accounts/{id}/          # Delete account
PATCH  /api/accounts/{id}/set-default/  # Set as default account


replace api -> expense
eg http://localhost:8000/api/budget ---> http://localhost:8000/expense/budget