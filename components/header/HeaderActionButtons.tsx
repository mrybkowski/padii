"use client";

import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, Heart, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { CartSheet } from "../cart-sheet";
import { WishlistSheet } from "../wishlist-sheet";
import { HeaderMobileMenu } from "./HeaderMobileMenu";

export function HeaderActionButtons() {
  const { cart } = useCart();
  const { getWishlistCount } = useWishlist();

  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="icon" className="md:hidden">
        <Search className="h-5 w-5" />
      </Button>

      <WishlistSheet>
        <Button variant="ghost" size="icon" className="hidden md:flex relative">
          <Heart className="h-5 w-5" />
          {getWishlistCount() > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {getWishlistCount() > 99 ? "99+" : getWishlistCount()}
            </Badge>
          )}
        </Button>
      </WishlistSheet>

      <CartSheet>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cart.itemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {cart.itemCount > 99 ? "99+" : cart.itemCount}
            </Badge>
          )}
        </Button>
      </CartSheet>

      <HeaderMobileMenu />
    </div>
  );
}
