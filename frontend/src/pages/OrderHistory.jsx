import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api.js';
import { ClipboardList, Calendar, MapPin, Truck, ChevronRight } from 'lucide-react';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load orders history:', err.message);
      setError('Failed to load order history. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'DELIVERED': return 'status-delivered';
      case 'SHIPPED': return 'status-shipped';
      default: return 'status-pending';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="text-muted">Loading your purchase history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card text-center" style={{ padding: '3rem' }}>
        <p className="text-danger">{error}</p>
        <button onClick={fetchOrders} className="btn btn-primary mt-4">Retry</button>
      </div>
    );
  }

  return (
    <div className="orders-page animate-fade-in">
      <div className="orders-title">
        <ClipboardList size={26} className="text-primary" />
        <h2>Your Purchase History</h2>
      </div>

      <div className="orders-list">
        {orders.map(order => (
          <div key={order._id} className="order-card glass-card">
            <div className="order-card-header">
              <div className="header-meta">
                <span className="order-id">Order ID: <span className="text-primary font-bold">#{order._id}</span></span>
                <span className="order-date">
                  <Calendar size={14} className="inline-icon" />
                  {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <span className={`order-status-pill ${getStatusClass(order.status)}`}>
                <Truck size={12} className="inline-icon" />
                {order.status}
              </span>
            </div>

            <div className="order-card-body">
              {/* Items List */}
              <div className="order-items-list">
                {order.items.map((item, idx) => {
                  const discPrice = item.price * (1 - (item.discountPercent / 100));
                  return (
                    <div key={idx} className="order-item-spec">
                      <div className="item-name-qty">
                        <span className="font-semibold text-white">{item.name}</span>
                        <span className="qty-tag">x{item.quantity}</span>
                      </div>
                      <span className="price-tag">${(discPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Shipping Address and Total Amount */}
              <div className="order-details-summary">
                <div className="shipping-info">
                  <span className="label">
                    <MapPin size={12} className="inline-icon" />
                    Delivery Destination:
                  </span>
                  <span className="address">
                    {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                  </span>
                </div>

                <div className="order-total">
                  <span className="label">Total Charged:</span>
                  <span className="amount text-success">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="no-orders glass-card text-center" style={{ padding: '4rem 1rem' }}>
            <ClipboardList size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <h3>No orders found</h3>
            <p className="text-muted">You haven't placed any orders yet. Explore our catalog to find items!</p>
            <Link to="/" className="btn btn-primary mt-4">Shop Products</Link>
          </div>
        )}
      </div>

      <style>{`
        .orders-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .orders-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .order-card {
          padding: 0 !important;
          overflow: hidden;
        }

        .order-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          background: rgba(255, 255, 255, 0.01);
          border-bottom: 1px solid var(--border-color);
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-meta {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .order-id {
          font-size: 0.95rem;
          color: var(--text-muted);
        }

        .order-date {
          font-size: 0.8rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }

        .order-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 0.3rem 0.6rem;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .status-pending {
          background: rgba(245, 158, 11, 0.1);
          color: var(--warning);
        }

        .status-shipped {
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent);
        }

        .status-delivered {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
        }

        .order-card-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .order-items-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.015);
          border-radius: 10px;
          padding: 1rem;
          border: 1px solid var(--border-color);
        }

        .order-item-spec {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.95rem;
        }

        .item-name-qty {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .qty-tag {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--primary);
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.15);
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
        }

        .order-details-summary {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 1.5rem;
          border-top: 1px dashed var(--border-color);
          padding-top: 1.25rem;
        }

        .shipping-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          max-width: 450px;
        }

        .shipping-info .label {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
        }

        .shipping-info .address {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .order-total {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .order-total .label {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
        }

        .order-total .amount {
          font-size: 1.35rem;
          font-weight: 750;
        }

        .inline-icon {
          margin-right: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default OrderHistory;
