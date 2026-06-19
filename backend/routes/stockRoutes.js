import express from 'express';
import { getStocks, getStockById } from '../controllers/stockController.js';

const router = express.Router();

router.get('/', getStocks);
router.get('/:id', getStockById);

export default router;
