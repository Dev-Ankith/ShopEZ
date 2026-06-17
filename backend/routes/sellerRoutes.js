import express from 'express';
import {
  getAllOrders,
  updateOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerAnalytics
} from '../controllers/sellerController.js';
import { protect, seller } from '../middleware/auth.js';

const router = express.Router();

// Apply auth and seller validations globally to all seller endpoints
router.use(protect);
router.use(seller);

router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/analytics', getSellerAnalytics);

export default router;
