import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import type { User, LoginRequest } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await authAPI.login(credentials);
    localStorage.setItem('access_token', response.access_token);
    setToken(response.access_token);

    // Fetch full user profile from API
    try {
      const fullUserData = await authAPI.getCurrentUser();
      localStorage.setItem('user', JSON.stringify(fullUserData));
      setUser(fullUserData);
    } catch (error) {
      // Fallback to token data if API call fails
      const decodedToken = JSON.parse(atob(response.access_token.split('.')[1]));
      const userData: User = {
        id: decodedToken.sub,
        username: decodedToken.username,
        email: '',
        role: { id: 0, name: decodedToken.role, created_at: '' },
        role_id: 0,
        is_active: true,
        created_at: '',
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role?.name === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isAdmin }}>
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
