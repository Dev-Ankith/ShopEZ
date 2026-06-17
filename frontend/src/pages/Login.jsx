import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShoppingBag, Mail, Lock, ArrowRight, Shield } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const { login, error: authError, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!email || !password) {
      setValidationError('Please enter both email and password.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    }
  };

  const handleQuickFill = (role) => {
    if (role === 'BUYER') {
      setEmail('buyer@shopez.com');
      setPassword('password123');
    } else if (role === 'SELLER') {
      setEmail('seller@shopez.com');
      setPassword('adminpassword');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card glass-card">
        <div className="login-header">
          <div className="logo-container">
            <ShoppingBag size={36} className="text-primary" />
          </div>
          <h1>ShopEZ <span className="text-primary">Store</span></h1>
          <p className="subtitle">Enter the future of virtual retail shopping</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {(validationError || authError) && (
            <div className="error-alert">
              {validationError || authError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="quick-test-section">
          <h3>⚡ Quick Test Accounts</h3>
          <div className="quick-buttons">
            <button 
              onClick={() => handleQuickFill('BUYER')} 
              className="btn btn-secondary btn-sm"
              type="button"
            >
              👤 Buyer Account
            </button>
            <button 
              onClick={() => handleQuickFill('SELLER')} 
              className="btn btn-secondary btn-sm"
              type="button"
            >
              <Shield size={14} className="text-danger" /> Seller Account
            </button>
          </div>
        </div>

        <div className="login-footer">
          Don't have an account? <Link to="/register" className="text-primary hover:underline">Register here</Link>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          padding: 2.5rem !important;
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-container {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .login-header h1 {
          font-size: 1.8rem;
          margin-bottom: 0.25rem;
        }

        .subtitle {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-bottom: 1.75rem;
        }

        .input-with-icon {
          position: relative;
        }

        .input-with-icon .form-input {
          padding-left: 2.75rem;
          width: 100%;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .error-alert {
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.3);
          color: var(--danger);
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.9rem;
          text-align: center;
        }

        .w-full {
          width: 100%;
        }

        .quick-test-section {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .quick-test-section h3 {
          font-size: 0.85rem;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
          font-weight: 600;
          text-align: center;
        }

        .quick-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .btn-sm {
          padding: 0.5rem 0.75rem;
          font-size: 0.85rem;
          border-radius: 8px;
        }

        .login-footer {
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .hover\:underline:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Login;
