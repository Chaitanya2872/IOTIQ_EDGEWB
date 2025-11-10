import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { 
  checkAuthStatus, 
  clearAuth, 
  signIn, 
  signUp, 
  storeAuth, 
  forceValidateAuth,
  type SignInRequest, 
  type SignUpRequest 
} from '../api/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  validating: boolean;  // NEW: Track background validation
  login: (credentials: SignInRequest) => Promise<void>;
  register: (userData: SignUpRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  forceValidate: () => Promise<void>;  // NEW: Force validation
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
  const [validating, setValidating] = useState(false);

  // ============================================================================
  // OPTIMIZED: Fast initial auth check
  // ============================================================================
  const checkAuth = async () => {
    try {
      // This is now fast - uses cache if available
      const authStatus = await checkAuthStatus();
      
      setIsAuthenticated(authStatus.isAuthenticated);
      setUser(authStatus.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // ============================================================================
  // NEW: Force validation (for manual refresh)
  // ============================================================================
  const forceValidate = async () => {
    try {
      setValidating(true);
      console.log('🔄 Force validating token...');
      
      const authStatus = await forceValidateAuth();
      
      setIsAuthenticated(authStatus.isAuthenticated);
      setUser(authStatus.user);
      
      if (!authStatus.isAuthenticated) {
        console.log('❌ Validation failed, user logged out');
      } else {
        console.log('✅ Token validated successfully');
      }
    } catch (error) {
      console.error('Force validation failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setValidating(false);
    }
  };

  // ============================================================================
  // OPTIMIZED: Fast initial load
  // ============================================================================
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      // If no token, skip backend call entirely
      if (!token || token === 'undefined') {
        console.log('⚡ No token found, rendering login page');
        setLoading(false);
        return;
      }

      // Load cached user data immediately
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        try {
          const userData = JSON.parse(cachedUser);
          setUser(userData);
          setIsAuthenticated(true);
          console.log('⚡ Loaded cached user, rendering app immediately');
        } catch (e) {
          console.warn('Failed to parse cached user');
        }
      }

      // Render app immediately, validate in background
      setLoading(false);

      // Background validation (doesn't block UI)
      console.log('🔄 Background auth validation...');
      await checkAuth();
    };

    initAuth();
  }, []);

  // ============================================================================
  // Auth actions
  // ============================================================================
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
    
    // Clear all caches on logout
    if (typeof window !== 'undefined' && (window as any).clearAllCaches) {
      (window as any).clearAllCaches();
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    validating,
    login,
    register,
    logout,
    checkAuth,
    forceValidate
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};