import User from '../models/User.js';
import Stock from '../models/Stock.js';
import Transaction from '../models/Transaction.js';
import Portfolio from '../models/Portfolio.js';

// ==========================================
// User Management
// ==========================================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details / role (ADMIN/USER) or walletBalance
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUserByAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      if (req.body.walletBalance !== undefined) {
        user.walletBalance = req.body.walletBalance;
      }

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user, their portfolio, and transaction history
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUserByAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('You cannot delete your own admin account');
      }

      // Clean up user portfolio and transaction logs
      await Portfolio.deleteMany({ userId: user._id });
      await Transaction.deleteMany({ userId: user._id });
      await User.findByIdAndDelete(user._id);

      res.json({ message: 'User and all related records deleted' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Stock Management
// ==========================================

// @desc    Create a new stock
// @route   POST /api/admin/stocks
// @access  Private/Admin
export const createStockByAdmin = async (req, res, next) => {
  try {
    const { symbol, companyName, currentPrice, marketCap } = req.body;

    if (!symbol || !companyName || !currentPrice) {
      res.status(400);
      throw new Error('Please fill in symbol, companyName, and currentPrice');
    }

    const stockExists = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (stockExists) {
      res.status(400);
      throw new Error('Stock with this symbol already exists');
    }

    // Generate dummy historical points for the chart
    const initialPrice = parseFloat(currentPrice);
    const historicalData = [];
    const now = new Date();
    for (let i = 15; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      // Random price variation
      const randomVariance = (Math.random() * 8 - 4) / 100;
      historicalData.push({
        price: parseFloat((initialPrice * (1 + randomVariance)).toFixed(2)),
        timestamp: date,
      });
    }
    // Add current price as the final point
    historicalData.push({ price: initialPrice, timestamp: now });

    const stock = await Stock.create({
      symbol: symbol.toUpperCase(),
      companyName,
      currentPrice: initialPrice,
      marketCap: marketCap || 0,
      dailyChange: 0,
      historicalData,
    });

    res.status(201).json(stock);
  } catch (error) {
    next(error);
  }
};

// @desc    Update stock details
// @route   PUT /api/admin/stocks/:id
// @access  Private/Admin
export const updateStockByAdmin = async (req, res, next) => {
  try {
    const { symbol, companyName, currentPrice, marketCap } = req.body;
    const stock = await Stock.findById(req.params.id);

    if (stock) {
      stock.symbol = symbol ? symbol.toUpperCase() : stock.symbol;
      stock.companyName = companyName || stock.companyName;
      stock.marketCap = marketCap !== undefined ? marketCap : stock.marketCap;

      if (currentPrice !== undefined) {
        const newPrice = parseFloat(currentPrice);
        const percentChange = ((newPrice - stock.currentPrice) / stock.currentPrice) * 100;
        
        stock.currentPrice = newPrice;
        stock.dailyChange = parseFloat(percentChange.toFixed(2));
        stock.historicalData.push({ price: newPrice, timestamp: new Date() });
        if (stock.historicalData.length > 30) {
          stock.historicalData.shift();
        }
      }

      const updatedStock = await stock.save();
      res.json(updatedStock);
    } else {
      res.status(404);
      throw new Error('Stock not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a stock and remove it from user portfolios
// @route   DELETE /api/admin/stocks/:id
// @access  Private/Admin
export const deleteStockByAdmin = async (req, res, next) => {
  try {
    const stock = await Stock.findById(req.params.id);

    if (stock) {
      // Remove this stock from all user portfolios
      await Portfolio.deleteMany({ stockId: stock._id });
      // Delete stock
      await Stock.findByIdAndDelete(stock._id);

      res.json({ message: 'Stock deleted and removed from all portfolios' });
    } else {
      res.status(404);
      throw new Error('Stock not found');
    }
  } catch (error) {
    next(error);
  }
};

// ==========================================
// System-wide Monitoring & Analytics
// ==========================================

// @desc    Get all transactions in system
// @route   GET /api/admin/transactions
// @access  Private/Admin
export const getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({})
      .populate('userId', 'name email')
      .populate('stockId', 'symbol companyName')
      .sort({ timestamp: -1 });

    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard analytics metrics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getSystemAnalytics = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    const stockCount = await Stock.countDocuments();
    const txCount = await Transaction.countDocuments();

    // Calculate overall portfolio value plus total system wallet balance
    const users = await User.find({}, 'walletBalance');
    const totalWalletBalance = users.reduce((acc, curr) => acc + curr.walletBalance, 0);

    // Calculate total trading volume (sum of absolute price * quantity of all transactions)
    const transactions = await Transaction.find({});
    const totalVolume = transactions.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

    // Dynamic Top Trading Stock
    const txGroup = await Transaction.aggregate([
      { $group: { _id: '$stockId', count: { $sum: 1 }, totalQty: { $sum: '$quantity' } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    let topStockSymbol = 'N/A';
    if (txGroup.length > 0) {
      const popularStock = await Stock.findById(txGroup[0]._id);
      if (popularStock) {
        topStockSymbol = popularStock.symbol;
      }
    }

    res.json({
      userCount,
      stockCount,
      transactionCount: txCount,
      totalWalletBalance,
      totalTradingVolume: totalVolume,
      topTradedStock: topStockSymbol,
    });
  } catch (error) {
    next(error);
  }
};
