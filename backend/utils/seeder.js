import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

export const seedDatabase = async () => {
  try {
    // 1. Seed Product Listings
    const productCount = await Product.countDocuments({});
    if (productCount === 0) {
      console.log('Database is empty. Seeding default ShopEZ products...');
      const defaultProducts = [
        {
          name: 'iPhone 15 Pro Max',
          description: 'Experience the titanium design, groundbreaking A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever.',
          price: 1199.99,
          discountPercent: 5,
          category: 'Electronics',
          inventory: 20,
          imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60',
          reviews: [
            { username: 'buyer_bob', rating: 5, comment: 'Phenomenal build quality and the camera zooms are incredible!', timestamp: new Date(Date.now() - 259200000) },
            { username: 'tech_guru', rating: 4, comment: 'Great phone, but titanium edges scratch a bit easily.', timestamp: new Date(Date.now() - 172800000) }
          ]
        },
        {
          name: 'Sony Noise Cancelling Headphones',
          description: 'Industry-leading noise canceling headphones with dual noise sensor technology. Up to 30-hour battery life with touch sensor controls.',
          price: 348.00,
          discountPercent: 15,
          category: 'Electronics',
          inventory: 35,
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
          reviews: [
            { username: 'music_lover', rating: 5, comment: 'Best noise cancellation on the market. Super comfortable.', timestamp: new Date(Date.now() - 432000000) }
          ]
        },
        {
          name: 'Vintage Leather Denim Jacket',
          description: 'A classic denim jacket tailored with premium raw leather trims. Designed to break in beautifully and last a lifetime.',
          price: 95.00,
          discountPercent: 10,
          category: 'Apparel',
          inventory: 50,
          imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=60',
          reviews: [
            { username: 'fashion_plate', rating: 5, comment: 'Timeless style! Fits true to size and looks rugged.', timestamp: new Date(Date.now() - 86400000) }
          ]
        },
        {
          name: 'Cloudfoam Cushioned Running Sneakers',
          description: 'Run on air with lightweight mesh breathability and ultra-soft cloud cushioning technology built directly into the midsole.',
          price: 130.00,
          discountPercent: 0,
          category: 'Apparel',
          inventory: 40,
          imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
          reviews: [
            { username: 'runner_runner', rating: 3, comment: 'Soft underfoot, but doesn\'t have enough lateral support for trail runs.', timestamp: new Date(Date.now() - 604800000) }
          ]
        },
        {
          name: 'Ergonomic Mesh Office Chair',
          description: 'Stay focused and comfortable with dynamic lumbar support, breathable cooling mesh back, 3D armrests, and full tilt controls.',
          price: 269.99,
          discountPercent: 20,
          category: 'Home Goods',
          inventory: 15,
          imageUrl: 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=500&auto=format&fit=crop&q=60',
          reviews: [
            { username: 'remote_worker', rating: 4, comment: 'Excellent adjustments. Saves my back during long spreadsheets.', timestamp: new Date(Date.now() - 345600000) }
          ]
        },
        {
          name: 'Minimalist Dimmable LED Desk Lamp',
          description: 'Sleek metal desk lamp containing 5 color modes, 7 brightness steps, built-in USB charging port, and a auto-off sleep timer.',
          price: 45.00,
          discountPercent: 0,
          category: 'Home Goods',
          inventory: 100,
          imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60',
          reviews: [
            { username: 'study_hard', rating: 5, comment: 'Very bright and sleek. The color adjustments are wonderful.', timestamp: new Date(Date.now() - 950400000) }
          ]
        },
        {
          name: 'Atomic Habits (Paperback)',
          description: 'Tiny Changes, Remarkable Results. An easy and proven way to build good habits and break bad ones by James Clear.',
          price: 27.00,
          discountPercent: 25,
          category: 'Books',
          inventory: 75,
          imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60',
          reviews: [
            { username: 'reader_bob', rating: 5, comment: 'Practical, easy to read, and actionable. Truly life changing.', timestamp: new Date(Date.now() - 518400000) }
          ]
        }
      ];

      // Compute average ratings before inserting
      const productsToInsert = defaultProducts.map(p => {
        const productDoc = new Product(p);
        productDoc.calculateAverageRating();
        return productDoc;
      });

      await Product.insertMany(productsToInsert);
      console.log('Successfully seeded ShopEZ product catalog.');
    }

    // 2. Seed Buyer and Seller User Accounts
    const userCount = await User.countDocuments({});
    if (userCount === 0) {
      console.log('Seeding default Buyer and Seller accounts...');
      
      // Create Buyer
      const defaultBuyer = new User({
        username: 'buyer_bob',
        email: 'buyer@shopez.com',
        password: 'password123', // Will be hashed via pre-save hook
        role: 'BUYER'
      });
      await defaultBuyer.save();

      // Create Seller
      const defaultSeller = new User({
        username: 'seller_sam',
        email: 'seller@shopez.com',
        password: 'adminpassword', // Will be hashed via pre-save hook
        role: 'SELLER'
      });
      await defaultSeller.save();

      console.log('Successfully seeded e-commerce accounts:');
      console.log('  - BUYER:  buyer@shopez.com  | password123');
      console.log('  - SELLER: seller@shopez.com | adminpassword');
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};
