import React, { createContext, useState, useContext, useEffect } from 'react';
import config from '../Config/Config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check local storage on load to persist login state
    const storedUser = localStorage.getItem('customer_user');
    const token = localStorage.getItem(config.AUTH_TOKEN_KEY);
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
        // Clear corrupted data
        localStorage.removeItem('customer_user');
        localStorage.removeItem(config.AUTH_TOKEN_KEY);
        localStorage.removeItem(config.REFRESH_TOKEN_KEY);
      }
    } else {
      // If token is missing but user exists (or vice versa), clear both
      localStorage.removeItem('customer_user');
      localStorage.removeItem(config.AUTH_TOKEN_KEY);
      localStorage.removeItem(config.REFRESH_TOKEN_KEY);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('customer_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('customer_user');
    localStorage.removeItem(config.AUTH_TOKEN_KEY);
    localStorage.removeItem(config.REFRESH_TOKEN_KEY);
  };

  const isOwner = user?.role === 'owner';

  return (
    <AuthContext.Provider value={{ user, login, logout, isOwner }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
