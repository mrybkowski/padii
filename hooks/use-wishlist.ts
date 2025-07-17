'use client';

import { useState, useEffect, useCallback } from 'react';
import { wishlistManager, WishlistItem } from '@/lib/wishlist';

export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setWishlist(wishlistManager.getWishlist());
    setIsLoading(false);

    // Listen for wishlist updates from other components
    const handleWishlistUpdate = (event: CustomEvent) => {
      setWishlist(event.detail);
    };

    window.addEventListener('wishlist-updated', handleWishlistUpdate as EventListener);
    
    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdate as EventListener);
    };
  }, []);

  const refreshWishlist = useCallback(() => {
    const updatedWishlist = wishlistManager.getWishlist();
    setWishlist(updatedWishlist);
    window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: updatedWishlist }));
  }, []);

  const addToWishlist = (productId: number) => {
    const updatedWishlist = wishlistManager.addToWishlist(productId);
    setWishlist(updatedWishlist);
    
    window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: updatedWishlist }));
  };

  const removeFromWishlist = (productId: number) => {
    const updatedWishlist = wishlistManager.removeFromWishlist(productId);
    setWishlist(updatedWishlist);
    
    window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: updatedWishlist }));
  };

  const toggleWishlist = (productId: number) => {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const clearWishlist = () => {
    const updatedWishlist = wishlistManager.clearWishlist();
    setWishlist(updatedWishlist);
    
    window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: updatedWishlist }));
  };

  const isInWishlist = (productId: number) => {
    return wishlist.some(item => item.productId === productId);
  };

  const getWishlistCount = () => {
    return wishlist.length;
  };

  return {
    wishlist,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount,
    refreshWishlist
  };
}