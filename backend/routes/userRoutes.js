import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserPortfolio,
  getUserTransactions,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.get('/portfolio', protect, getUserPortfolio);
router.get('/transactions', protect, getUserTransactions);

export default router;
