# TradeEZ Stock Trading Platform

TradeEZ is a full-stack MERN virtual stock trading simulation platform featuring glassmorphic dark-mode designs, real-time price updates (polling every 10 seconds), dynamic line charts, wallet balances, user portfolios, and user and stock administrative control panels.

## Project Architecture

```text
tradeez/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection setup
│   ├── controllers/
│   │   ├── adminController.js    # CRUD users, stocks, analytics metrics
│   │   ├── authController.js     # User registration, login authentication
│   │   ├── stockController.js    # Read stock list, details, background price updates
│   │   ├── tradeController.js    # Buy and sell order operations
│   │   └── userController.js     # Profiles, portfolios, and transaction lists
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT route protection & role controls
│   │   └── errorMiddleware.js    # Express exceptions and page fallback handlers
│   ├── models/
│   │   ├── Portfolio.js          # User holding records schema
│   │   ├── Stock.js              # Listed securities & historical prices schema
│   │   ├── Transaction.js        # Executed buy/sell logs schema
│   │   └── User.js               # Account details & password hashing schema
│   ├── routes/
│   │   ├── adminRoutes.js        # Admin REST routes
│   │   ├── authRoutes.js         # Auth REST routes
│   │   ├── stockRoutes.js        # Securities query REST routes
│   │   ├── tradeRoutes.js        # Buying/selling REST routes
│   │   └── userRoutes.js         # Portfolios & transaction logs REST routes
│   ├── utils/
│   │   └── seeder.js             # Initial stock listing & charts historical seeder
│   ├── .env                      # Environment variables
│   ├── .env.example              # Variables example template
│   ├── package.json              # Backend dependencies configuration
│   └── server.js                 # Entry server.js Express script
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx        # Navigation header, wallet balance, profile
    │   │   ├── ProtectedRoute.jsx# Auth and Admin role navigation guard
    │   │   ├── Spinner.jsx       # Custom trade loading indicator
    │   │   └── Toast.jsx         # Custom sliding alert message system
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Global login state, settings, wallet balance
    │   │   └── ToastContext.jsx  # Context provider for notification cards
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx# Admin analytics and database CRUD controls
    │   │   ├── Dashboard.jsx     # Market feed, search, gainers/losers/trending
    │   │   ├── Login.jsx         # Credentials login form
    │   │   ├── Profile.jsx       # Update profile credentials
    │   │   ├── Portfolio.jsx     # Asset holdings stats and allocations Doughnut chart
    │   │   ├── Register.jsx      # Account creation form (select role USER/ADMIN)
    │   │   ├── StockDetail.jsx   # Chart.js price charts & Trade execution desk
    │   │   └── Transactions.jsx  # Complete buy and sell history audit log
    │   ├── utils/
    │   │   └── api.js            # Axios client with interceptor for JWT
    │   ├── App.jsx               # Application routes mapping
    │   ├── index.css             # Obsidian dark design tokens, grids, glassmorphism
    │   └── main.jsx              # React mounting script
    ├── index.html                # HTML entry link to fonts and Bootstrap CDNs
    ├── package.json              # Frontend libraries configuration
    └── vite.config.js            # Vite configuration, reverse proxy setup
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Version 16.x or newer recommended)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally (standard port `27017`) or a MongoDB Atlas Connection URI.

### Installation & Setup

1. Open your terminal in the workspace directory.
2. Navigate to the backend folder, install libraries, and start the seeding script:
   ```bash
   cd backend
   npm install
   npm run seed
   ```
3. Start the Express API development server:
   ```bash
   npm run dev
   ```
4. In a separate terminal session, navigate to the frontend folder and install assets:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
5. Open your browser and navigate to the local Vite web address: `http://localhost:3000`.

---

## Configuration Variables (`backend/.env`)

Ensure the backend `.env` variables match your configurations:

- `MONGODB_URI`: Connection string pointing to your MongoDB instance (Default: `mongodb://127.0.0.1:27017/tradeez`).
- `JWT_SECRET`: Secret hash token for sign-in encryptions (Default: `supersecretjwtkey_tradeez123`).
- `STOCK_API_PROVIDER`: Mode configuration (Select `mock` to simulate real-time price updates dynamically, or set `finnhub` with a valid Finnhub Stock API key).
- `STOCK_API_KEY`: API credential (Optional if using `mock` simulation).
- `PORT`: Development API port (Default: `5000`).

---

## Testing Scenarios Walkthrough

Follow this sequence to test platform operations:

### 1. Registration & Access Control
- Navigate to `http://localhost:3000/register`.
- Create a standard user account with `USER` role.
- Register another test account selecting the `ADMIN` role.
- Log in to your standard user account. Verify that navigating directly to `http://localhost:3000/admin` triggers a redirect back to the user dashboard.

### 2. Stock Feed & Live Updates
- View the Market Dashboard. Note the **Composite S&P Index** rating card.
- Type in the search box to find specific assets (e.g. `TSLA` or `Apple`).
- Notice that every 10 seconds, prices adjust slightly with glowing positive/negative percentage colors.

### 3. Placing Buy & Sell Trades
- Click **Trade** on **NVIDIA Corporation (NVDA)**.
- Note the **Price History Chart** visualizing populated historical details.
- Enter `5` in the Order Quantity. Verify the cost value represents `5 * currentPrice`.
- Click **Buy Shares**. Check that:
  - Your Wallet balance updates in the navbar immediately.
  - A green "Order filled successfully" toast message slides in.
  - The **Holding Position** card renders showing average price, quantity `5`, and net profit/loss.
- Go back to the dashboard, click **Trade** on **Tesla Inc (TSLA)** and purchase `10` shares.
- Click **Sell Shares** on TSLA for `4` shares. Verify remaining holding represents `6` shares.

### 4. Portfolio Asset Allocation
- Navigate to **Portfolio** tab.
- Observe the **Net Portfolio Value** card representing current stocks values + remaining cash balance.
- Note the **Asset Allocation Doughnut** chart, dynamically splitting percentage values between `NVDA` and `TSLA`.
- Verify the individual average cost bases match execution parameters.

### 5. Reviewing System Logs & Admin Control Panel
- Log out of your standard account and log in with your **Admin** email.
- Click **Admin Desk** in the navigation header.
- View the **Dashboard Stats** tab displaying registered user volume, listed securities, and global trade metrics.
- Navigate to **Audit Logs** to view detailed information of all buy and sell orders executed by all investors.
- Open **Securities (CRUD)**. Add a new mock stock ticker:
  - Symbol: `MSFT`
  - Name: `Microsoft Corporation`
  - Price: `420.50`
  - Market Cap: `3200000000000`
- Click **Create Asset** and verify Microsoft is listed immediately on the dashboard.
