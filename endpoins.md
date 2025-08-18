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


1. Stock Model Endpoints
Standard CRUD:

GET /api/stocks/ - List all stocks (with pagination, filtering by sector, exchange, active status)

POST /api/stocks/ - Create new stock (admin only)

GET /api/stocks/{id}/ - Retrieve specific stock details

PUT /api/stocks/{id}/ - Update stock (admin only)

PATCH /api/stocks/{id}/ - Partial update stock (admin only)

DELETE /api/stocks/{id}/ - Soft delete stock (admin only)

Additional Endpoints:

GET /api/stocks/search/ - Advanced search by name, symbol, sector

GET /api/stocks/{id}/price-history/ - Get price history data

GET /api/stocks/sectors/ - Get available sectors with stock counts

GET /api/stocks/trending/ - Get trending stocks by price movement

2. Portfolio Model Endpoints
Standard CRUD:

GET /api/portfolio/holdings/ - List user's portfolio holdings

POST /api/portfolio/holdings/ - Add stock to portfolio

GET /api/portfolio/holdings/{id}/ - Get specific holding details

PUT /api/portfolio/holdings/{id}/ - Update holding

PATCH /api/portfolio/holdings/{id}/ - Partial update holding

DELETE /api/portfolio/holdings/{id}/ - Remove from portfolio

Additional Endpoints:

GET /api/portfolio/performance/ - Portfolio performance metrics

GET /api/portfolio/holdings/by-sector/ - Holdings grouped by sector

POST /api/portfolio/holdings/bulk-add/ - Bulk add multiple holdings

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

5. PortfolioSummary Model Endpoints
Read-Only with Refresh:

GET /api/portfolio/summary/ - Get user's portfolio summary

POST /api/portfolio/summary/refresh/ - Manually refresh summary calculations

Additional Endpoints:

GET /api/portfolio/summary/history/ - Historical summary data

GET /api/portfolio/analytics/ - Advanced analytics and insights

roadsidecoder finance app --yt 
replace api -> expense
eg http://localhost:8000/api/budget ---> http://localhost:8000/expense/budget