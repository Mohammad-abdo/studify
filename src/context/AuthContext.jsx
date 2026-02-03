import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const checkAuthStarted = useRef(false);
  const loginInProgress = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    // Avoid duplicate profile calls (e.g. React Strict Mode double-mount)
    if (checkAuthStarted.current) return;
    checkAuthStarted.current = true;
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/profile');
      const userData = response.data.data;
      // لوحة الإدارة للمسؤولين فقط — رفض أي نوع مستخدم آخر
      if (userData?.type !== 'ADMIN') {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone, password) => {
    if (loginInProgress.current) {
      return { success: false, error: 'Please wait...' };
    }
    loginInProgress.current = true;
    try {
      const response = await api.post('/auth/login', { phone, password });
      const { token, user: userData } = response.data.data;
      // لوحة الإدارة للمسؤولين فقط — رفض الدخول لأي نوع مستخدم آخر
      if (userData?.type !== 'ADMIN') {
        return {
          success: false,
          error: 'ADMIN_ONLY',
        };
      }
      localStorage.setItem('token', token);
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message;
      if (status === 429) {
        return {
          success: false,
          error: 'TOO_MANY_REQUESTS',
        };
      }
      return {
        success: false,
        error: message || 'Login failed',
      };
    } finally {
      loginInProgress.current = false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};