import express from 'express';
import {
  getProducts,
  getProductById,
  createProductReview,
  getCategories
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Submitting a review requires authentication
router.post('/:id/reviews', protect, createProductReview);

export default router;
