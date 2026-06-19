import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
    },
    averagePrice: {
      type: Number,
      required: true,
      min: [0, 'Average price cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique stock entry per user portfolio
portfolioSchema.index({ userId: 1, stockId: 1 }, { unique: true });

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
export default Portfolio;
