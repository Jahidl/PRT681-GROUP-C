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

// Mock API functions - In a real app, these would call your backend API
const mockAuthAPI = {
  async login(email: string, password: string): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (email === 'demo@sportapp.com' && password === 'demo123') {
      const user: User = {
        id: '1',
        email: 'demo@sportapp.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1 (555) 123-4567',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        addresses: [
          {
            id: '1',
            type: 'billing',
            firstName: 'John',
            lastName: 'Doe',
            addressLine1: '123 Main Street',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'United States',
            isDefault: true
          }
        ],
        preferences: {
          newsletter: true,
          smsNotifications: false,
          emailNotifications: true,
          currency: 'USD',
          language: 'en',
          theme: 'auto'
        },
        createdAt: new Date('2023-01-15'),
        lastLoginAt: new Date()
      };
      return user;
    } else {
      throw new Error('Invalid email or password');
    }
  },

  async register(userData: RegisterData): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Mock user creation
    const user: User = {
      id: Date.now().toString(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      addresses: [],
      preferences: {
        newsletter: userData.newsletter || false,
        smsNotifications: false,
        emailNotifications: true,
        currency: 'USD',
        language: 'en',
        theme: 'auto'
      },
      createdAt: new Date(),
      lastLoginAt: new Date()
    };
    return user;
  },

  async updateUser(_userId: string, userData: Partial<User>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real app, this would update the user in the database
    const currentUser = JSON.parse(localStorage.getItem('sportapp-user') || '{}');
    const updatedUser = { ...currentUser, ...userData };
    return updatedUser;
  },

  async forgotPassword(email: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Mock password reset email
    console.log(`Password reset email sent to ${email}`);
  },

  async resetPassword(_token: string, _password: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Mock password reset
    console.log(`Password reset for token ${_token}`);
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
      const user = await mockAuthAPI.login(email, password);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Login failed' });
    }
  };

  const register = async (userData: RegisterData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const user = await mockAuthAPI.register(userData);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Registration failed' });
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!state.user) return;
    
    dispatch({ type: 'AUTH_START' });
    try {
      const updatedUser = await mockAuthAPI.updateUser(state.user.id, userData);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Update failed' });
    }
  };

  const forgotPassword = async (email: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      await mockAuthAPI.forgotPassword(email);
      // You might want to show a success message here
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Password reset failed' });
    }
  };

  const resetPassword = async (token: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      await mockAuthAPI.resetPassword(token, password);
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
