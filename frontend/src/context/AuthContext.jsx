import { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile on app mount if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('shopez_stocks_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get('/api/auth/me');
        if (res.data.success) {
          setUser(res.data.data);
        } else {
          localStorage.removeItem('shopez_stocks_token');
        }
      } catch (err) {
        console.error('Session restore failed:', err.response?.data?.message || err.message);
        localStorage.removeItem('shopez_stocks_token');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Register User
  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post('/api/auth/register', { username, email, password });
      if (res.data.success) {
        const userData = res.data.data;
        localStorage.setItem('shopez_stocks_token', userData.token);
        setUser({
          _id: userData._id,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          balance: userData.balance
        });
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Login User
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post('/api/auth/login', { email, password });
      if (res.data.success) {
        const userData = res.data.data;
        localStorage.setItem('shopez_stocks_token', userData.token);
        setUser({
          _id: userData._id,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          balance: userData.balance
        });
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Invalid credentials.';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem('shopez_stocks_token');
    setUser(null);
  };

  // Sync user cash balance & state from DB (called after stock trades)
  const refreshUser = async () => {
    try {
      const res = await API.get('/api/auth/me');
      if (res.data.success) {
        setUser(res.data.data);
      }
    } catch (err) {
      console.error('Failed to sync user state:', err.message);
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
