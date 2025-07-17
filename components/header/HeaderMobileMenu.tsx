import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { WishlistSheet } from "../wishlist-sheet";

export function HeaderMobileMenu() {
  const { getWishlistCount } = useWishlist();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col space-y-4 mt-8">
          <Link
            href="/"
            className="text-lg font-medium hover:text-primary transition-colors"
          >
            Strona główna
          </Link>
          <Link
            href="/products"
            className="text-lg font-medium hover:text-primary transition-colors"
          >
            Produkty
          </Link>
          <Link
            href="/contact"
            className="text-lg font-medium hover:text-primary transition-colors"
          >
            Kontakt
          </Link>
          <hr className="my-4" />
          <WishlistSheet>
            <button className="text-lg font-medium hover:text-primary transition-colors text-left w-full">
              Lista życzeń ({getWishlistCount()})
            </button>
          </WishlistSheet>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
