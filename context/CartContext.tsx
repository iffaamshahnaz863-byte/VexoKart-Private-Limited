import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { CartItem, Product } from '../types.ts';
import { useAuth } from './AuthContext.tsx';
import { BASE_API_URL, API_HEADERS } from '../constants.ts';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const local = localStorage.getItem('vexokart-cart');
    if (local) setCartItems(JSON.parse(local));
  }, []);

  useEffect(() => {
    localStorage.setItem('vexokart-cart', JSON.stringify(cartItems));
    
    if (user) {
      const syncCart = async () => {
        try {
          await fetch(`${BASE_API_URL}/carts?email=eq.${encodeURIComponent(user.email)}`, {
            method: 'POST',
            headers: { ...API_HEADERS, 'Prefer': 'resolution=merge-duplicates' },
            body: JSON.stringify({ 
              email: user.email, 
              items: cartItems, 
              updatedAt: new Date().toISOString() 
            })
          });
        } catch (e) {
          console.warn("Cart background sync deferred:", e);
        }
      };
      syncCart();
    }
  }, [cartItems, user]);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => setCartItems(prev => prev.filter(i => i.id !== id));

  const updateQuantity = (id: number, q: number) => {
    if (q <= 0) return removeFromCart(id);
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: q } : i));
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const cartTotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};