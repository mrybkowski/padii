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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

interface CartSheetProps {
  children: React.ReactNode;
}

export function CartSheet({ children }: CartSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, updateQuantity, removeFromCart } = useCart();

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(numPrice);
  };

  const handleQuantityChange = (
    productId: number,
    newQuantity: number,
    variationId?: number
  ) => {
    if (newQuantity === 0) {
      removeFromCart(productId, variationId);
    } else {
      updateQuantity(productId, newQuantity, variationId);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Koszyk ({cart.itemCount})
          </SheetTitle>
        </SheetHeader>

        {cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Koszyk jest pusty</h3>
            <p className="text-muted-foreground mb-6">
              Dodaj produkty, aby kontynuować zakupy
            </p>
            <Button asChild onClick={() => setIsOpen(false)}>
              <Link href="/products">Przeglądaj produkty</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 pr-6">
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.variationId || ""}`}
                    className="flex gap-4 p-4 border rounded-lg"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <Image
                        src={
                          item.product.images[0]?.src ||
                          "/placeholder-product.jpg"
                        }
                        alt={item.product.images[0]?.alt || item.product.name}
                        fill
                        className="object-cover rounded"
                        sizes="64px"
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-sm leading-tight line-clamp-2">
                            <span
                              dangerouslySetInnerHTML={{
                                __html: item.product.name,
                              }}
                            />
                          </h4>
                          {item.selectedAttributes && (
                            <div className="flex gap-1 mt-1">
                              {Object.entries(item.selectedAttributes).map(
                                ([key, value]) => (
                                  <Badge
                                    key={key}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {value}
                                  </Badge>
                                )
                              )}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            removeFromCart(item.product.id, item.variationId)
                          }
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              handleQuantityChange(
                                item.product.id,
                                item.quantity - 1,
                                item.variationId
                              )
                            }
                            className="h-8 w-8"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              handleQuantityChange(
                                item.product.id,
                                item.quantity + 1,
                                item.variationId
                              )
                            }
                            className="h-8 w-8"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <div className="font-semibold text-sm">
                            {formatPrice(
                              (
                                parseFloat(
                                  item.product.sale_price ||
                                    item.product.regular_price ||
                                    "0"
                                ) * item.quantity
                              ).toString()
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatPrice(
                              item.product.sale_price ||
                                item.product.regular_price ||
                                "0"
                            )}{" "}
                            każdy
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t py-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Razem:</span>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(cart.total.toString())}
                </span>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setIsOpen(false)}
                  asChild
                >
                  <Link href="/checkout">Przejdź do kasy</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                  asChild
                >
                  <Link href="/cart">Zobacz koszyk</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
