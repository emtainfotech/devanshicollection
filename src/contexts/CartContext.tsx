import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  discount: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  couponDiscount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'APPLY_COUPON'; payload: { code: string; discount: number } }
  | { type: 'REMOVE_COUPON' }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

const initialState: CartState = {
  items: [],
  couponCode: null,
  couponDiscount: 0,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(
        (i) => i.productId === action.payload.productId && i.size === action.payload.size && i.color === action.payload.color
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === existing.id ? { ...i, quantity: i.quantity + action.payload.quantity } : i
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, quantity: Math.max(1, action.payload.quantity) } : i
        ),
      };
    case 'APPLY_COUPON':
      return { ...state, couponCode: action.payload.code, couponDiscount: action.payload.discount };
    case 'REMOVE_COUPON':
      return { ...state, couponCode: null, couponDiscount: 0 };
    case 'CLEAR_CART':
      return initialState;
    case 'LOAD_CART':
      return action.payload;
    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        dispatch({ type: 'LOAD_CART', payload: JSON.parse(saved) });
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  const addItem = (item: CartItem) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQuantity = (id: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  const applyCoupon = (code: string, discount: number) =>
    dispatch({ type: 'APPLY_COUPON', payload: { code, discount } });
  const removeCoupon = () => dispatch({ type: 'REMOVE_COUPON' });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => {
    const discountedPrice = i.price * (1 - i.discount / 100);
    return sum + discountedPrice * i.quantity;
  }, 0);
  const total = subtotal * (1 - state.couponDiscount / 100);

  return (
    <CartContext.Provider
      value={{ state, addItem, removeItem, updateQuantity, applyCoupon, removeCoupon, clearCart, itemCount, subtotal, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
