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


3. Wishlist Model Endpoints
Standard CRUD:

GET /api/wishlist/ - List user's wishlist items

POST /api/wishlist/ - Add stock to wishlist

GET /api/wishlist/{id}/ - Get specific wishlist item

PUT /api/wishlist/{id}/ - Update wishlist item

PATCH /api/wishlist/{id}/ - Partial update wishlist item

DELETE /api/wishlist/{id}/ - Remove from wishlist

Additional Endpoints:

GET /api/wishlist/alerts-ready/ - Items ready to trigger alerts

POST /api/wishlist/{id}/toggle-alerts/ - Enable/disable alerts for item

GET /api/wishlist/by-priority/ - Wishlist items sorted by priority

4. PriceAlert Model Endpoints
Limited CRUD (Mostly Read-Only):

GET /api/price-alerts/ - List user's price alerts history

GET /api/price-alerts/{id}/ - Get specific alert details

PATCH /api/price-alerts/{id}/ - Update alert status (mark as read)

Additional Endpoints:

GET /api/price-alerts/recent/ - Recent alerts for user

GET /api/price-alerts/unread/ - Unread alerts count


replace api -> expense
eg http://localhost:8000/api/budget ---> http://localhost:8000/expense/budget