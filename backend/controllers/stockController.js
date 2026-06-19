import Stock from '../models/Stock.js';
import axios from 'axios';

// @desc    Get all stocks with optional search
// @route   GET /api/stocks
// @access  Public
export const getStocks = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { symbol: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const stocks = await Stock.find(query);
    res.json(stocks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single stock by ID
// @route   GET /api/stocks/:id
// @access  Public
export const getStockById = async (req, res, next) => {
  try {
    const stock = await Stock.findById(req.params.id);

    if (stock) {
      res.json(stock);
    } else {
      res.status(404);
      throw new Error('Stock not found');
    }
  } catch (error) {
    next(error);
  }
};

// Helper for simulating real-time price updates (Mock mode) or polling external API
export const updateLiveStockPrices = async () => {
  try {
    const provider = process.env.STOCK_API_PROVIDER || 'mock';
    const apiKey = process.env.STOCK_API_KEY;

    const stocks = await Stock.find({});
    if (stocks.length === 0) return;

    if (provider === 'mock' || !apiKey) {
      // Simulation mode
      for (let stock of stocks) {
        const currentPrice = stock.currentPrice;
        // Random change between -2.5% and +2.5%
        const percentChange = (Math.random() * 5 - 2.5) / 100;
        const priceDiff = currentPrice * percentChange;
        let newPrice = parseFloat((currentPrice + priceDiff).toFixed(2));
        if (newPrice < 1.0) newPrice = 1.0; // Prevent stock price from going to zero

        // Daily change calculation
        const dailyChange = parseFloat((percentChange * 100).toFixed(2));

        // Append to historical data (limit to last 30 data points)
        const history = [...stock.historicalData];
        history.push({ price: newPrice, timestamp: new Date() });
        if (history.length > 30) {
          history.shift();
        }

        stock.currentPrice = newPrice;
        stock.dailyChange = dailyChange;
        stock.historicalData = history;
        await stock.save();
      }
      console.log('Stock prices simulated & updated in DB.');
    } else {
      // Finnhub API Integration
      // Finnhub Endpoint: https://finnhub.io/api/v1/quote?symbol=AAPL&token=API_KEY
      for (let stock of stocks) {
        try {
          const response = await axios.get(
            `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${apiKey}`
          );
          
          if (response.data && response.data.c) {
            const newPrice = parseFloat(response.data.c.toFixed(2));
            const dailyChange = parseFloat(response.data.dp.toFixed(2));

            const history = [...stock.historicalData];
            history.push({ price: newPrice, timestamp: new Date() });
            if (history.length > 30) {
              history.shift();
            }

            stock.currentPrice = newPrice;
            stock.dailyChange = dailyChange;
            stock.historicalData = history;
            await stock.save();
          }
        } catch (err) {
          console.error(`Error polling Finnhub for ${stock.symbol}: ${err.message}`);
        }
      }
      console.log('Stock prices polled from external API and updated in DB.');
    }
  } catch (error) {
    console.error(`Error in updateLiveStockPrices background task: ${error.message}`);
  }
};
