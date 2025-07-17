import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Facebook, Instagram, Youtube } from "lucide-react";

export function HeaderMobileMenu() {
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

          <div className="flex items-center gap-4">
            <Link
              href="https://www.facebook.com/TwojaStrona"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
              >
                <Facebook className="h-4 w-4" />
              </Button>
            </Link>
            <Link
              href="https://www.instagram.com/TwojaStrona"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200"
              >
                <Instagram className="h-4 w-4" />
              </Button>
            </Link>
            <Link
              href="https://www.youtube.com/TwojaStrona"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-red-100 text-red-600 hover:bg-red-200"
              >
                <Youtube className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
