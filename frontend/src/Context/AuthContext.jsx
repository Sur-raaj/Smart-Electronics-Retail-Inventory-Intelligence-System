import React, { createContext, useState, useContext, useEffect } from 'react';
import config from '../Config/Config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check for bypass auth in URL (for testing without backend)
    const params = new URLSearchParams(window.location.search);
    const bypassAuth = params.get('bypassAuth');

    let testUser = null;

    if (bypassAuth === 'owner') {
      testUser = {
        id: 1,
        firstName: 'Test',
        lastName: 'Owner',
        email: 'owner@test.com',
        role: 'owner'
      };
      localStorage.setItem('customer_user', JSON.stringify(testUser));
      localStorage.setItem('bypass_auth', 'owner');
      localStorage.setItem(config.AUTH_TOKEN_KEY, 'test_owner_token');
      setUser(testUser);
      setInitialized(true);
      return;
    } else if (bypassAuth === 'warehouse') {
      testUser = {
        id: 2,
        firstName: 'Test',
        lastName: 'Warehouse',
        email: 'warehouse@test.com',
        role: 'warehouse'
      };
      localStorage.setItem('customer_user', JSON.stringify(testUser));
      localStorage.setItem('bypass_auth', 'warehouse');
      localStorage.setItem(config.AUTH_TOKEN_KEY, 'test_warehouse_token');
      setUser(testUser);
      setInitialized(true);
      return;
    } else if (bypassAuth === 'admin') {
      testUser = {
        id: 3,
        firstName: 'Test',
        lastName: 'Admin',
        email: 'admin@test.com',
        role: 'admin'
      };
      localStorage.setItem('customer_user', JSON.stringify(testUser));
      localStorage.setItem('bypass_auth', 'admin');
      localStorage.setItem(config.AUTH_TOKEN_KEY, 'test_admin_token');
      setUser(testUser);
      setInitialized(true);
      return;
    }

    // Check if bypass was already set in localStorage (for persistence across navigation)
    const storedBypass = localStorage.getItem('bypass_auth');
    if (storedBypass === 'owner') {
      setUser({
        id: 1,
        firstName: 'Test',
        lastName: 'Owner',
        email: 'owner@test.com',
        role: 'owner'
      });
      setInitialized(true);
      return;
    } else if (storedBypass === 'warehouse') {
      setUser({
        id: 2,
        firstName: 'Test',
        lastName: 'Warehouse',
        email: 'warehouse@test.com',
        role: 'warehouse'
      });
      setInitialized(true);
      return;
    } else if (storedBypass === 'admin') {
      setUser({
        id: 3,
        firstName: 'Test',
        lastName: 'Admin',
        email: 'admin@test.com',
        role: 'admin'
      });
      setInitialized(true);
      return;
    }

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

    setInitialized(true);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('customer_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('customer_user');
    localStorage.removeItem('bypass_auth');
    localStorage.removeItem(config.AUTH_TOKEN_KEY);
    localStorage.removeItem(config.REFRESH_TOKEN_KEY);
  };

  const isOwner = user?.role === 'owner';
  const isWarehouse = user?.role === 'warehouse';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isOwner, isWarehouse, isAdmin, initialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
