import Link from "next/link";

export function HeaderDesktopNav() {
  return (
    <nav className="hidden md:flex items-center space-x-8">
      <Link
        href="/"
        className="text-sm font-medium hover:text-primary transition-colors"
      >
        Strona główna
      </Link>
      <Link
        href="/products"
        className="text-sm font-medium hover:text-primary transition-colors"
      >
        Produkty
      </Link>
      <Link
        href="/blog"
        className="text-sm font-medium hover:text-primary transition-colors"
      >
        Blog
      </Link>
      <Link
        href="/contact"
        className="text-sm font-medium hover:text-primary transition-colors"
      >
        Kontakt
      </Link>
    </nav>
  );
}
