import { useState, useEffect } from 'react';
import API from '../services/api.js';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { ShieldCheck, Plus, Trash2, Edit2, Package, ShoppingBag, DollarSign, TrendingUp, RefreshCw, Layers, Check, Truck } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6', '#f43f5e'];

const SellerDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab control: 'SALES', 'PRODUCTS', 'ORDERS'
  const [activeTab, setActiveTab] = useState('SALES');

  // Product Form CRUD states
  const [formMode, setFormMode] = useState(null); // 'ADD' or 'EDIT' or null
  const [editProductId, setEditProductId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [category, setCategory] = useState('');
  const [inventory, setInventory] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [submitLoading, setSubmitLoading] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState({ type: '', text: '' });

  const fetchSellerData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [analyticsRes, ordersRes, productsRes] = await Promise.all([
        API.get('/api/seller/analytics'),
        API.get('/api/seller/orders'),
        API.get('/api/products') // get products lists
      ]);

      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
      }
      if (ordersRes.data.success) {
        setOrders(ordersRes.data.data);
      }
      if (productsRes.data.success) {
        setProducts(productsRes.data.data);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load seller data:', err.message);
      setError('Access Denied. Seller authorization credentials required.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, []);

  const triggerNotify = (type, text) => {
    setNotifyMsg({ type, text });
    setTimeout(() => setNotifyMsg({ type: '', text: '' }), 4000);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setDiscountPercent('0');
    setCategory('');
    setInventory('');
    setImageUrl('');
    setEditProductId('');
    setFormMode(null);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !price || !category || !inventory) {
      triggerNotify('error', 'Please fill in all required fields.');
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        name,
        description,
        price: parseFloat(price),
        discountPercent: parseFloat(discountPercent || 0),
        category,
        inventory: parseInt(inventory, 10),
        imageUrl: imageUrl || undefined
      };

      let res;
      if (formMode === 'ADD') {
        res = await API.post('/api/seller/products', payload);
      } else {
        res = await API.put(`/api/seller/products/${editProductId}`, payload);
      }

      if (res.data.success) {
        triggerNotify('success', res.data.message);
        resetForm();
        await fetchSellerData(true);
      }
    } catch (err) {
      triggerNotify('error', err.response?.data?.message || 'Transaction submission failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleTriggerEdit = (prod) => {
    setFormMode('EDIT');
    setEditProductId(prod._id);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price.toString());
    setDiscountPercent(prod.discountPercent.toString());
    setCategory(prod.category);
    setInventory(prod.inventory.toString());
    setImageUrl(prod.imageUrl);
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Are you sure you want to unlist this product?')) return;
    try {
      const res = await API.delete(`/api/seller/products/${prodId}`);
      if (res.data.success) {
        triggerNotify('success', res.data.message);
        await fetchSellerData(true);
      }
    } catch (err) {
      triggerNotify('error', 'Failed to delete product.');
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await API.put(`/api/seller/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        triggerNotify('success', res.data.message);
        await fetchSellerData(true);
      }
    } catch (err) {
      triggerNotify('error', 'Failed to update shipping status.');
    }
  };

  if (loading && !analytics) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="text-muted">Loading Seller Dashboard analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card text-center animate-fade-in" style={{ padding: '3rem' }}>
        <p className="text-danger" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">Retry Login</button>
      </div>
    );
  }

  const { totalRevenue, ordersCount, itemsSold, productsCount, revenueByCategory, salesHistory } = analytics;
  const avgOrderVal = ordersCount > 0 ? totalRevenue / ordersCount : 0;

  // Format category data for PieChart legends
  const pieData = (revenueByCategory || []).map(cat => ({
    name: cat.category,
    value: cat.revenue
  }));

  return (
    <div className="seller-page animate-fade-in">
      <div className="seller-title">
        <ShieldCheck size={28} className="text-primary" />
        <h1>Seller Control Center</h1>
      </div>

      {/* Analytics stat cards grid */}
      <div className="seller-metrics-grid">
        <div className="metric-card glass-card">
          <div className="icon bg-gold"><DollarSign size={20} className="text-primary" /></div>
          <div className="stat">
            <span className="label">Gross Revenue</span>
            <h3>${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="icon bg-blue"><ShoppingBag size={20} className="text-accent" /></div>
          <div className="stat">
            <span className="label">Orders Fulfilled</span>
            <h3>{ordersCount} Orders</h3>
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="icon bg-green"><Package size={20} className="text-success" /></div>
          <div className="stat">
            <span className="label">Products Sold</span>
            <h3>{itemsSold} Items</h3>
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="icon bg-violet"><Layers size={20} style={{ color: '#8b5cf6' }} /></div>
          <div className="stat">
            <span className="label">Active Catalog</span>
            <h3>{productsCount} Listings</h3>
          </div>
        </div>
      </div>

      {/* Tabs navigation control bar */}
      <div className="seller-navigation-row">
        <div className="seller-tabs">
          <button 
            className={`seller-tab ${activeTab === 'SALES' ? 'active' : ''}`}
            onClick={() => setActiveTab('SALES')}
          >
            Sales Dashboard
          </button>
          <button 
            className={`seller-tab ${activeTab === 'PRODUCTS' ? 'active' : ''}`}
            onClick={() => { setActiveTab('PRODUCTS'); resetForm(); }}
          >
            Manage Inventory
          </button>
          <button 
            className={`seller-tab ${activeTab === 'ORDERS' ? 'active' : ''}`}
            onClick={() => setActiveTab('ORDERS')}
          >
            Fulfill Orders
          </button>
        </div>

        <button onClick={() => fetchSellerData(true)} className="btn btn-secondary btn-sm gap-1 flex items-center">
          <RefreshCw size={14} /> Refresh Logs
        </button>
      </div>

      {notifyMsg.text && (
        <div className={`seller-notification ${notifyMsg.type}`}>
          {notifyMsg.text}
        </div>
      )}

      {/* SALES DASHBOARD TAB */}
      {activeTab === 'SALES' && (
        <div className="grid-3-2 sales-charts-grid">
          {/* Revenue Over Time AreaChart */}
          <div className="glass-card chart-card">
            <h3>Revenue Over Time</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={salesHistory} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="amberGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(17, 24, 39, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff' }}
                    formatter={(v) => [`$${v.toFixed(2)}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#amberGlow)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution PieChart */}
          <div className="glass-card chart-card">
            <h3>Revenue By Category</h3>
            {pieData.length > 0 ? (
              <div className="pie-chart-section">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'rgba(17, 24, 39, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff' }}
                      formatter={(v) => [`$${v.toFixed(2)}`, 'Revenue']}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pie-legend">
                  {pieData.map((entry, idx) => {
                    const pct = totalRevenue > 0 ? (entry.value / totalRevenue) * 100 : 0;
                    return (
                      <div key={entry.name} className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                        <span className="legend-name">{entry.name}</span>
                        <span className="legend-pct">{pct.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted" style={{ padding: '3rem 0' }}>No sales data available.</p>
            )}
          </div>
        </div>
      )}

      {/* INVENTORY MANAGEMENT TAB */}
      {activeTab === 'PRODUCTS' && (
        <div className="inventory-section">
          {formMode && (
            <div className="glass-card form-card animate-slide-down">
              <h3>{formMode === 'ADD' ? 'List New Product' : `Edit Product: ${name}`}</h3>
              <form onSubmit={handleProductSubmit} className="seller-CRUD-form">
                <div className="form-group-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="p-name">Product Name *</label>
                    <input id="p-name" type="text" className="form-input" placeholder="e.g. Wireless Mouse" value={name} required onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="p-category">Category *</label>
                    <select id="p-category" className="form-input" value={category} required onChange={e => setCategory(e.target.value)}>
                      <option value="">Select Category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Apparel">Apparel</option>
                      <option value="Home Goods">Home Goods</option>
                      <option value="Books">Books</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-row-3">
                  <div className="form-group">
                    <label className="form-label" htmlFor="p-price">Price ($) *</label>
                    <input id="p-price" type="number" step="0.01" className="form-input" placeholder="29.99" value={price} required onChange={e => setPrice(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="p-discount">Discount (%)</label>
                    <input id="p-discount" type="number" min="0" max="99" className="form-input" placeholder="0" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="p-inventory">Stock Inventory *</label>
                    <input id="p-inventory" type="number" min="0" className="form-input" placeholder="10" value={inventory} required onChange={e => setInventory(e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="p-desc">Description *</label>
                  <textarea id="p-desc" className="form-input" rows="3" placeholder="Write item specifications..." value={description} required onChange={e => setDescription(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="p-image">Image URL</label>
                  <input id="p-image" type="text" className="form-input" placeholder="https://images.unsplash.com/..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                </div>

                <div className="form-actions mt-4">
                  <button type="submit" className="btn btn-success" disabled={submitLoading}>
                    {submitLoading ? 'Saving...' : 'Save Product'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="glass-card list-card">
            <div className="list-card-header">
              <h3>Inventory Listings ({products.length})</h3>
              {!formMode && (
                <button onClick={() => setFormMode('ADD')} className="btn btn-primary btn-sm flex items-center gap-1">
                  <Plus size={16} /> Add Product Listing
                </button>
              )}
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Stock Inventory</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(prod => (
                    <tr key={prod._id}>
                      <td className="product-table-cell">
                        <img src={prod.imageUrl} alt={prod.name} className="table-img" />
                        <span className="font-bold text-white">{prod.name}</span>
                      </td>
                      <td>{prod.category}</td>
                      <td>${prod.price.toFixed(2)}</td>
                      <td className={prod.discountPercent > 0 ? 'text-danger font-semibold' : ''}>
                        {prod.discountPercent}%
                      </td>
                      <td className={prod.inventory === 0 ? 'text-danger font-bold' : ''}>
                        {prod.inventory === 0 ? 'OUT OF STOCK' : `${prod.inventory} Units`}
                      </td>
                      <td style={{ textAlign: 'right' }} className="actions-cell">
                        <button onClick={() => handleTriggerEdit(prod)} className="btn btn-secondary btn-icon-sm" title="Edit Item"><Edit2 size={14} /></button>
                        <button onClick={() => handleDeleteProduct(prod._id)} className="btn btn-danger btn-icon-sm" title="Delete Item"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CLIENT ORDERS MANAGEMENT TAB */}
      {activeTab === 'ORDERS' && (
        <div className="glass-card list-card animate-fade-in">
          <h3>Customer Orders & Shipping Actions</h3>
          
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date Placed</th>
                  <th>Items Purchased</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Fulfillment actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(ord => (
                  <tr key={ord._id}>
                    <td className="font-bold text-primary">#{ord._id.slice(-6).toUpperCase()}</td>
                    <td>@{ord.buyer ? ord.buyer.username : 'Deleted User'}</td>
                    <td className="text-muted">{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="purchased-items-cell">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="item-spec">
                            <span>{item.name}</span>
                            <span className="text-primary font-semibold">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="font-bold text-success">${ord.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge-text ${ord.status.toLowerCase()}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {ord.status === 'PENDING' && (
                        <button 
                          onClick={() => handleStatusUpdate(ord._id, 'SHIPPED')}
                          className="btn btn-accent btn-sm gap-1 flex items-center"
                          style={{ marginLeft: 'auto' }}
                        >
                          <Truck size={14} /> Fulfill & Ship
                        </button>
                      )}
                      {ord.status === 'SHIPPED' && (
                        <button 
                          onClick={() => handleStatusUpdate(ord._id, 'DELIVERED')}
                          className="btn btn-success btn-sm gap-1 flex items-center"
                          style={{ marginLeft: 'auto' }}
                        >
                          <Check size={14} /> Deliver Order
                        </button>
                      )}
                      {ord.status === 'DELIVERED' && (
                        <span className="text-success font-semibold text-sm">Fulfillment Complete</span>
                      )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted" style={{ padding: '3rem' }}>
                      No orders have been placed in the shop yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        .seller-page {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .seller-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .seller-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }

        .metric-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem 1.5rem !important;
        }

        .metric-card .icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bg-gold { background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.15); }
        .bg-blue { background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.15); }
        .bg-green { background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.15); }
        .bg-violet { background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.15); }

        .metric-card .stat {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .metric-card .label {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        .metric-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0;
        }

        .seller-navigation-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }

        .seller-tabs {
          display: flex;
          gap: 0.5rem;
        }

        .seller-tab {
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 0.6rem 1.1rem;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .seller-tab:hover {
          color: white;
          background: rgba(255, 255, 255, 0.03);
        }

        .seller-tab.active {
          color: #0b0f19;
          background: var(--primary);
          box-shadow: 0 4px 12px var(--primary-glow);
        }

        .seller-notification {
          padding: 0.85rem 1.2rem;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 500;
          text-align: center;
        }

        .seller-notification.success {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: var(--success);
        }

        .seller-notification.error {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: var(--danger);
        }

        .sales-charts-grid {
          align-items: start;
        }

        .pie-chart-section {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .pie-legend {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
          width: 100%;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
        }

        .legend-color {
          width: 10px;
          height: 10px;
          border-radius: 2px;
          display: inline-block;
        }

        .legend-name {
          color: white;
        }

        .legend-pct {
          color: var(--text-muted);
          margin-left: auto;
        }

        .form-card {
          margin-bottom: 1.5rem;
        }

        .seller-CRUD-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }

        .form-group-row, .form-group-row-3 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 576px) {
          .form-group-row { grid-template-columns: 1fr 1fr; }
          .form-group-row-3 { grid-template-columns: repeat(3, 1fr); }
        }

        .form-actions {
          display: flex;
          gap: 0.75rem;
        }

        .list-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .product-table-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .table-img {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid var(--border-color);
        }

        .actions-cell {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        .btn-icon-sm {
          width: 32px;
          height: 32px;
          padding: 0;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .status-badge-text {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .status-badge-text.pending { color: var(--warning); }
        .status-badge-text.shipped { color: var(--accent); }
        .status-badge-text.delivered { color: var(--success); }

        .purchased-items-cell {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.85rem;
        }

        .item-spec {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
        }

        .flex { display: flex; }
        .items-center { align-items: center; }
        .gap-1 { gap: 0.25rem; }
      `}</style>
    </div>
  );
};

export default SellerDashboard;
