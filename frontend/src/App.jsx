import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import NavBar from './components/NavBar.jsx';
import Catalog from './pages/Catalog.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import CartCheckout from './pages/CartCheckout.jsx';
import OrderHistory from './pages/OrderHistory.jsx';
import SellerDashboard from './pages/SellerDashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

// Simple global spinner component
const SessionLoading = () => (
  <div className="loading-container" style={{ minHeight: '100vh' }}>
    <div className="spinner"></div>
    <p className="text-muted">Restoring session...</p>
  </div>
);

// Unified Protected Route Guard verifying authentication and optional roles
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <SessionLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect if role is specified but does not match user role
  if (allowedRole && user.role !== allowedRole) {
    // If a seller tries to visit buyer page or vice-versa, redirect accordingly
    if (user.role === 'SELLER') {
      return <Navigate to="/seller" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="app-container">
            <NavBar />
            <main className="main-content">
              <Routes>
                {/* Public Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Buyer & Shared Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Catalog />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/product/:id"
                  element={
                    <ProtectedRoute>
                      <ProductDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute allowedRole="BUYER">
                      <CartCheckout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute allowedRole="BUYER">
                      <OrderHistory />
                    </ProtectedRoute>
                  }
                />

                {/* Seller Restricted Routes */}
                <Route
                  path="/seller"
                  element={
                    <ProtectedRoute allowedRole="SELLER">
                      <SellerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
