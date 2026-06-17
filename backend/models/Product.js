import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price cannot be negative']
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%']
    },
    category: {
      type: String,
      required: [true, 'Please provide a product category'],
      trim: true,
      index: true // Optimized index for fast category filtering
    },
    inventory: {
      type: Number,
      required: [true, 'Please provide product stock inventory count'],
      min: [0, 'Inventory cannot be negative'],
      default: 0
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60' // Default placeholder image
    },
    reviews: [reviewSchema],
    averageRating: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Method to calculate average rating based on current reviews
productSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    return;
  }
  const totalRating = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  this.averageRating = parseFloat((totalRating / this.reviews.length).toFixed(1));
};

const Product = mongoose.model('Product', productSchema);
export default Product;
