'use client';

import { useState, useEffect, useCallback } from 'react';

interface WCCartItem {
  key: string;
  id: number;
  quantity: number;
  name: string;
  short_description: string;
  description: string;
  sku: string;
  low_stock_remaining: number | null;
  backorders_allowed: boolean;
  show_backorder_badge: boolean;
  sold_individually: boolean;
  permalink: string;
  images: Array<{
    id: number;
    src: string;
    thumbnail: string;
    srcset: string;
    sizes: string;
    name: string;
    alt: string;
  }>;
  variation: Array<{
    attribute: string;
    value: string;
  }>;
  item_data: any[];
  prices: {
    price: string;
    regular_price: string;
    sale_price: string;
    price_range: any;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    currency_decimal_separator: string;
    currency_thousand_separator: string;
    currency_prefix: string;
    currency_suffix: string;
    raw_prices: {
      precision: number;
      price: string;
      regular_price: string;
      sale_price: string;
    };
  };
  totals: {
    line_subtotal: string;
    line_subtotal_tax: string;
    line_total: string;
    line_total_tax: string;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    currency_decimal_separator: string;
    currency_thousand_separator: string;
    currency_prefix: string;
    currency_suffix: string;
  };
  catalog_visibility: string;
  extensions: any;
}

interface WCCart {
  coupons: any[];
  shipping_rates: any[];
  shipping_address: any;
  billing_address: any;
  items: WCCartItem[];
  items_count: number;
  items_weight: number;
  cross_sells: any[];
  needs_payment: boolean;
  needs_shipping: boolean;
  has_calculated_shipping: boolean;
  fees: any[];
  totals: {
    total_items: string;
    total_items_tax: string;
    total_fees: string;
    total_fees_tax: string;
    total_discount: string;
    total_discount_tax: string;
    total_shipping: string;
    total_shipping_tax: string;
    total_price: string;
    total_tax: string;
    tax_lines: any[];
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    currency_decimal_separator: string;
    currency_thousand_separator: string;
    currency_prefix: string;
    currency_suffix: string;
  };
  errors: any[];
  payment_methods: string[];
  payment_requirements: string[];
  extensions: any;
}

export function useWCCart() {
  const [cart, setCart] = useState<WCCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/wordpress/cart');
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const cartData = await response.json();
      setCart(cartData);
    } catch (err: any) {
      console.error('Error fetching cart:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToCart = async (productId: number, quantity: number = 1, variationId?: number) => {
    try {
      setError(null);
      const response = await fetch('/api/wordpress/cart/add-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
          variationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      const result = await response.json();
      await fetchCart(); // Refresh cart
      return result;
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateCartItem = async (key: string, quantity: number) => {
    try {
      setError(null);
      const response = await fetch(`/api/wordpress/cart/items/${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart item');
      }

      const result = await response.json();
      await fetchCart(); // Refresh cart
      return result;
    } catch (err: any) {
      console.error('Error updating cart item:', err);
      setError(err.message);
      throw err;
    }
  };

  const removeCartItem = async (key: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/wordpress/cart/items/${key}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove cart item');
      }

      const result = await response.json();
      await fetchCart(); // Refresh cart
      return result;
    } catch (err: any) {
      console.error('Error removing cart item:', err);
      setError(err.message);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      const response = await fetch('/api/wordpress/cart', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      const result = await response.json();
      await fetchCart(); // Refresh cart
      return result;
    } catch (err: any) {
      console.error('Error clearing cart:', err);
      setError(err.message);
      throw err;
    }
  };

  const formatPrice = (price: string) => {
    if (!cart) return price;
    
    const numPrice = parseFloat(price) / Math.pow(10, cart.totals.currency_minor_unit);
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: cart.totals.currency_code,
    }).format(numPrice);
  };

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return {
    cart,
    isLoading,
    error,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    refreshCart: fetchCart,
    formatPrice,
  };
}