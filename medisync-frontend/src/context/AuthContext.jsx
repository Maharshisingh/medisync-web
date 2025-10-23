// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        setToken(storedToken);
        setUser(decoded.user);
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = (newToken) => {
    try {
      const decoded = jwtDecode(newToken);
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(decoded.user);
    } catch (error) {
      console.error('Invalid token during login:', error);
      throw new Error('Invalid token received');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};