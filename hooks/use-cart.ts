'use client';

import { useState, useEffect, useCallback } from 'react';
import { cartManager, Cart, CartItem } from '@/lib/cart';
import { Product } from '@/lib/wordpress';

export function useCart() {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, itemCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCart(cartManager.getCart());
    setIsLoading(false);

    // Listen for cart updates from other components
    const handleCartUpdate = (event: CustomEvent) => {
      setCart(event.detail);
    };

    window.addEventListener('cart-updated', handleCartUpdate as EventListener);
    
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate as EventListener);
    };
  }, []);

  const refreshCart = useCallback(() => {
    const updatedCart = cartManager.getCart();
    setCart(updatedCart);
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: updatedCart }));
  }, []);

  const addToCart = (product: Product, quantity: number = 1, variationId?: number, selectedAttributes?: Record<string, string>) => {
    const updatedCart = cartManager.addToCart(product, quantity, variationId, selectedAttributes);
    setCart(updatedCart);
    
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: updatedCart }));
  };

  const updateQuantity = (productId: number, quantity: number, variationId?: number) => {
    const updatedCart = cartManager.updateQuantity(productId, quantity, variationId);
    setCart(updatedCart);
    
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: updatedCart }));
  };

  const removeFromCart = (productId: number, variationId?: number) => {
    const updatedCart = cartManager.removeFromCart(productId, variationId);
    setCart(updatedCart);
    
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: updatedCart }));
  };

  const clearCart = () => {
    const updatedCart = cartManager.clearCart();
    setCart(updatedCart);
    
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: updatedCart }));
  };

  const isInCart = (productId: number, variationId?: number) => {
    return cart.items.some(item => 
      item.product.id === productId && item.variationId === variationId
    );
  };

  const getCartItem = (productId: number, variationId?: number) => {
    return cart.items.find(item => 
      item.product.id === productId && item.variationId === variationId
    );
  };

  return {
    cart,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isInCart,
    getCartItem,
    refreshCart
  };
}