"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Share2,
  Star,
  ShoppingCart,
  Minus,
  Plus,
  Shield,
  Truck,
  RotateCcw,
} from "lucide-react";
import { Product, wordpressAPI } from "@/lib/wordpress";
import { useCart } from "@/hooks/use-cart";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/hooks/use-wishlist";
import { Footer } from "@/components/Footer";

export default function ProductPage() {
  const params = useParams();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart, isInCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const products = await wordpressAPI.getProductBySlug(
          params.slug as string
        );
        setProduct(products[0] || null);
      } catch (error) {
        console.error("Error loading product:", error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.slug) {
      loadProduct();
    }
  }, [params.slug]);

  const handleAddToCart = async () => {
    if (!product || isAddingToCart) return;

    setIsAddingToCart(true);

    try {
      addToCart(product, quantity);

      setTimeout(() => {
        setIsAddingToCart(false);
      }, 1000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(numPrice);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gray-300 aspect-square rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                <div className="h-24 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Produkt nie znaleziony</h1>
          <Button asChild>
            <Link href="/products">Powrót do produktów</Link>
          </Button>
        </div>
      </div>
    );
  }

  const regularPrice = parseFloat(product.regular_price || "0");
  const salePrice = parseFloat(product.sale_price || "0");
  const isOnSale = salePrice > 0 && salePrice < regularPrice;
  const discount = isOnSale
    ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
    : 0;

  console.log("product: ", product);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8 pb-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            Strona główna
          </Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-primary">
            Produkty
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-white">
              <Image
                src={
                  product.images[selectedImageIndex]?.src ||
                  "/placeholder-product.jpg"
                }
                alt={product.images[selectedImageIndex]?.alt || product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {isOnSale && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                  -{discount}%
                </Badge>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                      selectedImageIndex === index
                        ? "border-primary"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.categories.map((category) => (
                  <Badge key={category.id} variant="outline">
                    {category.name}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < 4
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    (47 opinii)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                {isOnSale ? (
                  <>
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(product.sale_price)}
                    </span>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(product.regular_price)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold">
                    {formatPrice(product.regular_price)}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {product.short_description}
              </p>
            </div>

            <Separator />

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Ilość:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= (product.stock_quantity || 99)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={
                    isAddingToCart || product.stock_status !== "instock"
                  }
                  className={cn(
                    "flex-1 text-lg py-6",
                    isAddingToCart && "bg-green-600 hover:bg-green-600"
                  )}
                  size="lg"
                >
                  {isAddingToCart ? (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Dodano do koszyka!
                    </>
                  ) : isInCart(product.id) ? (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Już w koszyku
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Dodaj do koszyka
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="px-6"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                >
                  <Heart
                    className={cn(
                      "h-5 w-5 transition-all",
                      isInWishlist(product.id) && "fill-current"
                    )}
                  />
                </Button>

                <Button variant="outline" size="lg" className="px-6">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium text-sm">Darmowa dostawa</div>
                  <div className="text-xs text-muted-foreground">od 200 zł</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <RotateCcw className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium text-sm">30 dni zwrotu</div>
                  <div className="text-xs text-muted-foreground">bez pytań</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium text-sm">Gwarancja</div>
                  <div className="text-xs text-muted-foreground">
                    24 miesiące
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Opis</TabsTrigger>
              <TabsTrigger value="specifications">Specyfikacja</TabsTrigger>
              <TabsTrigger value="reviews">Opinie (47)</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Materiał</h4>
                        <p className="text-muted-foreground">100% poliester</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Pochodzenie</h4>
                        <p className="text-muted-foreground">Polska</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Kod produktu</h4>
                        <p className="text-muted-foreground">KZ-2024-001</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Dostępne rozmiary</h4>
                        <p className="text-muted-foreground">S, M, L, XL</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold">4.2</div>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < 4
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          47 opinii
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="border-b pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="font-medium">Anna K.</div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-3 w-3 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          Świetna jakość i szybka dostawa. Polecam!
                        </p>
                      </div>

                      <div className="border-b pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="font-medium">Piotr M.</div>
                          <div className="flex items-center gap-1">
                            {[...Array(4)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-3 w-3 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                            <Star className="h-3 w-3 text-gray-300" />
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          Produkt zgodny z opisem, bardzo ciepły i wygodny.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}
