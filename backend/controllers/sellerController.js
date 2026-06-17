import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

// @desc    Get all orders (Seller/Admin view)
// @route   GET /api/seller/orders
// @access  Private/Seller
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('buyer', 'username email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Seller Get Orders Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving orders' });
  }
};

// @desc    Update order shipping status
// @route   PUT /api/seller/orders/:id/status
// @access  Private/Seller
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['PENDING', 'SHIPPED', 'DELIVERED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid order status (PENDING/SHIPPED/DELIVERED)' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, message: `Order status updated to ${status}`, data: order });
  } catch (error) {
    console.error('Update Order Status Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating order status' });
  }
};

// @desc    Add a new product (Seller CRUD)
// @route   POST /api/seller/products
// @access  Private/Seller
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, discountPercent, category, inventory, imageUrl } = req.body;

    if (!name || !description || price === undefined || !category || inventory === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide name, description, price, category, and inventory' });
    }

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      discountPercent: parseFloat(discountPercent || 0),
      category,
      inventory: parseInt(inventory, 10),
      imageUrl: imageUrl || undefined
    });

    res.status(201).json({ success: true, message: 'Product listed successfully!', data: product });
  } catch (error) {
    console.error('Seller Create Product Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating product' });
  }
};

// @desc    Update product details (Seller CRUD)
// @route   PUT /api/seller/products/:id
// @access  Private/Seller
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, discountPercent, category, inventory, imageUrl } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = parseFloat(price);
    if (discountPercent !== undefined) product.discountPercent = parseFloat(discountPercent);
    if (category) product.category = category;
    if (inventory !== undefined) product.inventory = parseInt(inventory, 10);
    if (imageUrl) product.imageUrl = imageUrl;

    await product.save();
    res.status(200).json({ success: true, message: 'Product updated successfully!', data: product });
  } catch (error) {
    console.error('Seller Update Product Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating product' });
  }
};

// @desc    Delete product listing (Seller CRUD)
// @route   DELETE /api/seller/products/:id
// @access  Private/Seller
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, message: 'Product unlisted successfully!' });
  } catch (error) {
    console.error('Seller Delete Product Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error unlisting product' });
  }
};

// @desc    Get sales performance metrics (Analytics)
// @route   GET /api/seller/analytics
// @access  Private/Seller
export const getSellerAnalytics = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('items.product');
    const productsCount = await Product.countDocuments({});
    
    let totalRevenue = 0;
    let itemsSold = 0;
    const categoryRevenueMap = {};
    const salesHistoryMap = {};

    orders.forEach(order => {
      totalRevenue += order.totalAmount;
      
      // Calculate transaction date (MM/DD)
      const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
      salesHistoryMap[dateStr] = (salesHistoryMap[dateStr] || 0) + order.totalAmount;

      order.items.forEach(item => {
        itemsSold += item.quantity;
        
        // Compute revenue by category
        // Find category (fallback to database product lookup if needed, or item has product populated)
        const category = item.product ? item.product.category : 'General';
        const discountPrice = item.price * (1 - (item.discountPercent / 100));
        const cost = discountPrice * item.quantity;
        
        categoryRevenueMap[category] = (categoryRevenueMap[category] || 0) + cost;
      });
    });

    // Format category revenue object for Recharts PieChart
    const revenueByCategory = Object.keys(categoryRevenueMap).map(cat => ({
      category: cat,
      revenue: parseFloat(categoryRevenueMap[cat].toFixed(2))
    }));

    // Format sales history trend for Recharts LineChart (sorted chronologically)
    const salesHistory = Object.keys(salesHistoryMap)
      .map(date => ({
        date,
        revenue: parseFloat(salesHistoryMap[date].toFixed(2))
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Fallbacks if no history exists (make chart render empty but valid)
    if (salesHistory.length === 0) {
      salesHistory.push({ date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }), revenue: 0 });
    }

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        ordersCount: orders.length,
        itemsSold,
        productsCount,
        revenueByCategory,
        salesHistory
      }
    });
  } catch (error) {
    console.error('Seller Analytics Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error generating sales analytics' });
  }
};
