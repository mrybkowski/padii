export interface WishlistItem {
  productId: number;
  addedAt: Date;
}

class WishlistManager {
  private storageKey = 'ecommerce-wishlist';

  getWishlist(): WishlistItem[] {
    if (typeof window === 'undefined') {
      return [];
    }

    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      return [];
    }

    try {
      const items = JSON.parse(stored);
      return items.map((item: any) => ({
        ...item,
        addedAt: new Date(item.addedAt)
      }));
    } catch {
      return [];
    }
  }

  addToWishlist(productId: number): WishlistItem[] {
    const items = this.getWishlist();
    
    if (!this.isInWishlist(productId)) {
      const newItem: WishlistItem = {
        productId,
        addedAt: new Date()
      };
      items.push(newItem);
      this.saveWishlist(items);
    }
    
    return items;
  }

  removeFromWishlist(productId: number): WishlistItem[] {
    const items = this.getWishlist().filter(item => item.productId !== productId);
    this.saveWishlist(items);
    return items;
  }

  isInWishlist(productId: number): boolean {
    return this.getWishlist().some(item => item.productId === productId);
  }

  clearWishlist(): WishlistItem[] {
    this.saveWishlist([]);
    return [];
  }

  private saveWishlist(items: WishlistItem[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    }
  }
}

export const wishlistManager = new WishlistManager();