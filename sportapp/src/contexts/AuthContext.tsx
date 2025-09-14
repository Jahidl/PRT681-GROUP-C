import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  avatar?: string;
  addresses: Address[];
  preferences: UserPreferences;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface Address {
  id: string;
  type: 'billing' | 'shipping';
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserPreferences {
  newsletter: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  showAuthModal: boolean;
  authMode: 'login' | 'register' | 'forgot-password';
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SHOW_AUTH_MODAL'; payload: 'login' | 'register' | 'forgot-password' }
  | { type: 'HIDE_AUTH_MODAL' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOAD_USER'; payload: User };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  openAuthModal: (mode: 'login' | 'register' | 'forgot-password') => void;
  hideAuthModal: () => void;
  clearError: () => void;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptTerms: boolean;
  newsletter?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        showAuthModal: false
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };

    case 'SHOW_AUTH_MODAL':
      return {
        ...state,
        showAuthModal: true,
        authMode: action.payload,
        error: null
      };

    case 'HIDE_AUTH_MODAL':
      return {
        ...state,
        showAuthModal: false,
        error: null
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    case 'LOAD_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false
      };

    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  showAuthModal: false,
  authMode: 'login'
};

// API configuration - use environment variable or fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Real API functions
const authAPI = {
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailAddress: email,
          password: password
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform API response to User interface
      const user: User = {
        id: data.user.id,
        email: data.user.emailAddress,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phone: data.user.phoneNumber || '',
        addresses: [],
        preferences: {
          newsletter: false,
          smsNotifications: false,
          emailNotifications: true,
          currency: 'USD',
          language: 'en',
          theme: 'auto'
        },
        createdAt: new Date(),
        lastLoginAt: new Date()
      };

      // Store JWT access token
      if (data.accessToken) {
        localStorage.setItem('sportapp-token', data.accessToken);
      }

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred during login');
    }
  },

  async register(userData: RegisterData): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phone || '',
          emailAddress: userData.email,
          password: userData.password,
          confirmPassword: userData.password // Using same password for confirmPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Registration failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform API response to User interface
      const user: User = {
        id: data.id || data.userId || Date.now().toString(),
        email: data.emailAddress || data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phoneNumber || data.phone,
        addresses: data.addresses || [],
        preferences: {
          newsletter: userData.newsletter || false,
          smsNotifications: false,
          emailNotifications: true,
          currency: 'USD',
          language: 'en',
          theme: 'auto'
        },
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        lastLoginAt: new Date()
      };

      // Store JWT token if provided
      if (data.token) {
        localStorage.setItem('sportapp-token', data.token);
      }

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred during registration');
    }
  },

  async updateUser(_userId: string, userData: Partial<User>): Promise<User> {
    try {
      const token = localStorage.getItem('sportapp-token');
      const response = await fetch(`${API_BASE_URL}/user/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Update failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred during update');
    }
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailAddress: email
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Password reset failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred during password reset');
    }
  },

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          password: password
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Password reset failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred during password reset');
    }
  },

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('sportapp-token');
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      // Note: We don't throw an error if logout fails on the server
      // because we still want to clear local storage and log out the user
      if (!response.ok) {
        console.warn('Server logout failed, but continuing with local logout');
      }
    } catch (error) {
      // Log the error but don't throw it - we still want to clear local data
      console.warn('Network error during logout, continuing with local logout:', error);
    }
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('sportapp-user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        // Convert date strings back to Date objects
        user.createdAt = new Date(user.createdAt);
        user.lastLoginAt = new Date(user.lastLoginAt);
        dispatch({ type: 'LOAD_USER', payload: user });
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      localStorage.removeItem('sportapp-user');
    }
  }, []);

  // Save user to localStorage whenever user state changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('sportapp-user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('sportapp-user');
    }
  }, [state.user]);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const user = await authAPI.login(email, password);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Login failed' });
    }
  };

  const register = async (userData: RegisterData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const user = await authAPI.register(userData);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Registration failed' });
    }
  };

  const logout = async () => {
    try {
      // Call the logout API endpoint
      await authAPI.logout();
    } catch (error) {
      // Log error but continue with logout
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage and update state
      localStorage.removeItem('sportapp-token');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!state.user) return;
    
    dispatch({ type: 'AUTH_START' });
    try {
      const updatedUser = await authAPI.updateUser(state.user.id, userData);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Update failed' });
    }
  };

  const forgotPassword = async (email: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      await authAPI.forgotPassword(email);
      // You might want to show a success message here
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Password reset failed' });
    }
  };

  const resetPassword = async (token: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      await authAPI.resetPassword(token, password);
      // Redirect to login or auto-login
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Password reset failed' });
    }
  };

  const showAuthModal = (mode: 'login' | 'register' | 'forgot-password') => {
    dispatch({ type: 'SHOW_AUTH_MODAL', payload: mode });
  };

  const hideAuthModal = () => {
    dispatch({ type: 'HIDE_AUTH_MODAL' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    forgotPassword,
    resetPassword,
    openAuthModal: showAuthModal,
    hideAuthModal,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
