import mongoose from 'mongoose';
import User from '../models/User.js';
import Stock from '../models/Stock.js';
import Transaction from '../models/Transaction.js';
import Portfolio from '../models/Portfolio.js';

// @desc    Buy a stock
// @route   POST /api/trade/buy
// @access  Private
export const buyStock = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { stockId, quantity } = req.body;
    const qty = parseInt(quantity);

    if (!stockId || isNaN(qty) || qty <= 0) {
      res.status(400);
      throw new Error('Please provide a valid stock ID and quantity greater than 0');
    }

    const stock = await Stock.findById(stockId).session(session);
    if (!stock) {
      res.status(404);
      throw new Error('Stock not found');
    }

    const user = await User.findById(req.user._id).session(session);
    const totalPrice = stock.currentPrice * qty;

    if (user.walletBalance < totalPrice) {
      res.status(400);
      throw new Error(`Insufficient wallet balance. Required: $${totalPrice.toFixed(2)}, Available: $${user.walletBalance.toFixed(2)}`);
    }

    // Deduct from wallet
    user.walletBalance -= totalPrice;
    await user.save({ session });

    // Create transaction record
    await Transaction.create(
      [
        {
          userId: user._id,
          stockId: stock._id,
          type: 'BUY',
          quantity: qty,
          price: stock.currentPrice,
        },
      ],
      { session }
    );

    // Update Portfolio
    let portfolioEntry = await Portfolio.findOne({ userId: user._id, stockId: stock._id }).session(session);

    if (portfolioEntry) {
      const currentQty = portfolioEntry.quantity;
      const currentAvgPrice = portfolioEntry.averagePrice;

      const newQty = currentQty + qty;
      const newAvgPrice = ((currentAvgPrice * currentQty) + (stock.currentPrice * qty)) / newQty;

      portfolioEntry.quantity = newQty;
      portfolioEntry.averagePrice = parseFloat(newAvgPrice.toFixed(2));
      await portfolioEntry.save({ session });
    } else {
      portfolioEntry = await Portfolio.create(
        [
          {
            userId: user._id,
            stockId: stock._id,
            quantity: qty,
            averagePrice: stock.currentPrice,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: `Successfully purchased ${qty} shares of ${stock.symbol}`,
      walletBalance: user.walletBalance,
      portfolioEntry,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// @desc    Sell a stock
// @route   POST /api/trade/sell
// @access  Private
export const sellStock = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { stockId, quantity } = req.body;
    const qty = parseInt(quantity);

    if (!stockId || isNaN(qty) || qty <= 0) {
      res.status(400);
      throw new Error('Please provide a valid stock ID and quantity greater than 0');
    }

    const stock = await Stock.findById(stockId).session(session);
    if (!stock) {
      res.status(404);
      throw new Error('Stock not found');
    }

    const user = await User.findById(req.user._id).session(session);
    const portfolioEntry = await Portfolio.findOne({ userId: user._id, stockId: stock._id }).session(session);

    if (!portfolioEntry || portfolioEntry.quantity < qty) {
      res.status(400);
      throw new Error(`Insufficient shares owned. You have ${portfolioEntry ? portfolioEntry.quantity : 0} shares and tried to sell ${qty}`);
    }

    const totalEarning = stock.currentPrice * qty;

    // Add to wallet
    user.walletBalance += totalEarning;
    await user.save({ session });

    // Create transaction record
    await Transaction.create(
      [
        {
          userId: user._id,
          stockId: stock._id,
          type: 'SELL',
          quantity: qty,
          price: stock.currentPrice,
        },
      ],
      { session }
    );

    // Update Portfolio
    const remainingQty = portfolioEntry.quantity - qty;

    if (remainingQty === 0) {
      await Portfolio.findByIdAndDelete(portfolioEntry._id).session(session);
    } else {
      portfolioEntry.quantity = remainingQty;
      await portfolioEntry.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: `Successfully sold ${qty} shares of ${stock.symbol}`,
      walletBalance: user.walletBalance,
      remainingQuantity: remainingQty,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
