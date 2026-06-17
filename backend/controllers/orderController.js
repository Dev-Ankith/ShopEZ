import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Checkout cart and place a new order
// @route   POST /api/orders/checkout
// @access  Private
export const checkoutOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    // 1. Validation checks
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) {
      return res.status(400).json({ success: false, message: 'Please provide a complete shipping address' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your shopping cart is empty' });
    }


    let totalAmount = 0;
    const orderItems = [];

    // 2. Validate product availability, pricing, discounts, and inventory limits
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ID ${item.productId}` });
      }

      if (product.inventory < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for "${product.name}". Available stock: ${product.inventory}, Requested: ${item.quantity}`
        });
      }

      // Compute discount-adjusted price
      const discountPrice = product.price * (1 - (product.discountPercent / 100));
      const itemCost = discountPrice * item.quantity;
      totalAmount += itemCost;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        discountPercent: product.discountPercent,
        quantity: item.quantity
      });
    }

    // 3. Perform inventory adjustments

    // Deduct inventory items
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { inventory: -item.quantity }
      });
    }

    // Create Order document
    const order = await Order.create({
      buyer: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      status: 'PENDING'
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Thank you for shopping with ShopEZ.',
      data: order
    });
  } catch (error) {
    console.error('Checkout Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error compiling checkout order' });
  }
};

// @desc    Get current buyer's order history
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Get Orders Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving orders' });
  }
};
