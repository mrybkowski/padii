import { Product } from './wordpress';

export interface CartItem {
  product: Product;
  quantity: number;
  variationId?: number;
  selectedAttributes?: Record<string, string>;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

class CartManager {
  private storageKey = 'ecommerce-cart';

  getCart(): Cart {
    if (typeof window === 'undefined') {
      return { items: [], total: 0, itemCount: 0 };
    }

    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      return { items: [], total: 0, itemCount: 0 };
    }

    try {
      const items: CartItem[] = JSON.parse(stored);
      return this.calculateCart(items);
    } catch {
      return { items: [], total: 0, itemCount: 0 };
    }
  }

  addToCart(product: Product, quantity: number = 1, variationId?: number, selectedAttributes?: Record<string, string>): Cart {
    const items = this.getCart().items;
    
    const existingItemIndex = items.findIndex(item => 
      item.product.id === product.id && 
      item.variationId === variationId
    );

    if (existingItemIndex >= 0) {
      items[existingItemIndex].quantity += quantity;
    } else {
      items.push({
        product,
        quantity,
        variationId,
        selectedAttributes
      });
    }

    this.saveCart(items);
    return this.calculateCart(items);
  }

  updateQuantity(productId: number, quantity: number, variationId?: number): Cart {
    const items = this.getCart().items;
    
    const itemIndex = items.findIndex(item => 
      item.product.id === productId && 
      item.variationId === variationId
    );

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        items.splice(itemIndex, 1);
      } else {
        items[itemIndex].quantity = quantity;
      }
    }

    this.saveCart(items);
    return this.calculateCart(items);
  }

  removeFromCart(productId: number, variationId?: number): Cart {
    const items = this.getCart().items.filter(item => 
      !(item.product.id === productId && item.variationId === variationId)
    );

    this.saveCart(items);
    return this.calculateCart(items);
  }

  clearCart(): Cart {
    this.saveCart([]);
    return { items: [], total: 0, itemCount: 0 };
  }

  private calculateCart(items: CartItem[]): Cart {
    const total = items.reduce((sum, item) => {
      const price = parseFloat(item.product.sale_price || item.product.regular_price || '0');
      return sum + (price * item.quantity);
    }, 0);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return { items, total, itemCount };
  }

  private saveCart(items: CartItem[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    }
  }
}

export const cartManager = new CartManager();