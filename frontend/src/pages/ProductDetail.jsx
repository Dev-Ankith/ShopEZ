import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { ArrowLeft, Star, ShoppingCart, MessageSquare, ShieldCheck, CheckCircle } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cart quantity selector
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  // Review Form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  const fetchProductDetails = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await API.get(`/api/products/${id}`);
      if (res.data.success) {
        setProduct(res.data.data);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to load product detail:', err.message);
      setError(err.response?.data?.message || 'Failed to retrieve product details.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 2000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSuccess('');
    setReviewError('');

    if (!comment.trim()) {
      setReviewError('Please write a review comment.');
      return;
    }

    setReviewLoading(true);
    try {
      const res = await API.post(`/api/products/${id}/reviews`, { rating, comment });
      if (res.data.success) {
        setReviewSuccess(res.data.message);
        setComment('');
        await fetchProductDetails(true); // reload silently
      }
    } catch (err) {
      console.error('Review submit failed:', err.message);
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const renderStars = (starCount, clickable = false, size = 16) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const filled = clickable 
        ? (hoverRating ? i <= hoverRating : i <= rating)
        : i <= starCount;
      
      stars.push(
        <Star 
          key={i} 
          size={size} 
          fill={filled ? 'var(--primary)' : 'transparent'} 
          color={filled ? 'var(--primary)' : 'rgba(255, 255, 255, 0.2)'}
          style={{ cursor: clickable ? 'pointer' : 'default', transition: 'color 0.1s ease' }}
          onClick={clickable ? () => setRating(i) : undefined}
          onMouseEnter={clickable ? () => setHoverRating(i) : undefined}
          onMouseLeave={clickable ? () => setHoverRating(0) : undefined}
        />
      );
    }
    return <div className="star-rating-row">{stars}</div>;
  };

  if (loading && !product) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="text-muted">Loading product details...</p>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="glass-card text-center" style={{ padding: '3rem' }}>
        <p className="text-danger" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>{error}</p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>
    );
  }

  const finalPrice = product.price * (1 - (product.discountPercent / 100));
  const hasDiscount = product.discountPercent > 0;
  const isOutOfStock = product.inventory === 0;

  return (
    <div className="product-detail-page animate-fade-in">
      <Link to="/" className="back-link-btn">
        <ArrowLeft size={16} />
        <span>Back to Shop Catalog</span>
      </Link>

      <div className="grid-2 main-detail-grid glass-card">
        {/* Left column: image */}
        <div className="detail-image-container">
          <img src={product.imageUrl} alt={product.name} className="detail-image" />
          {hasDiscount && (
            <div className="detail-discount-badge">{product.discountPercent}% OFF</div>
          )}
        </div>

        {/* Right column: product details */}
        <div className="detail-info-container">
          <span className="info-category">{product.category}</span>
          <h1>{product.name}</h1>
          
          <div className="info-rating-row">
            {renderStars(product.averageRating, false, 18)}
            <span className="info-rating-avg">{product.averageRating.toFixed(1)} / 5</span>
            <span className="text-muted">•</span>
            <span className="info-reviews-count">{product.reviews?.length || 0} reviews</span>
          </div>

          <div className="info-price-section">
            {hasDiscount && (
              <span className="info-original-price">${product.price.toFixed(2)}</span>
            )}
            <span className="info-sale-price">${finalPrice.toFixed(2)}</span>
          </div>

          <p className="info-description">{product.description}</p>

          <div className="info-inventory-status">
            <span>Availability:</span>
            {isOutOfStock ? (
              <span className="text-danger font-bold">Out of Stock</span>
            ) : (
              <span className="text-success font-bold">In Stock ({product.inventory} items remaining)</span>
            )}
          </div>

          {/* Add to Cart widget */}
          {!isOutOfStock && (
            <div className="add-to-cart-widget">
              <div className="quantity-select">
                <label htmlFor="qty-select" className="form-label" style={{ display: 'none' }}>Quantity</label>
                <select 
                  id="qty-select"
                  className="form-input qty-input"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                >
                  {Array.from({ length: Math.min(10, product.inventory) }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleAddToCart}
                className="btn btn-primary flex-1 gap-2"
              >
                <ShoppingCart size={18} />
                <span>Add to Shopping Cart</span>
              </button>
            </div>
          )}

          {addedMessage && (
            <div className="added-success-alert animate-fade-in">
              <CheckCircle size={16} />
              <span>Added to Cart!</span>
            </div>
          )}

          <div className="info-guarantee">
            <ShieldCheck size={16} className="text-primary" />
            <span>Simulated storefront transaction checkout.</span>
          </div>
        </div>
      </div>

      {/* Review section */}
      <div className="grid-3-2 reviews-write-grid">
        {/* Left: list of reviews */}
        <div className="glass-card reviews-list-card">
          <h3>Customer Feedback ({product.reviews?.length || 0})</h3>
          
          <div className="reviews-scroller">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev, index) => (
                <div key={index} className="review-item-card">
                  <div className="review-header">
                    <span className="username">@{rev.username}</span>
                    <span className="date text-muted">{new Date(rev.timestamp || rev.date).toLocaleDateString()}</span>
                  </div>
                  {renderStars(rev.rating, false, 14)}
                  <p className="comment">{rev.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center text-muted" style={{ padding: '3rem 0' }}>
                <MessageSquare size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p>No reviews posted yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: write a review */}
        <div className="glass-card write-review-card">
          <h3>Write a Product Review</h3>
          
          {user && user.role === 'BUYER' ? (
            <form onSubmit={handleReviewSubmit} className="review-form">
              {reviewSuccess && <div className="review-alert success">{reviewSuccess}</div>}
              {reviewError && <div className="review-alert error">{reviewError}</div>}

              <div className="form-group">
                <span className="form-label">Star Rating</span>
                {renderStars(rating, true, 26)}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="review-comment">Review Commentary</label>
                <textarea
                  id="review-comment"
                  className="form-input review-textarea"
                  rows="4"
                  placeholder="Share your experience using this product..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-accent w-full"
                disabled={reviewLoading}
              >
                {reviewLoading ? 'Submitting Review...' : 'Post Review'}
              </button>
            </form>
          ) : (
            <div className="review-blocked-note">
              <p className="text-muted text-center">
                {user && user.role === 'SELLER' 
                  ? 'Sellers cannot write product review feedbacks.' 
                  : 'Please sign in to write product reviews.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .product-detail-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .back-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
          width: fit-content;
        }

        .back-link-btn:hover {
          color: white;
        }

        .main-detail-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          padding: 2.5rem !important;
          align-items: center;
        }

        @media (min-width: 768px) {
          .main-detail-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .detail-image-container {
          position: relative;
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          background: #0d121f;
          border: 1px solid var(--border-color);
        }

        .detail-image {
          width: 100%;
          height: auto;
          max-height: 400px;
          object-fit: cover;
          display: block;
        }

        .detail-discount-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: var(--danger);
          color: white;
          font-weight: 750;
          font-size: 0.9rem;
          padding: 0.3rem 0.75rem;
          border-radius: 6px;
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
        }

        .detail-info-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .info-category {
          color: var(--primary);
          font-size: 0.8rem;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.08em;
          line-height: 1;
        }

        .detail-info-container h1 {
          font-size: 2.2rem;
          color: white;
          line-height: 1.15;
          margin-bottom: 0;
        }

        .info-rating-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .star-rating-row {
          display: inline-flex;
          gap: 0.15rem;
        }

        .info-rating-avg {
          font-weight: 600;
          color: white;
        }

        .info-price-section {
          display: flex;
          align-items: baseline;
          gap: 1rem;
        }

        .info-original-price {
          font-size: 1.1rem;
          color: var(--text-muted);
          text-decoration: line-through;
        }

        .info-sale-price {
          font-size: 2.2rem;
          font-weight: 850;
          color: white;
          line-height: 1;
        }

        .info-description {
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .info-inventory-status {
          font-size: 0.9rem;
          display: flex;
          gap: 0.5rem;
        }

        .add-to-cart-widget {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .qty-input {
          cursor: pointer;
          font-weight: 600;
          padding: 0.75rem 2rem 0.75rem 1rem !important;
        }

        .flex-1 {
          flex: 1;
        }

        .added-success-alert {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: var(--success);
          padding: 0.6rem 1rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .info-guarantee {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.5rem;
        }

        .reviews-write-grid {
          align-items: start;
        }

        .reviews-scroller {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 400px;
          overflow-y: auto;
          margin-top: 1rem;
          padding-right: 0.25rem;
        }

        .review-item-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 1rem;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          margin-bottom: 0.25rem;
        }

        .review-header .username {
          font-weight: 600;
          color: white;
        }

        .review-item-card .comment {
          margin-top: 0.5rem;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.5;
        }

        .review-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }

        .review-textarea {
          resize: none;
          font-size: 0.95rem;
        }

        .review-alert {
          padding: 0.6rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          text-align: center;
        }

        .review-alert.success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: var(--success);
        }

        .review-alert.error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--danger);
        }

        .review-blocked-note {
          padding: 2.5rem 1rem;
          background: rgba(255, 255, 255, 0.01);
          border: 1px dashed var(--border-color);
          border-radius: 10px;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
