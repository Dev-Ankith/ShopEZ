import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { Search, ShoppingCart, Star, Heart, ArrowUpRight, Percent } from 'lucide-react';

const Catalog = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Fetch product catalog items
  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Build query string params
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (sortBy) {
        params.sortBy = sortBy;
        params.order = order;
      }

      const [productsRes, categoriesRes] = await Promise.all([
        API.get('/api/products', { params }),
        API.get('/api/products/categories')
      ]);

      if (productsRes.data.success) {
        setProducts(productsRes.data.data);
      }
      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load products list:', err.message);
      setError('Failed to load catalog. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, order]);

  // Handle search with custom debouncer or key click
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const renderStars = (rating) => {
    const stars = [];
    const floorRating = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={14} 
          fill={i <= rating ? 'var(--primary)' : 'transparent'} 
          color={i <= rating ? 'var(--primary)' : 'rgba(255, 255, 255, 0.2)'} 
        />
      );
    }
    return <div className="star-rating">{stars}</div>;
  };

  return (
    <div className="catalog-page animate-fade-in">
      {/* Category selector row */}
      <div className="category-filter-row">
        <button 
          className={`category-tag ${selectedCategory === '' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('')}
        >
          All Categories
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            className={`category-tag ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Catalog search and sorting bar */}
      <div className="filter-sorting-bar glass-card">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div className="sort-controls">
          <label className="form-label sort-label" htmlFor="sort">Sort By:</label>
          <select 
            id="sort"
            className="form-input sort-select"
            value={`${sortBy}-${order}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split('-');
              setSortBy(field);
              setOrder(dir);
            }}
          >
            <option value="createdAt-desc">Newest Listings</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="averageRating-desc">Top Rated</option>
            <option value="discountPercent-desc">Biggest Discounts</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="text-muted">Loading product catalog...</p>
        </div>
      ) : error ? (
        <div className="glass-card text-center" style={{ padding: '3rem' }}>
          <p className="text-danger">{error}</p>
          <button onClick={fetchProducts} className="btn btn-primary mt-4">Retry</button>
        </div>
      ) : (
        <div className="grid-4 products-grid">
          {products.map(product => {
            const hasDiscount = product.discountPercent > 0;
            const finalPrice = product.price * (1 - (product.discountPercent / 100));

            return (
              <div key={product._id} className="product-card glass-card">
                <div 
                  className="product-image-container"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="product-image"
                    loading="lazy"
                  />
                  {hasDiscount && (
                    <div className="discount-badge">
                      <Percent size={12} style={{ display: 'inline-block', marginRight: '2px' }} />
                      {product.discountPercent}% OFF
                    </div>
                  )}
                </div>

                <div className="product-details">
                  <span className="product-category">{product.category}</span>
                  <h3 
                    className="product-name"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    {product.name}
                  </h3>
                  
                  <div className="product-rating">
                    {renderStars(product.averageRating)}
                    <span className="review-count">({product.reviews?.length || 0})</span>
                  </div>

                  <div className="product-price-row">
                    <div className="price-container">
                      {hasDiscount && (
                        <span className="original-price">${product.price.toFixed(2)}</span>
                      )}
                      <span className="sale-price">${finalPrice.toFixed(2)}</span>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product, 1);
                      }}
                      className="btn btn-primary btn-icon"
                      disabled={product.inventory === 0}
                      title="Add to Cart"
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                  
                  {product.inventory === 0 && (
                    <span className="out-of-stock-alert">Out of Stock</span>
                  )}
                </div>
              </div>
            );
          })}
          {products.length === 0 && (
            <div className="no-products glass-card" style={{ gridColumn: '1 / -1', padding: '3rem', textAlignment: 'center' }}>
              <p className="text-muted">No products found matching your filter criteria.</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        .catalog-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .filter-sorting-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem !important;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .search-form {
          display: flex;
          align-items: center;
          position: relative;
          gap: 0.5rem;
          flex: 1;
          max-width: 500px;
        }

        .search-input {
          padding-left: 2.75rem !important;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .sort-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .sort-label {
          margin-bottom: 0;
          white-space: nowrap;
        }

        .sort-select {
          padding: 0.5rem 2rem 0.5rem 1rem !important;
          cursor: pointer;
        }

        .product-name:hover {
          color: var(--primary);
        }

        .btn-icon {
          width: 38px;
          height: 38px;
          padding: 0;
          border-radius: 50%;
        }

        .out-of-stock-alert {
          color: var(--danger);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-top: 0.5rem;
          letter-spacing: 0.05em;
        }

        .no-products {
          text-align: center;
        }

        .mt-4 {
          margin-top: 1rem;
        }

        @media (max-width: 768px) {
          .filter-sorting-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .search-form {
            max-width: 100%;
          }
          .sort-controls {
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default Catalog;
