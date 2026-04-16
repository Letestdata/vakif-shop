// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vakif_cart')) || []; }
    catch { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('vakif_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
    setTimeout(() => setIsCartOpen(false), 3000);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const updateQuantity = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => setCart([]);

  const cartCount   = cart.reduce((s, i) => s + i.quantity, 0);
  const cartSubtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryCharge = cartSubtotal >= 999 ? 0 : 60;
  const cartTotal   = cartSubtotal + deliveryCharge;

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount, cartSubtotal, deliveryCharge, cartTotal,
      isCartOpen, setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
