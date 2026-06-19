import User from '../models/User.js';
import Portfolio from '../models/Portfolio.js';
import Transaction from '../models/Transaction.js';
import Stock from '../models/Stock.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        walletBalance: updatedUser.walletBalance,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user portfolio holdings
// @route   GET /api/users/portfolio
// @access  Private
export const getUserPortfolio = async (req, res, next) => {
  try {
    const holdings = await Portfolio.find({ userId: req.user._id }).populate('stockId');

    let totalInvestment = 0;
    let totalCurrentValue = 0;

    const formattedHoldings = holdings
      .filter((h) => h.stockId !== null && h.quantity > 0) // Filter out deleted or empty holdings
      .map((holding) => {
        const stock = holding.stockId;
        const currentPrice = stock.currentPrice;
        const averagePrice = holding.averagePrice;
        const quantity = holding.quantity;

        const investmentValue = averagePrice * quantity;
        const currentHoldingValue = currentPrice * quantity;
        const profitLoss = currentHoldingValue - investmentValue;
        const profitLossPercentage = investmentValue > 0 ? (profitLoss / investmentValue) * 100 : 0;

        totalInvestment += investmentValue;
        totalCurrentValue += currentHoldingValue;

        return {
          _id: holding._id,
          stock: {
            _id: stock._id,
            symbol: stock.symbol,
            companyName: stock.companyName,
            currentPrice: stock.currentPrice,
            dailyChange: stock.dailyChange,
          },
          quantity,
          averagePrice,
          investmentValue,
          currentValue: currentHoldingValue,
          profitLoss,
          profitLossPercentage,
        };
      });

    const totalProfitLoss = totalCurrentValue - totalInvestment;
    const totalProfitLossPercentage =
      totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;

    res.json({
      holdings: formattedHoldings,
      summary: {
        totalInvestment,
        totalCurrentValue,
        totalProfitLoss,
        totalProfitLossPercentage,
        walletBalance: req.user.walletBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user transactions
// @route   GET /api/users/transactions
// @access  Private
export const getUserTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .populate('stockId')
      .sort({ timestamp: -1 });

    res.json(transactions);
  } catch (error) {
    next(error);
  }
};
