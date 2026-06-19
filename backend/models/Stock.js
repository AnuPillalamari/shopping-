import mongoose from 'mongoose';

const historicalDataSchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: [true, 'Please add a stock symbol'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    companyName: {
      type: String,
      required: [true, 'Please add a company name'],
      trim: true,
    },
    currentPrice: {
      type: Number,
      required: [true, 'Please add current price'],
      min: [0, 'Price cannot be negative'],
    },
    dailyChange: {
      type: Number, // Percentage change, e.g., +1.5 or -2.4
      default: 0,
    },
    marketCap: {
      type: Number,
      default: 0,
    },
    historicalData: [historicalDataSchema],
  },
  {
    timestamps: true,
  }
);

// Create indexes
stockSchema.index({ symbol: 1 });
stockSchema.index({ currentPrice: 1 });

const Stock = mongoose.model('Stock', stockSchema);
export default Stock;
