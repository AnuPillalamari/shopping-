import express from 'express';
import {
  getAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
  createStockByAdmin,
  updateStockByAdmin,
  deleteStockByAdmin,
  getAllTransactions,
  getSystemAnalytics,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth + admin protections to all admin routes
router.use(protect, adminOnly);

// User CRUD
router.get('/users', getAllUsers);
router.route('/users/:id')
  .put(updateUserByAdmin)
  .delete(deleteUserByAdmin);

// Stock CRUD
router.post('/stocks', createStockByAdmin);
router.route('/stocks/:id')
  .put(updateStockByAdmin)
  .delete(deleteStockByAdmin);

// Full audit log & systems metrics
router.get('/transactions', getAllTransactions);
router.get('/analytics', getSystemAnalytics);

export default router;
