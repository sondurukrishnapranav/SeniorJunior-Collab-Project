import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // ✅ Use api instance headers instead of global axios
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile'); // ✅ Updated path
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      // ✅ Used api instance
      const response = await api.post('/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      // ✅ Set header on api instance
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { success: true, user }; 
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      // ✅ Used api instance
      const response = await api.post('/auth/register', userData);
      
      if (response.data.token) {
          const { token, user } = response.data;
          localStorage.setItem('token', token);
          setToken(token);
          setUser(user);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };
    
  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};