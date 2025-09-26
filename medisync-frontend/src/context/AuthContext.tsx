// src/context/AuthContext.tsx
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

// This defines the shape of the user data we will get from the token
interface User {
  id: string;
  role: 'user' | 'admin';
}

// This defines what our context will provide
interface IAuthContext {
  token: string | null;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // This runs once when the app loads to check if a token exists in storage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const decoded = jwtDecode<{ user: User }>(storedToken);
      setToken(storedToken);
      setUser(decoded.user);
    }
  }, []);

  const login = (newToken: string) => {
    const decoded = jwtDecode<{ user: User }>(newToken);
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(decoded.user);
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

// This is a helper hook to easily access the context from any component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};