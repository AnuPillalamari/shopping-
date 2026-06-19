import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import tradeRoutes from './routes/tradeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Stock live updater worker
import { updateLiveStockPrices } from './controllers/stockController.js';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect Mongoose
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: "https://shopping-anu21.vercel.app",
  credentials: true
}));
app.use(express.json());

// Base Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'active', message: 'TradeEZ API is operational' });
});

// Bind API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/admin', adminRoutes);

// Background task: fluctuate/update stock prices every 30 seconds
updateLiveStockPrices(); // Initial run
setInterval(async () => {
  console.log('Running scheduled stock price updates...');
  await updateLiveStockPrices();
}, 30000); // 30s intervals

// Serve static assets in production

if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
  });
}

// Fallbacks & Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`TradeEZ API Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
