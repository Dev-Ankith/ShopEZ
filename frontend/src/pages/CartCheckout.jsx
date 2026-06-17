import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import API from '../services/api.js';
import { ShoppingCart, MapPin, CreditCard, CheckCircle, Trash2, ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react';

const CartCheckout = () => {
  const { cartItems, cartTotal, updateCartQuantity, removeFromCart, clearCart } = useCart();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Step control: 'CART', 'SHIPPING', 'CONFIRMATION'
  const [step, setStep] = useState('CART');

  // Shipping form states
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  
  // Checkout process states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  const handleProceedToShipping = () => {
    if (cartItems.length === 0) return;
    setStep('SHIPPING');
  };

  const handlePlaceOrderSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!street || !city || !state || !zip) {
      setErrorMsg('Please fill in all shipping details.');
      return;
    }

    setLoading(true);
    try {
      // Map cart items to API format
      const itemsPayload = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const shippingPayload = { street, city, state, zip };

      const res = await API.post('/api/orders/checkout', {
        items: itemsPayload,
        shippingAddress: shippingPayload
      });

      if (res.data.success) {
        setPlacedOrder(res.data.data);
        clearCart(); // Clear local shopping cart
        await refreshUser(); // Refresh user information after checkout
        setStep('CONFIRMATION');
      }
    } catch (err) {
      console.error('Checkout failed:', err.message);
      setErrorMsg(err.response?.data?.message || 'Failed to place order. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value) => `$${value.toFixed(2)}`;

  // Total discounts computation
  const originalSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountSaved = originalSubtotal - cartTotal;

  return (
    <div className="checkout-page animate-fade-in">
      {/* Checkout Progress Steps indicator */}
      <div className="checkout-progress-stepper">
        <div className={`step-node ${step === 'CART' ? 'active' : ''} ${step !== 'CART' ? 'completed' : ''}`}>
          <div className="step-num">1</div>
          <span>Review Cart</span>
        </div>
        <div className="step-divider"></div>
        <div className={`step-node ${step === 'SHIPPING' ? 'active' : ''} ${step === 'CONFIRMATION' ? 'completed' : ''}`}>
          <div className="step-num">2</div>
          <span>Shipping & Payment</span>
        </div>
        <div className="step-divider"></div>
        <div className={`step-node ${step === 'CONFIRMATION' ? 'active' : ''}`}>
          <div className="step-num">3</div>
          <span>Confirmation</span>
        </div>
      </div>

      {/* STEP 1: CART REVIEW */}
      {step === 'CART' && (
        <div className="grid-3-2 checkout-content-grid">
          {/* Cart items list */}
          <div className="glass-card cart-review-card">
            <h3>Your Shopping Cart ({cartItems.length} unique items)</h3>
            
            <div className="cart-items-scroller">
              {cartItems.map(item => {
                const discPrice = item.price * (1 - (item.discountPercent / 100));
                return (
                  <div key={item.productId} className="cart-item-row">
                    <div className="item-img-container">
                      <img src={item.imageUrl} alt={item.name} />
                    </div>
                    
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      {item.discountPercent > 0 ? (
                        <div className="price-row">
                          <span className="sale-price">{formatPrice(discPrice)}</span>
                          <span className="orig-price">{formatPrice(item.price)}</span>
                        </div>
                      ) : (
                        <span className="sale-price">{formatPrice(item.price)}</span>
                      )}
                    </div>

                    <div className="item-qty-control">
                      <label htmlFor={`qty-${item.productId}`} style={{ display: 'none' }}>Quantity</label>
                      <select
                        id={`qty-${item.productId}`}
                        className="form-input qty-dropdown"
                        value={item.quantity}
                        onChange={(e) => updateCartQuantity(item.productId, parseInt(e.target.value, 10))}
                      >
                        {Array.from({ length: Math.min(10, item.inventory) }, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.productId)}
                      className="btn-trash"
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
              {cartItems.length === 0 && (
                <div className="text-center text-muted" style={{ padding: '3rem 0' }}>
                  <ShoppingCart size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                  <p>Your shopping cart is empty.</p>
                  <Link to="/" className="btn btn-primary btn-sm mt-4">Start Shopping</Link>
                </div>
              )}
            </div>
          </div>

          {/* Cart Pricing summary */}
          {cartItems.length > 0 && (
            <div className="glass-card summary-card">
              <h3>Order Pricing</h3>
              <div className="pricing-breakdown">
                <div className="pricing-row">
                  <span>Subtotal:</span>
                  <span>{formatPrice(originalSubtotal)}</span>
                </div>
                {discountSaved > 0 && (
                  <div className="pricing-row text-success font-semibold">
                    <span>Discounts Saved:</span>
                    <span>-{formatPrice(discountSaved)}</span>
                  </div>
                )}
                <div className="pricing-row">
                  <span>Shipping:</span>
                  <span className="text-success">FREE</span>
                </div>
                <div className="pricing-row total-row">
                  <span>Total Amount:</span>
                  <span className="text-primary font-bold">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <button 
                onClick={handleProceedToShipping}
                className="btn btn-primary w-full gap-2 mt-4"
              >
                <span>Proceed to Shipping Address</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: SHIPPING & PAYMENT */}
      {step === 'SHIPPING' && (
        <form onSubmit={handlePlaceOrderSubmit} className="grid-3-2 checkout-content-grid">
          {/* Shipping Address form details */}
          <div className="glass-card address-form-card">
            <h3>
              <MapPin size={18} className="text-primary inline" />
              <span>Shipping Information</span>
            </h3>

            {errorMsg && <div className="checkout-alert error">{errorMsg}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="street">Street Address</label>
              <input
                id="street"
                type="text"
                className="form-input"
                placeholder="123 Main Street, Apt 4B"
                value={street}
                required
                onChange={(e) => setStreet(e.target.value)}
              />
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label" htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  className="form-input"
                  placeholder="San Francisco"
                  value={city}
                  required
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="state">State</label>
                <input
                  id="state"
                  type="text"
                  className="form-input"
                  placeholder="CA"
                  value={state}
                  required
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="zip">ZIP Code</label>
                <input
                  id="zip"
                  type="text"
                  className="form-input"
                  placeholder="94103"
                  value={zip}
                  required
                  onChange={(e) => setZip(e.target.value)}
                />
              </div>
            </div>

            <h3 style={{ marginTop: '2rem' }}>
              <CreditCard size={18} className="text-primary inline" />
              <span>Simulated Payment Gateway</span>
            </h3>
            
            <div className="credit-card-simulation glass-card">
              <div className="credit-card-logo">ShopEZ Pay</div>
              <div className="credit-card-number">•••• •••• •••• 8888</div>
              <div className="credit-card-details">
                <div className="detail">
                  <span className="label">Card Holder</span>
                  <span className="val">@{user.username}</span>
                </div>
                <div className="detail">
                  <span className="label">Expiry</span>
                  <span className="val">12 / 30</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment summary & Wallet Validation */}
          <div className="glass-card summary-card">
            <h3>Final Order Review</h3>
            
            <div className="pricing-breakdown">
              <div className="pricing-row total-row">
                <span>Total Charge:</span>
                <span className="text-primary font-bold">{formatPrice(cartTotal)}</span>
              </div>

            </div>



            <div className="action-buttons-column">
              <button 
                type="submit" 
                className="btn btn-success w-full gap-2"
                disabled={loading}
              >
                <span>{loading ? 'Processing Order...' : 'Confirm & Place Order'}</span>
                {!loading && <ShoppingBag size={18} />}
              </button>

              <button 
                type="button" 
                onClick={() => setStep('CART')}
                className="btn btn-secondary w-full gap-2"
              >
                <ArrowLeft size={16} />
                <span>Go Back to Cart</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* STEP 3: SUCCESS CONFIRMATION */}
      {step === 'CONFIRMATION' && placedOrder && (
        <div className="glass-card confirmation-card animate-fade-in text-center">
          <div className="success-icon-container">
            <CheckCircle size={72} className="text-success" />
          </div>
          
          <h2>Order Confirmed!</h2>
          <p className="subtitle">Thank you for your purchase. Your order has been placed successfully.</p>
          
          <div className="receipt-box glass-card">
            <div className="receipt-row">
              <span className="label">Receipt ID:</span>
              <span className="val font-semibold text-primary">{placedOrder._id}</span>
            </div>
            <div className="receipt-row">
              <span className="label">Status:</span>
              <span className="status-pill pending">PENDING SHIPMENT</span>
            </div>
            <div className="receipt-row">
              <span className="label">Total Paid:</span>
              <span className="val font-bold text-success">${placedOrder.totalAmount.toFixed(2)}</span>
            </div>
            <div className="receipt-row">
              <span className="label">Shipping To:</span>
              <span className="val text-right">
                {placedOrder.shippingAddress.street}, {placedOrder.shippingAddress.city}, {placedOrder.shippingAddress.state} {placedOrder.shippingAddress.zip}
              </span>
            </div>
          </div>

          <div className="receipt-actions">
            <button onClick={() => navigate('/')} className="btn btn-primary">
              Continue Shopping
            </button>
            <button onClick={() => navigate('/orders')} className="btn btn-secondary">
              View Order History
            </button>
          </div>
        </div>
      )}

      <style>{`
        .checkout-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .checkout-progress-stepper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 1rem;
        }

        .step-node {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-weight: 500;
          font-size: 0.95rem;
        }

        .step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .step-node.active {
          color: var(--primary);
        }

        .step-node.active .step-num {
          background: var(--primary);
          border-color: var(--primary);
          color: #0b0f19;
          box-shadow: 0 0 10px var(--primary-glow);
        }

        .step-node.completed {
          color: var(--success);
        }

        .step-node.completed .step-num {
          background: var(--success);
          border-color: var(--success);
          color: white;
        }

        .step-divider {
          width: 50px;
          height: 1px;
          background: var(--border-color);
        }

        .checkout-content-grid {
          align-items: start;
        }

        .cart-items-scroller {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }

        .cart-item-row {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 0.85rem 1.25rem;
        }

        .item-img-container {
          width: 56px;
          height: 56px;
          border-radius: 8px;
          overflow: hidden;
          background: #0d121f;
          border: 1px solid var(--border-color);
          flex-shrink: 0;
        }

        .item-img-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-info {
          flex: 1;
        }

        .item-info h4 {
          font-size: 0.95rem;
          color: white;
          margin-bottom: 0.25rem;
          line-height: 1.3;
        }

        .price-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sale-price {
          font-weight: 700;
          color: white;
          font-size: 0.95rem;
        }

        .orig-price {
          text-decoration: line-through;
          color: var(--text-muted);
          font-size: 0.8rem;
        }

        .qty-dropdown {
          padding: 0.4rem 1.5rem 0.4rem 0.6rem !important;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .btn-trash {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .btn-trash:hover {
          color: var(--danger);
        }

        .pricing-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .pricing-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .pricing-row.total-row {
          border-top: 1px solid var(--border-color);
          padding-top: 0.75rem;
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
        }

        .checkout-alert {
          padding: 0.75rem 1.25rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          text-align: center;
        }

        .checkout-alert.error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--danger);
        }

        .credit-card-simulation {
          margin-top: 1rem;
          background: linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
          padding: 1.5rem !important;
          height: 180px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
        }

        .credit-card-logo {
          font-weight: 700;
          font-style: italic;
          font-size: 1.1rem;
          color: var(--primary);
        }

        .credit-card-number {
          font-size: 1.35rem;
          letter-spacing: 0.08em;
          color: white;
          font-family: monospace;
        }

        .credit-card-details {
          display: flex;
          justify-content: space-between;
        }

        .credit-card-details .detail {
          display: flex;
          flex-direction: column;
        }

        .credit-card-details .label {
          font-size: 0.65rem;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .credit-card-details .val {
          font-size: 0.85rem;
          font-weight: 600;
          color: white;
        }

        .insufficient-funds-banner {
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.2);
          color: var(--warning);
          font-size: 0.85rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-top: 1.25rem;
          text-align: center;
          line-height: 1.4;
        }

        .action-buttons-column {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .confirmation-card {
          max-width: 550px;
          margin: 2rem auto;
          padding: 3rem !important;
        }

        .success-icon-container {
          margin-bottom: 1.5rem;
        }

        .receipt-box {
          background: rgba(255, 255, 255, 0.01) !important;
          border-color: var(--border-color) !important;
          margin: 1.5rem 0 !important;
          padding: 1.25rem !important;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .receipt-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }

        .receipt-row .label {
          color: var(--text-muted);
        }

        .receipt-row .val {
          color: white;
        }

        .status-pill {
          display: inline-block;
          font-size: 0.75rem;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .status-pill.pending {
          background: rgba(245, 158, 11, 0.1);
          color: var(--warning);
        }

        .receipt-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .inline { display: inline-block; vertical-align: middle; margin-right: 0.35rem; }
        .pt-4 { padding-top: 0.75rem; }
      `}</style>
    </div>
  );
};

export default CartCheckout;
