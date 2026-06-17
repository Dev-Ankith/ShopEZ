import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { ShoppingBag, Wallet, LogOut, LayoutGrid, ClipboardList, Shield, ShoppingCart } from 'lucide-react';

const NavBar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <Link to="/" className="nav-brand">
          <ShoppingBag size={26} className="text-primary animate-pulse" />
          <span className="brand-text">Shop<span className="text-primary">EZ</span></span>
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <LayoutGrid size={18} />
            <span>Catalog</span>
          </Link>
          
          {user.role === 'BUYER' && (
            <Link to="/orders" className={`nav-link ${isActive('/orders') ? 'active' : ''}`}>
              <ClipboardList size={18} />
              <span>My Orders</span>
            </Link>
          )}

          {user.role === 'SELLER' && (
            <Link to="/seller" className={`nav-link ${isActive('/seller') ? 'active' : ''} seller-link`}>
              <Shield size={18} />
              <span>Seller Panel</span>
            </Link>
          )}
        </div>

        <div className="nav-profile">
          {user.role === 'BUYER' && (
            <Link to="/checkout" className={`cart-badge-button ${isActive('/checkout') ? 'active' : ''}`} title="View Cart">
              <ShoppingCart size={18} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          )}



          <div className="user-info">
            <span className="username">@{user.username}</span>
            <span className="role-tag">{user.role}</span>
          </div>

          <button onClick={handleLogout} className="btn-logout" title="Log Out">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <style>{`
        .navbar-container {
          background: rgba(13, 20, 32, 0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 0.75rem 1.5rem;
        }

        .navbar-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: white;
          font-weight: 800;
          font-size: 1.4rem;
        }

        .brand-text {
          letter-spacing: -0.03em;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          text-decoration: none;
          padding: 0.6rem 1rem;
          border-radius: 10px;
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.04);
        }

        .nav-link.active {
          color: white;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.25);
        }

        .seller-link.active {
          background: rgba(59, 130, 246, 0.12);
          border-color: rgba(59, 130, 246, 0.25);
        }

        .nav-profile {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .cart-badge-button {
          position: relative;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .cart-badge-button:hover, .cart-badge-button.active {
          color: white;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .cart-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: var(--danger);
          color: white;
          font-size: 0.7rem;
          font-weight: 750;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
        }

        .balance-badge {
          background: rgba(245, 158, 11, 0.06);
          border: 1px solid rgba(245, 158, 11, 0.2);
          padding: 0.5rem 0.85rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .balance-label {
          color: var(--text-muted);
          font-weight: 400;
        }

        .balance-amount {
          color: var(--primary);
          font-weight: 600;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          line-height: 1.2;
        }

        .username {
          font-weight: 600;
          font-size: 0.95rem;
          color: white;
        }

        .role-tag {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .btn-logout {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-logout:hover {
          color: var(--danger);
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.2);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.03); }
        }

        .animate-pulse {
          animation: pulse 3s infinite ease-in-out;
        }

        @media (max-width: 768px) {
          .navbar-content {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          
          .nav-links {
            justify-content: center;
          }

          .nav-profile {
            justify-content: space-between;
          }
        }
      `}</style>
    </nav>
  );
};

export default NavBar;
