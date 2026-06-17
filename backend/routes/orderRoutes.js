import express from 'express';
import { checkoutOrder, getMyOrders } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All order endpoints are protected by JWT authentication
router.use(protect);

router.post('/checkout', checkoutOrder);
router.get('/my-orders', getMyOrders);

export default router;
