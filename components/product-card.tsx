'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/wordpress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    
    try {
      addToCart(product, 1);
      
      // Simple success feedback
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(numPrice);
  };

  const regularPrice = parseFloat(product.regular_price || '0');
  const salePrice = parseFloat(product.sale_price || '0');
  const isOnSale = salePrice > 0 && salePrice < regularPrice;
  const discount = isOnSale ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0;

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        "border-0 bg-white/80 backdrop-blur-sm",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden">
          {/* Product Image */}
          <Image
            src={product.images[0]?.src || '/placeholder-product.jpg'}
            alt={product.images[0]?.alt || product.name}
            fill
            className={cn(
              "object-cover transition-transform duration-500",
              isHovered ? "scale-105" : "scale-100"
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.featured && (
              <Badge variant="destructive" className="text-xs font-medium">
                Polecane
              </Badge>
            )}
            {isOnSale && (
              <Badge variant="secondary" className="text-xs font-medium bg-green-100 text-green-800">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm",
              "transition-all duration-200 hover:bg-white hover:scale-110",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
              isInWishlist(product.id) && "text-red-500"
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
          >
            <Heart className={cn(
              "h-4 w-4 transition-all",
              isInWishlist(product.id) && "fill-current"
            )} />
          </Button>

          {/* Quick Add to Cart */}
          <div className={cn(
            "absolute inset-x-3 bottom-3 transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <Button
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stock_status !== 'instock'}
              className={cn(
                "w-full bg-primary text-primary-foreground hover:bg-primary/90",
                "transition-all duration-200 hover:scale-105",
                isAddingToCart && "bg-green-600 hover:bg-green-600"
              )}
            >
              {isAddingToCart ? (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Dodano!
                </>
              ) : isInCart(product.id) ? (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  W koszyku
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Dodaj do koszyka
                </>
              )}
            </Button>
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Product Categories */}
          {product.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.categories.slice(0, 2).map((category) => (
                <Badge key={category.id} variant="outline" className="text-xs">
                  {category.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Product Name */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">(24)</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {isOnSale ? (
              <>
                <span className="font-bold text-lg text-primary">
                  {formatPrice(product.sale_price)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.regular_price)}
                </span>
              </>
            ) : (
              <span className="font-bold text-lg">
                {formatPrice(product.regular_price)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="text-xs">
            {product.stock_status === 'instock' ? (
              <span className="text-green-600">Dostępny</span>
            ) : (
              <span className="text-red-600">Brak</span>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}