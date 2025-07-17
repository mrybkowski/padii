'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Header } from '@/components/header';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const [couponCode, setCouponCode] = useState('');

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(numPrice);
  };

  const handleQuantityChange = (productId: number, newQuantity: number, variationId?: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId, variationId);
    } else {
      updateQuantity(productId, newQuantity, variationId);
    }
  };

  const calculateShipping = () => {
    return cart.total >= 200 ? 0 : 15;
  };

  const calculateTotal = () => {
    return cart.total + calculateShipping();
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-4">Koszyk jest pusty</h1>
            <p className="text-muted-foreground mb-8">
              Dodaj produkty do koszyka, aby kontynuować zakupy
            </p>
            <Button asChild size="lg">
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Przeglądaj produkty
              </Link>
            </Button>
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
          <h1 className="text-3xl font-bold mb-2">Koszyk</h1>
          <p className="text-muted-foreground">Zarządzaj produktami w koszyku</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Produkty w koszyku ({cart.itemCount})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.items.map((item) => (
                  <div key={`${item.product.id}-${item.variationId || ''}`} className="flex gap-4 p-4 border rounded-lg">
                    <div className="relative h-20 w-20 flex-shrink-0">
                      <Image
                        src={item.product.images[0]?.src || '/placeholder-product.jpg'}
                        alt={item.product.images[0]?.alt || item.product.name}
                        fill
                        className="object-cover rounded"
                        sizes="80px"
                      />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href={`/products/${item.product.slug}`}>
                            <h3 className="font-medium hover:text-primary transition-colors line-clamp-2">
                              {item.product.name}
                            </h3>
                          </Link>
                          {item.selectedAttributes && (
                            <div className="flex gap-1 mt-1">
                              {Object.entries(item.selectedAttributes).map(([key, value]) => (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {value}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.product.id, item.variationId)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1, item.variationId)}
                            className="h-8 w-8"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1, item.variationId)}
                            className="h-8 w-8"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatPrice((parseFloat(item.product.sale_price || item.product.regular_price || '0') * item.quantity).toString())}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatPrice(item.product.sale_price || item.product.regular_price || '0')} każdy
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Button variant="outline" asChild>
                <Link href="/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kontynuuj zakupy
                </Link>
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Podsumowanie zamówienia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coupon */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kod rabatowy</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Wprowadź kod"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button variant="outline">Zastosuj</Button>
                  </div>
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Produkty</span>
                    <span>{formatPrice(cart.total.toString())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dostawa</span>
                    <span>
                      {cart.total >= 200 ? (
                        <span className="text-green-600">Darmowa</span>
                      ) : (
                        formatPrice(calculateShipping().toString())
                      )}
                    </span>
                  </div>
                  {cart.total >= 200 && (
                    <div className="text-sm text-green-600">
                      🎉 Masz darmową dostawę!
                    </div>
                  )}
                  {cart.total < 200 && (
                    <div className="text-sm text-muted-foreground">
                      Dodaj produkty za {formatPrice((200 - cart.total).toString())} aby otrzymać darmową dostawę
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Razem</span>
                    <span>{formatPrice(calculateTotal().toString())}</span>
                  </div>
                </div>

                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout">
                    Przejdź do kasy
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                {/* Security badges */}
                <div className="pt-4 border-t">
                  <div className="text-xs text-muted-foreground text-center space-y-1">
                    <div>🔒 Bezpieczne płatności</div>
                    <div>📦 Darmowa dostawa od 200 zł</div>
                    <div>↩️ 30 dni na zwrot</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}