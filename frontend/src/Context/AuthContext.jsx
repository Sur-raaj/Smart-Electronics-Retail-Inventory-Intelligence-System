import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check local storage on load to persist login state
    const storedUser = localStorage.getItem('customer_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('customer_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('customer_user');
  };

  const isOwner = user?.role === 'owner';

  return (
    <AuthContext.Provider value={{ user, login, logout, isOwner }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
