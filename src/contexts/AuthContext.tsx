import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { checkAuthStatus, clearAuth, signIn, signUp, storeAuth, type SignInRequest, type SignUpRequest } from '../api/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  login: (credentials: SignInRequest) => Promise<void>;
  register: (userData: SignUpRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const authStatus = await checkAuthStatus();
      
      setIsAuthenticated(authStatus.isAuthenticated);
      setUser(authStatus.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: SignInRequest) => {
    const authResponse = await signIn(credentials);
    storeAuth(authResponse);

    setIsAuthenticated(true);
    setUser({
      userId: authResponse.userId,
      fullName: authResponse.fullName,
      email: authResponse.email,
      roles: authResponse.roles
    });
  };

  const register = async (userData: SignUpRequest) => {
    const authResponse = await signUp(userData);
    storeAuth(authResponse);

    setIsAuthenticated(true);
    setUser({
      userId: authResponse.userId,
      fullName: authResponse.fullName,
      email: authResponse.email,
      roles: authResponse.roles
    });
  };

  const logout = () => {
    clearAuth();
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};