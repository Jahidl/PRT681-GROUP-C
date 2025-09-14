import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Product } from '../types/product';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  addedAt: Date;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number; selectedSize?: string; selectedColor?: string } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextType extends CartState {
  addItem: (product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const generateCartItemId = (productId: string, selectedSize?: string, selectedColor?: string): string => {
  return `${productId}-${selectedSize || 'default'}-${selectedColor || 'default'}`;
};

const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  return { totalItems, totalPrice };
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity, selectedSize, selectedColor } = action.payload;
      const itemId = generateCartItemId(product.id, selectedSize, selectedColor);
      
      const existingItemIndex = state.items.findIndex(item => item.id === itemId);
      
      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          id: itemId,
          product,
          quantity,
          selectedSize,
          selectedColor,
          addedAt: new Date()
        };
        newItems = [...state.items, newItem];
      }
      
      const totals = calculateTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        ...totals
      };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.id);
      const totals = calculateTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        ...totals
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        const newItems = state.items.filter(item => item.id !== id);
        const totals = calculateTotals(newItems);
        
        return {
          ...state,
          items: newItems,
          ...totals
        };
      }
      
      const newItems = state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      const totals = calculateTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        ...totals
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0
      };
    
    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen
      };
    
    case 'OPEN_CART':
      return {
        ...state,
        isOpen: true
      };
    
    case 'CLOSE_CART':
      return {
        ...state,
        isOpen: false
      };
    
    case 'LOAD_CART': {
      const items = action.payload;
      const totals = calculateTotals(items);
      
      return {
        ...state,
        items,
        ...totals
      };
    }
    
    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
  isOpen: false,
  totalItems: 0,
  totalPrice: 0
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('sportapp-cart');
      if (savedCart) {
        const cartItems: CartItem[] = JSON.parse(savedCart).map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('sportapp-cart', JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state.items]);

  const addItem = (product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => {
    dispatch({ 
      type: 'ADD_ITEM', 
      payload: { product, quantity, selectedSize, selectedColor } 
    });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  const contextValue: CartContextType = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
