"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ShoppingBag, ArrowLeft } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { Product, wordpressAPI } from "@/lib/wordpress";
import { ProductGrid } from "@/components/product-grid";
import { Header } from "@/components/Header";

export default function WishlistPage() {
  const { wishlist, clearWishlist, isLoading: wishlistLoading } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWishlistProducts = async () => {
      if (wishlist.length === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

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

    if (!wishlistLoading) {
      loadWishlistProducts();
    }
  }, [wishlist, wishlistLoading]);

  if (wishlistLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-300 animate-pulse rounded-lg h-[400px]"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            Lista życzeń
          </h1>
          <p className="text-muted-foreground">
            Twoje ulubione produkty ({wishlist.length})
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Lista życzeń jest pusta</h2>
            <p className="text-muted-foreground mb-8">
              Dodaj produkty do listy życzeń, klikając ikonę serca na produktach
            </p>
            <Button asChild size="lg">
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Przeglądaj produkty
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Polubione produkty ({products.length})</CardTitle>
                  <Button
                    variant="outline"
                    onClick={clearWishlist}
                    className="text-red-600 hover:text-red-700"
                  >
                    Wyczyść listę
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ProductGrid products={products} isLoading={false} />
              </CardContent>
            </Card>

            <div className="text-center">
              <Button variant="outline" asChild>
                <Link href="/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kontynuuj zakupy
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
