import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Stock from '../models/Stock.js';
import connectDB from '../config/db.js';

dotenv.config();

const sampleStocks = [
  { symbol: 'AAPL', companyName: 'Apple Inc.', currentPrice: 175.50, marketCap: 2700000000000 },
  { symbol: 'MSFT', companyName: 'Microsoft Corporation', currentPrice: 415.60, marketCap: 3100000000000 },
  { symbol: 'GOOGL', companyName: 'Alphabet Inc.', currentPrice: 172.40, marketCap: 2150000000000 },
  { symbol: 'AMZN', companyName: 'Amazon.com, Inc.', currentPrice: 185.20, marketCap: 1900000000000 },
  { symbol: 'TSLA', companyName: 'Tesla, Inc.', currentPrice: 178.90, marketCap: 560000000000 },
  { symbol: 'NVDA', companyName: 'NVIDIA Corporation', currentPrice: 875.40, marketCap: 2200000000000 },
  { symbol: 'META', companyName: 'Meta Platforms, Inc.', currentPrice: 475.10, marketCap: 1200000000000 },
  { symbol: 'NFLX', companyName: 'Netflix, Inc.', currentPrice: 610.30, marketCap: 265000000000 },
];

const seedStocks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected for seeding...');

    // Clear existing stocks (or check if they exist, but clearing and seeding makes it fresh!)
    await Stock.deleteMany({});
    console.log('Existing stocks removed.');

    const now = new Date();

    const stocksToInsert = sampleStocks.map((stock) => {
      const historicalData = [];
      const basePrice = stock.currentPrice;

      // Create 20 historical daily data points leading up to today
      for (let i = 20; i >= 1; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        // Random percentage shift between -4% and +4%
        const dailyShift = (Math.random() * 8 - 4) / 100;
        const priceAtTime = parseFloat((basePrice * (1 + dailyShift)).toFixed(2));
        historicalData.push({
          price: priceAtTime,
          timestamp: date,
        });
      }

      // Add current price as the last historical data point
      historicalData.push({
        price: basePrice,
        timestamp: now,
      });

      // Daily change percentage mock
      const dailyChange = parseFloat((Math.random() * 6 - 3).toFixed(2));

      return {
        ...stock,
        dailyChange,
        historicalData,
      };
    });

    await Stock.insertMany(stocksToInsert);
    console.log('Stocks successfully seeded into database!');
    process.exit();
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedStocks();
