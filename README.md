# ShopEZ — Premium E-Commerce Storefront

ShopEZ is a modern, responsive full-stack MERN (MongoDB, Express, React, Node.js) e-commerce retail storefront modeled after premium online shopping platforms. It features real-time search, category filters, interactive star ratings and reviews, drawer-based checkout flows, and a visual merchant dashboard displaying revenue and order analytics using Recharts.

---

## 🚀 Key Features

### 🛒 For Buyers
- **Dynamic Catalog Browsing**: Search for items, filter by categories, and sort by price or date.
- **Product Details & Reviews**: View high-resolution image galleries, description lists, stock levels, and write verified customer reviews with interactive star ratings.
- **Drawer Checkout Cart**: Add/adjust product quantities, review original-to-discount comparisons, enter shipping address details, and complete mock billing checkout.
- **Order History**: Track shipment statuses (`PENDING`, `SHIPPED`, `DELIVERED`) and view item breakdowns.

### 📊 For Sellers
- **Merchant Dashboard**: Review daily sales revenues and category sales distribution shares via interactive Area and Pie charts.
- **Inventory Control (CRUD)**: Easily add, edit, or delete catalog products with image URLs, prices, discounts, and inventory counts.
- **Order Fulfillment Manager**: View buyer shipping addresses and update order statuses dynamically.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), React Router v6, Axios, Recharts, Lucide React Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose) with **zero-configuration local memory database fallback**
- **Styling**: Premium custom Vanilla CSS (featuring glassmorphism, responsive grids, sleek hover transitions, and dark slate tones)

---

## ⚡ Quick Test Accounts

The database seeds two default credentials automatically on launch:

| Account Type | Email | Password |
| :--- | :--- | :--- |
| **Buyer (User)** | `buyer@shopez.com` | `password123` |
| **Seller (Admin)** | `seller@shopez.com` | `adminpassword` |

---

## 📂 Project Structure

```
ShopEZ/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Express API controllers (auth, orders, products, seller)
│   ├── middleware/      # JSON Web Token authentication middleware
│   ├── models/          # Mongoose Schemas (User, Product, Order)
│   ├── routes/          # Express Router endpoints
│   ├── utils/           # Database seeder scripts
│   ├── .env             # Server configurations
│   └── server.js        # Main Express entrypoint
└── frontend/
    ├── public/          # Static assets and icons
    ├── src/
    │   ├── assets/      # Media files
    │   ├── components/  # Shared widgets (NavBar)
    │   ├── context/     # React Context state (Auth, Cart)
    │   ├── pages/       # Storefront screens (Catalog, Details, Checkout, Dashboard)
    │   ├── services/    # Axios HTTP instance
    │   ├── App.jsx      # Routes and protection guards
    │   └── main.jsx     # Frontend entrypoint
    ├── index.html       # Storefront page shell
    └── vite.config.js   # Vite configuration
```

---

## ⚙️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Optional: if not provided, the server auto-boots a `MongoMemoryServer` fallback)

### 1. Clone & Setup Workspace
```bash
git clone https://github.com/Dev-Ankith/ShopEZ.git
cd ShopEZ
```

### 2. Backend Configurations
Navigate to the `backend` folder:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```
*Note: If `MONGODB_URI` is omitted, the app spins up an in-memory database and seeds it automatically.*

Start the backend:
```bash
npm start
```

### 3. Frontend Configurations
Navigate to the `frontend` folder in a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

The React storefront will boot on `http://localhost:3000/`.
