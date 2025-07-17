"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, ShoppingBag, Trash2, ShoppingCart } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { useEffect } from "react";
import { Product, wordpressAPI } from "@/lib/wordpress";

interface WishlistSheetProps {
  children: React.ReactNode;
}

export function WishlistSheet({ children }: WishlistSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    const loadWishlistProducts = async () => {
      if (wishlist.length === 0) {
        setProducts([]);
        return;
      }

      setIsLoading(true);
      try {
        const productIds = wishlist.map((item) => item.productId);
        const allProducts = await wordpressAPI.getProducts({ per_page: 100 });
        const wishlistProducts = allProducts.filter((product) =>
          productIds.includes(product.id)
        );
        setProducts(wishlistProducts);
      } catch (error) {
        console.error("Error loading wishlist products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadWishlistProducts();
    }
  }, [wishlist, isOpen]);

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(numPrice);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  const handleRemoveFromWishlist = (productId: number) => {
    removeFromWishlist(productId);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Lista życzeń ({wishlist.length})
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Lista życzeń jest pusta
            </h3>
            <p className="text-muted-foreground mb-6">
              Dodaj produkty do listy życzeń klikając ikonę serca
            </p>
            <Button asChild onClick={() => setIsOpen(false)}>
              <Link href="/products">Przeglądaj produkty</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 pr-6">
              <div className="space-y-4">
                {products.map((product) => {
                  const regularPrice = parseFloat(product.regular_price || "0");
                  const salePrice = parseFloat(product.sale_price || "0");
                  const isOnSale = salePrice > 0 && salePrice < regularPrice;
                  const discount = isOnSale
                    ? Math.round(
                        ((regularPrice - salePrice) / regularPrice) * 100
                      )
                    : 0;

                  return (
                    <div
                      key={product.id}
                      className="flex gap-4 p-4 border rounded-lg"
                    >
                      <div className="relative h-16 w-16 flex-shrink-0">
                        <Image
                          src={
                            product.images[0]?.src || "/placeholder-product.jpg"
                          }
                          alt={product.images[0]?.alt || product.name}
                          fill
                          className="object-cover rounded"
                          sizes="64px"
                        />
                        {isOnSale && (
                          <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1">
                            -{discount}%
                          </Badge>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link
                              href={`/products/${product.slug}`}
                              onClick={() => setIsOpen(false)}
                            >
                              <h4 className="font-medium text-sm leading-tight line-clamp-2 hover:text-primary transition-colors">
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: product.name,
                                  }}
                                />
                              </h4>
                            </Link>
                            {product.categories.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {product.categories
                                  .slice(0, 2)
                                  .map((category) => (
                                    <Badge
                                      key={category.id}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {category.name}
                                    </Badge>
                                  ))}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFromWishlist(product.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isOnSale ? (
                              <>
                                <span className="font-semibold text-sm text-primary">
                                  {formatPrice(product.sale_price)}
                                </span>
                                <span className="text-xs text-muted-foreground line-through">
                                  {formatPrice(product.regular_price)}
                                </span>
                              </>
                            ) : (
                              <span className="font-semibold text-sm">
                                {formatPrice(product.regular_price)}
                              </span>
                            )}
                          </div>

                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock_status !== "instock"}
                            className="h-8 text-xs"
                          >
                            {isInCart(product.id) ? (
                              <>
                                <ShoppingCart className="h-3 w-3 mr-1" />W
                                koszyku
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="h-3 w-3 mr-1" />
                                Dodaj
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Stock status */}
                        <div className="text-xs">
                          {product.stock_status === "instock" ? (
                            <span className="text-green-600">✓ Dostępny</span>
                          ) : (
                            <span className="text-red-600">
                              ✗ Brak w magazynie
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="border-t py-4 space-y-3">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Produktów w liście:</span>
                <span className="font-medium">{wishlist.length}</span>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setIsOpen(false)}
                  asChild
                >
                  <Link href="/wishlist">Zobacz pełną listę</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                  asChild
                >
                  <Link href="/products">Przeglądaj produkty</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
