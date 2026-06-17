import Product from '../models/Product.js';

// @desc    Get all products (with filters & search)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sortBy, order } = req.query;
    let query = {};

    // 1. Keyword search (name / description)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Category filter
    if (category) {
      query.category = category;
    }

    // 3. Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // 4. Sorting logic
    let sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions['createdAt'] = -1; // Default: Newest first
    }

    const products = await Product.find(query).sort(sortOptions);
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error('Get Products Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
};

// @desc    Get a single product detail
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('Get Product Detail Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(500).json({ success: false, message: 'Server error fetching product details' });
  }
};

// @desc    Create a new product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const starRating = parseInt(rating, 10);

    if (isNaN(starRating) || starRating < 1 || starRating > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a star rating between 1 and 5' });
    }

    if (!comment || comment.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please write a review comment' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user has already reviewed this product
    const alreadyReviewed = product.reviews.find(
      (r) => r.username === req.user.username
    );

    if (alreadyReviewed) {
      // Update existing review
      alreadyReviewed.rating = starRating;
      alreadyReviewed.comment = comment.trim();
      alreadyReviewed.timestamp = new Date();
    } else {
      // Add new review
      const review = {
        username: req.user.username,
        rating: starRating,
        comment: comment.trim(),
        timestamp: new Date()
      };
      product.reviews.push(review);
    }

    // Recalculate overall average star rating
    product.calculateAverageRating();
    await product.save();

    res.status(200).json({
      success: true,
      message: alreadyReviewed ? 'Review updated successfully' : 'Review added successfully',
      data: {
        reviews: product.reviews,
        averageRating: product.averageRating
      }
    });
  } catch (error) {
    console.error('Create Review Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating review' });
  }
};

// @desc    List all unique product categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error('Get Categories Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching categories' });
  }
};
